import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChatMessage } from '../../types';
import { sendChatMessage } from '../../services/farm2vets';

const STORAGE_KEY = 'f2v_chat_history';

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init',
  role: 'assistant',
  content: "Hello! I'm your Farm2Vets AI assistant. Ask me about your herd health, treatment plans, or disease alerts.",
  timestamp: new Date(),
};

const SUGGESTIONS = [
  'What is the current herd health score?',
  'Show me active treatment cases.',
  'Any disease alerts I should know about?',
];

function loadHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [INITIAL_MESSAGE];
    const parsed: Array<{ id: string; role: 'user' | 'assistant'; content: string; timestamp: string }> =
      JSON.parse(raw);
    return parsed.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }));
  } catch {
    return [INITIAL_MESSAGE];
  }
}

function saveHistory(messages: ChatMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // Ignore storage errors
  }
}

const FullChatPanel: React.FC = () => {
  const { i18n } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>(loadHistory);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await sendChatMessage(content, sessionId, i18n.language);
      setSessionId(res.session_id);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Unable to reach AI assistant. Please check your connection.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    const fresh = [INITIAL_MESSAGE];
    setMessages(fresh);
    saveHistory(fresh);
    setSessionId(undefined);
  };

  return (
    <div className="flex flex-col h-full bg-farm-bg px-4 py-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <p className="text-base font-semibold text-white">AI Assistant</p>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full inline-block" /> Online
            </p>
          </div>
        </div>
        <button
          onClick={handleClearHistory}
          className="text-xs text-gray-400 hover:text-white border border-farm-border px-3 py-1 rounded-lg transition-colors"
          title="Clear chat history"
        >
          Clear history
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] text-sm px-4 py-2.5 rounded-2xl leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-none'
                  : 'bg-farm-card text-gray-200 rounded-bl-none'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-farm-card px-4 py-2.5 rounded-2xl rounded-bl-none">
              <span className="inline-flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div className="flex gap-2 mb-3 flex-wrap flex-shrink-0">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => handleSend(suggestion)}
            disabled={isLoading}
            className="text-xs bg-farm-card border border-farm-border text-gray-300 hover:text-white hover:border-primary-500 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about your herd..."
          className="flex-1 bg-farm-card text-sm text-white placeholder-gray-500 rounded-xl px-4 py-2.5 outline-none focus:ring-1 focus:ring-primary-500 border border-farm-border"
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading}
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 rounded-xl flex items-center justify-center transition-colors"
        >
          <span className="text-base">➤</span>
        </button>
      </div>
    </div>
  );
};

export default FullChatPanel;
