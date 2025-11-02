/**
 * Pinecone Setup Script
 * 
 * This script helps you set up and configure your Pinecone index.
 * Run with: npx ts-node scripts/setup-pinecone.ts
 */

import { Pinecone } from '@pinecone-database/pinecone';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function setupPinecone() {
  console.log('🚀 Starting Pinecone setup...\n');

  // Check for API key
  const apiKey = process.env.PINECONE_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: PINECONE_API_KEY is not set in .env.local');
    console.log('\nPlease add your Pinecone API key to .env.local:');
    console.log('PINECONE_API_KEY=your-api-key-here');
    process.exit(1);
  }

  try {
    // Initialize Pinecone client
    console.log('📡 Connecting to Pinecone...');
    const pinecone = new Pinecone({
      apiKey: apiKey,
    });

    // Get index name from env or use default
    const indexName = process.env.PINECONE_INDEX || 'vercel-ai-agents';
    
    console.log(`🔍 Checking for index: ${indexName}`);

    // List all indexes
    const indexes = await pinecone.listIndexes();
    const indexExists = indexes.indexes?.some(idx => idx.name === indexName);

    if (indexExists) {
      console.log(`✅ Index "${indexName}" already exists`);
      
      // Get index stats
      const index = pinecone.index(indexName);
      const stats = await index.describeIndexStats();
      console.log(`\n📊 Index Statistics:`);
      console.log(`   Dimensions: ${stats.dimension}`);
      console.log(`   Index full: ${stats.indexFullness || 'N/A'}`);
      console.log(`   Namespaces: ${Object.keys(stats.namespaces || {}).length}`);
    } else {
      console.log(`⚠️  Index "${indexName}" does not exist`);
      console.log('\nTo create an index, you need to:');
      console.log('1. Go to https://app.pinecone.io');
      console.log('2. Create a new index with the following settings:');
      console.log(`   - Name: ${indexName}`);
      console.log('   - Dimensions: 1536 (for OpenAI text-embedding-3-small)');
      console.log('   - Metric: Cosine');
      console.log('   - Cloud: GCP or AWS');
      console.log('   - Region: Choose a region close to you');
      console.log('\nAlternatively, use the Pinecone console to create the index.');
    }

    console.log('\n✨ Setup complete!');
    console.log('\nYour Pinecone configuration is ready to use.');
    console.log('Your agents can now use vector search for RAG (Retrieval-Augmented Generation).\n');

  } catch (error) {
    console.error('❌ Error during setup:', error);
    process.exit(1);
  }
}

// Run the setup
setupPinecone();

