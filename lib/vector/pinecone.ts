import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAI } from 'openai';
import { logger } from '../logger';

// Initialize Pinecone client
let pineconeClient: Pinecone | null = null;
let openaiClient: OpenAI | null = null;

/**
 * Get or create Pinecone client instance
 */
export function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) {
      throw new Error('PINECONE_API_KEY is not set in environment variables');
    }

    pineconeClient = new Pinecone({
      apiKey: apiKey,
    });
    
    logger.info('Pinecone client initialized');
  }
  
  return pineconeClient;
}

/**
 * Get or create OpenAI client for embeddings
 */
export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    openaiClient = new OpenAI({ apiKey });
    logger.info('OpenAI client initialized for embeddings');
  }
  
  return openaiClient;
}

/**
 * Get the Pinecone index
 */
export async function getPineconeIndex(indexName?: string) {
  const client = getPineconeClient();
  const index = indexName || process.env.PINECONE_INDEX || 'vercel-ai-agents';
  
  try {
    const indexRef = client.index(index);
    logger.info(`Connected to Pinecone index: ${index}`);
    return indexRef;
  } catch (error) {
    logger.error('Error connecting to Pinecone index:', error);
    throw error;
  }
}

/**
 * Create embeddings using OpenAI
 */
export async function createEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAIClient();
  
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      dimensions: 1024, // Match Pinecone index dimension
    });
    
    return response.data[0].embedding;
  } catch (error) {
    logger.error('Error creating embedding:', error);
    throw error;
  }
}

/**
 * Store a vector in Pinecone
 */
export async function storeVector(
  id: string,
  embedding: number[],
  metadata?: Record<string, any>
): Promise<void> {
  try {
    const index = await getPineconeIndex();
    
    await index.upsert([
      {
        id,
        values: embedding,
        metadata: metadata || {},
      },
    ]);
    
    logger.debug(`Stored vector with id: ${id}`);
  } catch (error) {
    logger.error('Error storing vector:', error);
    throw error;
  }
}

/**
 * Store a text document in Pinecone by creating embedding first
 */
export async function storeDocument(
  id: string,
  text: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    const embedding = await createEmbedding(text);
    await storeVector(id, embedding, { text, ...metadata });
    logger.debug(`Stored document with id: ${id}`);
  } catch (error) {
    logger.error('Error storing document:', error);
    throw error;
  }
}

/**
 * Query similar vectors from Pinecone
 */
export async function queryVectors(
  queryEmbedding: number[],
  topK: number = 5,
  filter?: Record<string, any>
): Promise<any[]> {
  try {
    const index = await getPineconeIndex();
    
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
      ...(filter && { filter }),
    });
    
    logger.debug(`Found ${queryResponse.matches?.length || 0} similar vectors`);
    return queryResponse.matches || [];
  } catch (error) {
    logger.error('Error querying vectors:', error);
    throw error;
  }
}

/**
 * Query similar documents by text
 */
export async function queryDocuments(
  text: string,
  topK: number = 5,
  filter?: Record<string, any>
): Promise<any[]> {
  try {
    const queryEmbedding = await createEmbedding(text);
    return await queryVectors(queryEmbedding, topK, filter);
  } catch (error) {
    logger.error('Error querying documents:', error);
    throw error;
  }
}

/**
 * Delete a vector by ID
 */
export async function deleteVector(id: string): Promise<void> {
  try {
    const index = await getPineconeIndex();
    await index.deleteOne(id);
    logger.debug(`Deleted vector with id: ${id}`);
  } catch (error) {
    logger.error('Error deleting vector:', error);
    throw error;
  }
}

/**
 * Delete multiple vectors by IDs
 */
export async function deleteVectors(ids: string[]): Promise<void> {
  try {
    const index = await getPineconeIndex();
    await index.deleteMany(ids);
    logger.debug(`Deleted ${ids.length} vectors`);
  } catch (error) {
    logger.error('Error deleting vectors:', error);
    throw error;
  }
}

/**
 * Delete all vectors by metadata filter
 */
export async function deleteByFilter(filter: Record<string, any>): Promise<void> {
  try {
    const index = await getPineconeIndex();
    await index.deleteMany(filter);
    logger.debug('Deleted vectors by filter');
  } catch (error) {
    logger.error('Error deleting vectors by filter:', error);
    throw error;
  }
}

/**
 * Get index stats
 */
export async function getIndexStats(): Promise<any> {
  try {
    const index = await getPineconeIndex();
    const stats = await index.describeIndexStats();
    logger.debug('Retrieved index stats');
    return stats;
  } catch (error) {
    logger.error('Error getting index stats:', error);
    throw error;
  }
}

