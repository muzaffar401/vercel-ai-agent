'use client';

import { useChat } from 'ai/react';
import { useState, useRef, useEffect } from 'react';
import { getAllAgents } from '@/lib/ai/agents';

export default function ChatPage() {
  const [selectedAgent, setSelectedAgent] = useState('orchestrator');
  const [isAgentMenuOpen, setIsAgentMenuOpen] = useState(false);
  const agents = getAllAgents();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const agentMenuRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      agentId: selectedAgent,
      useTools: true,
    },
  });

  const selectedAgentData = agents.find(a => a.id === selectedAgent);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Close agent menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (agentMenuRef.current && !agentMenuRef.current.contains(event.target as Node)) {
        setIsAgentMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex items-center space-x-2">
                <div className="text-2xl sm:text-3xl">🤖</div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Agents
                </h1>
              </div>
              <span className="hidden sm:inline-flex items-center px-2 sm:px-3 py-1 text-xs font-medium bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full shadow-sm">
                <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse"></span>
                Online
              </span>
            </div>
            
            {/* Agent Selector - Mobile Friendly */}
            <div className="relative" ref={agentMenuRef}>
              <button
                onClick={() => setIsAgentMenuOpen(!isAgentMenuOpen)}
                className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <span className="text-lg sm:text-xl">{selectedAgentData?.avatar}</span>
                <span className="hidden sm:block font-medium">{selectedAgentData?.name}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isAgentMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => {
                        setSelectedAgent(agent.id);
                        setIsAgentMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors ${
                        selectedAgent === agent.id ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <span className="text-xl">{agent.avatar}</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{agent.name}</p>
                        <p className="text-xs text-gray-500 truncate">{agent.description}</p>
                      </div>
                      {selectedAgent === agent.id && (
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Messages */}
          <div className="space-y-4 sm:space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-8 sm:py-12 lg:py-16 animate-in fade-in duration-500">
                <div className="inline-block p-4 sm:p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-4 sm:mb-6 shadow-xl transform hover:scale-105 transition-transform">
                  <span className="text-4xl sm:text-5xl lg:text-6xl block">🤖</span>
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
                  Welcome to Vercel AI Agents
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto">
                  Select an agent above and start a conversation. Each agent specializes in different tasks!
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 max-w-2xl mx-auto">
                  {agents.slice(0, 5).map((agent) => (
                    <div
                      key={agent.id}
                      className="p-3 sm:p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:scale-105 cursor-pointer"
                      onClick={() => setSelectedAgent(agent.id)}
                    >
                      <div className="text-2xl sm:text-3xl mb-2">{agent.avatar}</div>
                      <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">{agent.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                } animate-in fade-in slide-in-from-bottom-4`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={`max-w-[85%] sm:max-w-xl px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-lg ${
                    message.role === 'user'
                      ? 'bg-white/90 backdrop-blur-sm border border-gray-200/50 text-black rounded-tr-sm'
                      : 'bg-white/90 backdrop-blur-sm border border-gray-200/50 text-gray-900 rounded-tl-sm'
                  }`}
                >
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base sm:text-lg ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-blue-100 to-purple-100'
                        : 'bg-gradient-to-br from-blue-100 to-purple-100'
                    }`}>
                      {message.role === 'user'
                        ? '👤'
                        : selectedAgentData?.avatar || '🤖'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs sm:text-sm font-semibold mb-1 ${
                        message.role === 'user' ? 'text-gray-700' : 'text-gray-600'
                      }`}>
                        {message.role === 'user'
                          ? 'You'
                          : selectedAgentData?.name || 'Agent'}
                      </p>
                      <div className={`text-sm sm:text-base whitespace-pre-wrap break-words ${
                        message.role === 'user' ? 'text-black' : 'text-gray-800'
                      }`}>
                        {message.content}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start animate-in fade-in">
                <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 px-4 py-3 rounded-2xl rounded-tl-sm shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1.5">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      {selectedAgentData?.name || 'Agent'} is thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Input Form */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200/50 shadow-lg">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3 items-end">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="w-full px-4 sm:px-5 py-3 sm:py-4 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all text-sm sm:text-base text-black"
                disabled={isLoading}
              />
              <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                <span className="text-gray-400 text-lg">{selectedAgentData?.avatar}</span>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 flex items-center space-x-2"
            >
              <span className="hidden sm:inline">Send</span>
              <span className="sm:hidden">📤</span>
              <svg className="hidden sm:block w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}