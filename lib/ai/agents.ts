import { OpenAI } from 'openai';
import { z } from 'zod';

export interface Agent {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  systemPrompt: string;
  tools: string[];
  temperature?: number;
  model?: string;
}

export const agents: Record<string, Agent> = {
  orchestrator: {
    id: 'orchestrator',
    name: 'Orchestrator',
    description: 'Coordinates multiple agents to solve complex tasks',
    avatar: '🎭',
    systemPrompt: `You are an expert orchestrator that coordinates multiple AI agents to accomplish complex tasks.
    You excel at:
    - Breaking down complex problems into subtasks
    - Delegating work to specialized agents
    - Synthesizing results from multiple agents
    - Ensuring coherent and comprehensive solutions

    Always think step-by-step and use the most appropriate agent for each subtask.`,
    tools: ['delegate', 'synthesize', 'plan'],
    temperature: 0.3,
    model: 'gpt-4o-mini',
  },
  research: {
    id: 'research',
    name: 'Research Assistant',
    description: 'Expert at finding and analyzing information',
    avatar: '🔍',
    systemPrompt: `You are a research specialist with expertise in:
    - Information gathering from multiple sources
    - Fact-checking and verification
    - Synthesizing complex information
    - Creating comprehensive reports
    - Academic and technical research

    Always cite sources and provide evidence for your claims.`,
    tools: ['webSearch', 'pdfReader', 'summarize', 'factCheck'],
    temperature: 0.5,
    model: 'gpt-4o-mini',
  },
  code: {
    id: 'code',
    name: 'Code Assistant',
    description: 'Software engineering and programming expert',
    avatar: '💻',
    systemPrompt: `You are an expert software engineer proficient in:
    - Multiple programming languages (TypeScript, Python, Rust, Go)
    - System design and architecture
    - Code review and optimization
    - Debugging and testing
    - Best practices and design patterns

    Always write clean, efficient, and well-documented code.`,
    tools: ['codeExecution', 'linting', 'testing', 'debugging'],
    temperature: 0.2,
    model: 'gpt-4o-mini',
  },
  creative: {
    id: 'creative',
    name: 'Creative Assistant',
    description: 'Creative writing and ideation specialist',
    avatar: '🎨',
    systemPrompt: `You are a creative specialist skilled in:
    - Creative writing and storytelling
    - Brainstorming and ideation
    - Content creation and copywriting
    - Brand voice and messaging
    - Visual concepts and descriptions

    Be creative, engaging, and original in your responses.`,
    tools: ['imageGeneration', 'writingStyles', 'brainstorm'],
    temperature: 0.8,
    model: 'gpt-4o-mini',
  },
  analysis: {
    id: 'analysis',
    name: 'Analysis Assistant',
    description: 'Data analysis and insights expert',
    avatar: '📊',
    systemPrompt: `You are a data analysis expert specializing in:
    - Statistical analysis and modeling
    - Pattern recognition and anomaly detection
    - Data visualization recommendations
    - Business intelligence and insights
    - Predictive analytics

    Provide data-driven insights with clear explanations.`,
    tools: ['dataQuery', 'visualization', 'statistics', 'predictions'],
    temperature: 0.3,
    model: 'gpt-4o-mini',
  },
};

export class AgentOrchestrator {
  private openai: OpenAI;
  private activeAgents: Map<string, Agent>;
  private conversationHistory: any[];

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
    this.activeAgents = new Map();
    this.conversationHistory = [];
  }

  async delegate(task: string, agentId: string): Promise<any> {
    const agent = agents[agentId];
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const response = await this.openai.chat.completions.create({
      model: agent.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: agent.systemPrompt },
        { role: 'user', content: task }
      ],
      temperature: agent.temperature || 0.5,
      stream: true,
    });

    return response;
  }

  async orchestrate(goal: string, agentIds: string[], maxIterations: number = 5): Promise<any> {
    const plan = await this.createPlan(goal, agentIds);
    const results = [];

    for (let i = 0; i < Math.min(plan.steps.length, maxIterations); i++) {
      const step = plan.steps[i];
      const result = await this.delegate(step.task, step.agent);
      results.push({
        step: i + 1,
        agent: step.agent,
        task: step.task,
        result: result,
      });
    }

    return this.synthesize(results);
  }

  private async createPlan(goal: string, agentIds: string[]): Promise<any> {
    const availableAgents = agentIds.map(id => agents[id]).filter(Boolean);

    const planPrompt = `
    Goal: ${goal}

    Available agents:
    ${availableAgents.map(a => `- ${a.name}: ${a.description}`).join('\n')}

    Create a step-by-step plan to achieve the goal using these agents.
    Return a JSON object with a 'steps' array, each containing 'agent' and 'task'.
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a planning expert. Create efficient plans.' },
        { role: 'user', content: planPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  private async synthesize(results: any[]): Promise<string> {
    const synthesisPrompt = `
    Synthesize the following results into a coherent response:

    ${results.map(r => `
    Step ${r.step} (${r.agent}):
    Task: ${r.task}
    Result: ${r.result}
    `).join('\n---\n')}

    Provide a comprehensive synthesis that addresses the original goal.
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a synthesis expert. Create coherent summaries.' },
        { role: 'user', content: synthesisPrompt }
      ],
      temperature: 0.5,
    });

    return response.choices[0].message.content || '';
  }
}

export function getAgent(id: string): Agent | undefined {
  return agents[id];
}

export function getAllAgents(): Agent[] {
  return Object.values(agents);
}