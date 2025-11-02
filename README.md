# 🤖 Vercel AI Agents

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Vercel_AI_SDK-000000?style=for-the-badge&logo=vercel&logoColor=white" />
  <img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white" />
  <img src="https://img.shields.io/badge/Pinecone-5A67D8?style=for-the-badge&logo=pinecone&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</p>

<p align="center">
  <strong>Advanced Multi-Agent Conversational AI System with RAG</strong><br>
  Built with Vercel AI SDK v3 • Next.js 15 • TypeScript • Pinecone Vector Database
</p>

## ✨ Features

- 🧠 **Multi-Agent System**: Orchestrate multiple specialized AI agents (Orchestrator, Research, Code, Creative, Analysis)
- 🔄 **Real-time Streaming**: Stream responses using Vercel AI SDK with OpenAI
- 🛠️ **Tool Calling**: Agents can execute functions and interact with APIs (web search, code execution, database queries, etc.)
- 💾 **RAG Implementation**: Retrieval-Augmented Generation with Pinecone vector database for context-aware conversations
- 📚 **Chat History Storage**: Persistent conversation storage in Pinecone for memory across sessions
- 🎯 **Context-Aware AI**: Remembers user information and past conversations using vector similarity search
- 🎨 **Modern UI**: Beautiful chat interface built with Tailwind CSS and Framer Motion
- 🔐 **Enterprise Ready**: Built with security and scalability in mind

## 🏗️ Architecture

```mermaid
graph TD
    A[Client Application] -->|WebSocket| B[Next.js API Routes]
    B --> C[Agent Orchestrator]
    C --> D[Research Agent]
    C --> E[Code Agent]
    C --> F[Creative Agent]
    C --> G[Analysis Agent]

    D --> H[Tool Registry]
    E --> H
    F --> H
    G --> H

    H --> I[Web Search]
    H --> J[Code Execution]
    H --> K[Database Query]
    H --> L[Image Generation]

    C --> M[Vector Store]
    M --> N[Embeddings]

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style C fill:#bbf,stroke:#333,stroke-width:2px
    style M fill:#bfb,stroke:#333,stroke-width:2px
```

## 🚀 Quick Start

### Prerequisites

```bash
Node.js 18+
npm or yarn
OpenAI API Key
```

### Installation

```bash
# Clone the repository
git clone https://github.com/obedvargasvillarreal/vercel-ai-agents
cd vercel-ai-agents

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Add your API keys to .env.local
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000

# Type check
npm run type-check

# Build for production
npm run build

# Start production server
npm start
```

## 🚀 Deployment

### Deploy to Vercel

See [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) for detailed deployment instructions.

**Quick Deploy:**

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy via Vercel Dashboard**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Add environment variables:
     - `OPENAI_API_KEY`
     - `PINECONE_API_KEY`
     - `PINECONE_INDEX` (optional, defaults to `vercel-ai-agents`)
   - Click "Deploy"

3. **Or Deploy via CLI**:
   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

## 🛠️ Technology Stack

### Core Technologies
- **Framework**: Next.js 15.5.4 with App Router
- **Language**: TypeScript 5.3
- **AI SDK**: Vercel AI SDK v3
- **Styling**: TailwindCSS + Framer Motion
- **Runtime**: Node.js (for server-side API routes)
- **Deployment**: Vercel Platform

### AI Components
- **LLM Provider**: OpenAI (GPT-4o-mini, GPT-4)
- **Embeddings**: OpenAI text-embedding-3-small (1024 dimensions)
- **Vector Store**: Pinecone (for RAG and chat history)
- **Tools**: Custom function calling implementation with Zod schema validation

## 📂 Project Structure

```
vercel-ai-agents/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Chat API endpoint with RAG
│   ├── page.tsx                  # Main chat interface
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── lib/
│   ├── ai/
│   │   ├── agents.ts             # Agent definitions & orchestrator
│   │   └── tools.ts              # Tool registry and function calling
│   ├── vector/
│   │   └── pinecone.ts           # Pinecone client & embedding utilities
│   └── logger.ts                 # Logging utilities
├── scripts/
│   └── setup-pinecone.ts         # Pinecone index setup script
├── package.json
├── next.config.js
├── tsconfig.json
└── tailwind.config.js
```

## 🤖 Agent Types

### 1. Research Agent
Specializes in gathering and synthesizing information from multiple sources.
```typescript
const researchAgent = {
  name: 'Research Assistant',
  description: 'Expert at finding and analyzing information',
  tools: ['webSearch', 'pdfReader', 'summarize'],
  systemPrompt: '...'
}
```

### 2. Code Agent
Expert in writing, reviewing, and debugging code across multiple languages.
```typescript
const codeAgent = {
  name: 'Code Assistant',
  description: 'Software engineering expert',
  tools: ['codeExecution', 'linting', 'testing'],
  systemPrompt: '...'
}
```

### 3. Creative Agent
Focuses on creative tasks like writing, ideation, and content generation.
```typescript
const creativeAgent = {
  name: 'Creative Assistant',
  description: 'Creative writing and ideation expert',
  tools: ['imageGeneration', 'writingStyles'],
  systemPrompt: '...'
}
```

### 4. Analysis Agent
Specializes in data analysis, pattern recognition, and insights.
```typescript
const analysisAgent = {
  name: 'Analysis Assistant',
  description: 'Data analysis and insights expert',
  tools: ['dataQuery', 'visualization', 'statistics'],
  systemPrompt: '...'
}
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Required: OpenAI API Key
OPENAI_API_KEY=sk-your-openai-api-key-here

# Required: Pinecone Configuration
PINECONE_API_KEY=your-pinecone-api-key-here
PINECONE_INDEX=vercel-ai-agents

# Optional: Anthropic API Key (if using Claude)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here
```

### Setting Up Pinecone

1. **Create a Pinecone Account**: Sign up at [pinecone.io](https://www.pinecone.io)

2. **Create an Index**: 
   - Name: `vercel-ai-agents` (or your preferred name)
   - Dimensions: **1024** (matches OpenAI text-embedding-3-small)
   - Metric: Cosine

3. **Run Setup Script**:
   ```bash
   npm run setup-pinecone
   ```
   Or manually create the index in Pinecone dashboard.

### Agent Configuration

Agents are configured in `lib/ai/agents.ts`:

- **Orchestrator**: Coordinates multiple agents
- **Research**: Web search, PDF reading, summarization
- **Code**: Code execution, linting, testing
- **Creative**: Image generation, creative writing
- **Analysis**: Database queries, data visualization

Each agent has:
- Custom system prompts
- Specific tools assigned
- Configurable temperature and model settings

## 📊 How It Works

### RAG (Retrieval-Augmented Generation)

The system uses Pinecone for:
1. **Storing Chat History**: All conversations are stored as embeddings in Pinecone
2. **Context Retrieval**: When you ask a question, the system searches for relevant past conversations
3. **Memory**: The AI remembers your name, preferences, and past discussions
4. **Context-Aware Responses**: Uses retrieved context to provide personalized, accurate answers

### Agent Selection

Select an agent from the dropdown:
- **🎭 Orchestrator**: General-purpose assistant, coordinates tasks
- **🔍 Research Assistant**: Expert at finding and analyzing information
- **💻 Code Assistant**: Software engineering and programming
- **🎨 Creative Assistant**: Creative writing and ideation
- **📊 Analysis Assistant**: Data analysis and insights

### Features in Action

- **Streaming Responses**: Watch responses generate in real-time
- **Tool Usage**: Agents automatically use tools when needed (web search, code execution, etc.)
- **Chat History**: Conversations are automatically saved to Pinecone
- **Context Memory**: The AI remembers information from previous conversations

### Example Conversation Flow

1. User: "My name is John and I'm a developer"
2. System: Stores this information in Pinecone
3. User: (later) "What's my name?"
4. System: Retrieves past conversation from Pinecone, responds: "Your name is John"

## 🧪 Development Tips

### Testing the Setup

1. **Test Pinecone Connection**:
   ```bash
   npm run setup-pinecone
   ```

2. **Check Environment Variables**:
   Ensure all required variables are set in `.env.local`

3. **Test Chat Interface**:
   - Start dev server: `npm run dev`
   - Open http://localhost:3000
   - Try asking: "My name is [your name]"
   - Refresh and ask: "What's my name?"
   - The AI should remember!

### Troubleshooting

**Pinecone Connection Issues**:
- Verify `PINECONE_API_KEY` is correct
- Check that index name matches `PINECONE_INDEX`
- Ensure index has 1024 dimensions

**OpenAI API Issues**:
- Verify `OPENAI_API_KEY` is valid
- Check API rate limits
- Ensure account has sufficient credits

**Build Errors**:
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (18+ required)
- Verify TypeScript compilation: `npm run type-check`

## 📈 Performance Considerations

- **Vector Search**: Pinecone queries are fast (<100ms typically)
- **Embedding Generation**: OpenAI embeddings add ~200-500ms per message
- **Streaming**: First token appears in <500ms
- **Memory Efficiency**: Chat history is stored as embeddings, not full text

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔐 Security Notes

- **Never commit `.env.local`** - It's in `.gitignore` for a reason
- **API Keys**: Store securely in Vercel environment variables for production
- **Rate Limiting**: Consider implementing rate limiting for production use
- **Pinecone Index**: Keep your Pinecone API key secure

## 🙏 Acknowledgments

- Vercel AI SDK team for the amazing framework
- OpenAI for GPT-4 and embeddings
- Pinecone for vector database infrastructure
- Next.js team for the robust platform
- The open-source community

## 📞 Contact

**Obed Vargas Villarreal** - [@obedvargasvillarreal](https://github.com/obedvargasvillarreal) - obed@obeskay.com

Project Link: [https://github.com/obedvargasvillarreal/vercel-ai-agents](https://github.com/obedvargasvillarreal/vercel-ai-agents)

---

<p align="center">Built with ❤️ by <a href="https://obeskay.com">Obed Vargas Villarreal</a></p>