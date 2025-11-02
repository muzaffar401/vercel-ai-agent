# 🤖 Vercel AI Agents

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white" />
  <img src="https://img.shields.io/badge/Pinecone-5A67D8?style=for-the-badge&logo=pinecone&logoColor=white" />
</p>

<p align="center">
  <strong>Multi-Agent Conversational AI System with RAG</strong><br>
  Next.js 15 • TypeScript • OpenAI • Pinecone
</p>

## ✨ Features

- 🧠 **Multi-Agent System**: Specialized AI agents (Orchestrator, Research, Code, Creative, Analysis)
- 🔄 **Real-time Streaming**: Stream responses using Vercel AI SDK
- 💾 **RAG with Pinecone**: Context-aware conversations with vector search
- 📚 **Chat History**: Persistent memory across sessions
- 🎯 **Context-Aware**: Remembers user information and past conversations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- OpenAI API Key
- Pinecone API Key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/vercel-ai-agents
cd vercel-ai-agents

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
```

### Environment Variables

Create `.env.local`:

```env
OPENAI_API_KEY=sk-your-openai-api-key
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX=vercel-ai-agents
```

### Run Development Server

```bash
npm run dev
# Open http://localhost:3000
```

## 🚀 Deployment to Vercel

1. Push to GitHub
2. Import repository in [Vercel Dashboard](https://vercel.com/new)
3. Add environment variables:
   - `OPENAI_API_KEY`
   - `PINECONE_API_KEY`
   - `PINECONE_INDEX` (optional)
4. Deploy!

Or use CLI:

```bash
npm i -g vercel
vercel login
vercel
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **AI**: OpenAI (GPT-4o-mini) + Pinecone Vector DB
- **Styling**: TailwindCSS

## 🤖 Available Agents

- **🎭 Orchestrator**: General-purpose assistant
- **🔍 Research**: Finding and analyzing information
- **💻 Code**: Software engineering and programming
- **🎨 Creative**: Creative writing and ideation
- **📊 Analysis**: Data analysis and insights

## 📊 How It Works

1. **Store Conversations**: All chats saved to Pinecone as embeddings
2. **Retrieve Context**: Search past conversations when answering questions
3. **Remember**: AI remembers your name, preferences, and past discussions
4. **Respond**: Uses retrieved context for accurate, personalized answers

### Example

```
User: "My name is John"
System: Stores in Pinecone

User: "What's my name?"
System: Retrieves from Pinecone → "Your name is John"
```

## 🔧 Pinecone Setup

1. Create account at [pinecone.io](https://www.pinecone.io)
2. Create index:
   - Name: `vercel-ai-agents`
   - Dimensions: **1024**
   - Metric: Cosine
3. Run setup:
   ```bash
   npm run setup-pinecone
   ```

## 📄 License

MIT License

---

<p align="center">Built with ❤️ by <strong>Muzaffar Ahmed</strong></p>
