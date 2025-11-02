import { OpenAI } from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { getAgent, AgentOrchestrator } from '@/lib/ai/agents';
import { getToolsForAgent } from '@/lib/ai/tools';
import { logger, clientLogger } from '@/lib/logger';
import { queryVectors, createEmbedding, storeDocument } from '@/lib/vector/pinecone';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { messages, agentId, useTools } = await req.json();

    // Get the selected agent or use default
    const agent = getAgent(agentId || 'orchestrator');
    if (!agent) {
      return new Response('Agent not found', { status: 404 });
    }

    // Get the latest user message for context retrieval
    const latestUserMessage = messages
      .filter((m: any) => m.role === 'user')
      .pop();
    
    let conversationHistoryContext = '';
    let contextAnswers: Map<string, string> = new Map(); // Store direct answers from context
    
    // Retrieve ALL conversation history from Pinecone using multiple strategies
    try {
      const allMatches = new Map<string, any>();
      
      // Strategy 1: Query with current user message (semantic search)
      if (latestUserMessage?.content) {
        try {
          const queryText = typeof latestUserMessage.content === 'string' 
            ? latestUserMessage.content 
            : JSON.stringify(latestUserMessage.content);
          
          const queryEmbedding = await createEmbedding(queryText);
          const results = await queryVectors(queryEmbedding, 100); // Get many results
          
          results.forEach((match: any) => {
            if (match.id && match.metadata?.role && (match.metadata.role === 'user' || match.metadata.role === 'assistant') && match.metadata?.text) {
              let timestamp = 0;
              if (match.metadata?.timestamp) {
                timestamp = typeof match.metadata.timestamp === 'number' 
                  ? match.metadata.timestamp 
                  : new Date(match.metadata.timestamp).getTime();
              }
              if (timestamp > 0 && !isNaN(timestamp)) {
                allMatches.set(match.id, {
                  role: match.metadata.role,
                  content: match.metadata.text,
                  timestamp,
                  conversationId: match.metadata.conversationId,
                  score: match.score || 0,
                });
              }
            }
          });
        } catch (error) {
          logger.warn('Failed semantic query:', error);
        }
      }
      
      // Strategy 2: Query with multiple generic embeddings to get comprehensive results
      const queryStrategies = [
        'conversation history',
        'user assistant chat',
        'previous discussion',
        'past conversation',
        'chat history',
      ];
      
      for (const queryStr of queryStrategies) {
        try {
          const queryEmbedding = await createEmbedding(queryStr);
          const results = await queryVectors(queryEmbedding, 100);
          
          results.forEach((match: any) => {
            if (match.id && match.metadata?.role && (match.metadata.role === 'user' || match.metadata.role === 'assistant') && match.metadata?.text) {
              // Only add if not already present or if this has higher score
              const existing = allMatches.get(match.id);
              if (!existing || (match.score || 0) > existing.score) {
                let timestamp = 0;
                if (match.metadata?.timestamp) {
                  timestamp = typeof match.metadata.timestamp === 'number' 
                    ? match.metadata.timestamp 
                    : new Date(match.metadata.timestamp).getTime();
                }
                if (timestamp > 0 && !isNaN(timestamp)) {
                  allMatches.set(match.id, {
                    role: match.metadata.role,
                    content: match.metadata.text,
                    timestamp,
                    conversationId: match.metadata.conversationId,
                    score: match.score || 0,
                  });
                }
              }
            }
          });
        } catch (error) {
          logger.warn(`Failed query with "${queryStr}":`, error);
        }
      }
      
      if (allMatches.size > 0) {
        // Convert to array, filter valid, and sort by timestamp (latest first)
        const conversations = Array.from(allMatches.values())
          .filter((conv: any) => conv.content && conv.content.trim().length > 0 && conv.timestamp > 0)
          .sort((a: any, b: any) => b.timestamp - a.timestamp) // Latest first
          .slice(0, 50); // Get last 50 most recent conversations
        
        // Group by conversation ID
        const conversationGroups = new Map<string, Array<{ role: string; content: string; timestamp: number }>>();
        
        conversations.forEach((conv: any) => {
          const convId = conv.conversationId || 'unknown';
          if (!conversationGroups.has(convId)) {
            conversationGroups.set(convId, []);
          }
          conversationGroups.get(convId)!.push(conv);
        });
        
        // Sort groups by latest timestamp and get most recent
        const sortedConversations = Array.from(conversationGroups.values())
          .map(group => ({
            conversations: group.sort((a, b) => a.timestamp - b.timestamp), // Chronological within group
            latestTimestamp: Math.max(...group.map(c => c.timestamp))
          }))
          .sort((a, b) => b.latestTimestamp - a.latestTimestamp) // Latest groups first
          .slice(0, 15) // Get 15 most recent conversation groups
          .flatMap(group => group.conversations)
          .sort((a, b) => a.timestamp - b.timestamp); // Final chronological sort
        
        if (sortedConversations.length > 0) {
          // Extract answers for common questions by finding question-answer pairs
          const userQuestion = latestUserMessage?.content?.toLowerCase() || '';
          
          // Look for question-answer patterns in the history
          for (let i = 0; i < sortedConversations.length - 1; i++) {
            const userMsg = sortedConversations[i];
            const assistantMsg = sortedConversations[i + 1];
            
            if (userMsg.role === 'user' && assistantMsg.role === 'assistant') {
              const userMsgLower = userMsg.content.toLowerCase();
              
              // Check if this question in history matches current question
              const isSimilarQuestion = 
                (userQuestion.includes('name') && userMsgLower.includes('name')) ||
                (userQuestion.includes('who') && userMsgLower.includes('who')) ||
                (userQuestion.includes('role') && userMsgLower.includes('role')) ||
                (userQuestion.includes('what') && userMsgLower.includes('what')) ||
                (userQuestion.length > 10 && userMsgLower.includes(userQuestion.substring(0, 15)));
              
              if (isSimilarQuestion) {
                contextAnswers.set(userQuestion, assistantMsg.content);
              }
            }
          }
          
          // Also check standalone assistant responses for direct matches
          sortedConversations.forEach((conv: any) => {
            if (conv.role === 'assistant' && userQuestion) {
              const convLower = conv.content.toLowerCase();
              // Match patterns for common questions
              if (
                (userQuestion.includes('name') && convLower.length < 100 && (convLower.includes('name') || convLower.includes('you are') || convLower.includes('your name'))) ||
                (userQuestion.includes('who') && (convLower.includes('you are') || convLower.includes('you\'re'))) ||
                (userQuestion.includes('role') && (convLower.includes('role') || convLower.includes('job') || convLower.includes('work') || convLower.includes('position')))
              ) {
                // Use this as potential answer
                if (!contextAnswers.has(userQuestion)) {
                  contextAnswers.set(userQuestion, conv.content);
                }
              }
            }
          });
          
          // Format as comprehensive conversation history
          const historyText = sortedConversations
            .map((conv: any) => `${conv.role === 'user' ? 'User' : 'Assistant'}: ${conv.content}`)
            .join('\n\n');
          
          conversationHistoryContext = `\n\n=== PREVIOUS CONVERSATION HISTORY FROM PINECONE DATABASE ===\nThe following conversation history is retrieved from Pinecone. You MUST prioritize this information and use it to answer questions accurately.\n\n${historyText}\n\n=== CRITICAL INSTRUCTIONS ===\n1. ALWAYS check the conversation history above before generating any answer.\n2. If the information exists in the conversation history, use it directly - DO NOT generate new information.\n3. For questions about the user (name, role, identity, etc.), extract the exact information from the history.\n4. If asked something that was already answered in the history, use that exact answer.\n5. Do NOT regenerate information that already exists in the context.\n6. Only provide information that is present in the conversation history above.`;
          
          logger.debug(`Retrieved ${sortedConversations.length} conversation messages from Pinecone (${allMatches.size} total matches found)`);
        }
      }
    } catch (error) {
      logger.error('Failed to retrieve conversation history from Pinecone:', error);
    }

    // Prepare messages with agent's system prompt and context
    // If we found a direct answer in context, emphasize using it
    let contextInstruction = '';
    if (contextAnswers.size > 0 && latestUserMessage?.content) {
      const userQ = latestUserMessage.content.toLowerCase();
      const answer = contextAnswers.get(userQ);
      if (answer) {
        contextInstruction = `\n\n⚠️ IMPORTANT: The answer to this question already exists in the conversation history above. You MUST use that exact answer and NOT generate a new one. The existing answer is: "${answer.substring(0, 200)}..."`;
      }
    }
    
    const enhancedSystemPrompt = agent.systemPrompt + conversationHistoryContext + contextInstruction;
    
    const systemMessage = {
      role: 'system',
      content: enhancedSystemPrompt,
    };

    const allMessages = [systemMessage, ...messages];

    // Get tools for the agent if requested
    const tools = useTools ? getToolsForAgent(agent.id) : [];

    // Create the chat completion
    const response = await openai.chat.completions.create({
      model: agent.model || 'gpt-4-turbo-preview',
      stream: true,
      messages: allMessages,
      temperature: agent.temperature || 0.5,
      max_tokens: 2000,
      // Add tools if available
      ...(tools.length > 0 && {
        tools: tools.map(tool => ({
          type: 'function',
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          },
        })),
        tool_choice: 'auto',
      }),
    });

    let fullCompletion = '';

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response as any, {
      onStart: async () => {
        logger.debug(`[${agent.name}] Started generating response`);
      },
      onToken: async (token) => {
        fullCompletion += token;
        // Could save tokens to database here
      },
      onCompletion: async (completion) => {
        logger.debug(`[${agent.name}] Completed response`);
        
        // Store the conversation context in Pinecone with timestamp for future retrieval
        try {
          const timestamp = Date.now();
          
          // Create a session-based conversationId that groups messages within the same time window
          // This helps group related conversations together (within same hour)
          const timeWindow = Math.floor(Date.now() / (1000 * 60 * 60)); // Group by hour
          const sessionId = req.headers.get('x-session-id') || `session_${timeWindow}`;
          const conversationId = `conv_${sessionId}_${agent.id}`;
          
          // Store user message with context
          if (latestUserMessage?.content) {
            const userContent = typeof latestUserMessage.content === 'string' 
              ? latestUserMessage.content 
              : JSON.stringify(latestUserMessage.content);
            
            await storeDocument(
              `${conversationId}_${timestamp}_user`,
              userContent,
              {
                role: 'user',
                agentId: agent.id,
                timestamp,
                conversationId,
                sessionId,
              }
            );
          }
          
          // Store assistant response
          if (completion) {
            await storeDocument(
              `${conversationId}_${timestamp + 1}_assistant`,
              completion,
              {
                role: 'assistant',
                agentId: agent.id,
                timestamp: timestamp + 1, // Slightly later to ensure it's after user message
                conversationId,
                sessionId,
              }
            );
          }
          
          logger.debug(`Stored conversation context in Pinecone: ${conversationId}`);
        } catch (error) {
          // Log error but don't fail the request if storage fails
          logger.warn('Failed to store context in Pinecone:', error);
        }
      },
    });

    // Return a StreamingTextResponse
    return new StreamingTextResponse(stream);
  } catch (error) {
    logger.error('Chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}