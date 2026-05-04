import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChatMessage } from '../../types';
import { sendChatMessage } from '../../services/farm2vets';

const ChatPanel: React.FC = () => {
  const { i18n } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'assistant',
      content: "Hello! I'm your Farm2Vets AI assistant. Ask me about your herd health, treatment plans, or disease alerts.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await sendChatMessage(text, sessionId, i18n.language);
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

  return (
    <div className={`card flex flex-col ${isMaximized ? 'h-full' : 'h-80'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <div>
            <p className="text-sm font-semibold text-white">AI Assistant</p>
            <p className="text-[10px] text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" /> Online
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsMaximized(!isMaximized)}
          className="text-gray-400 hover:text-white text-lg"
          title={isMaximized ? 'Minimize' : 'Maximize'}
        >
          {isMaximized ? '🪟' : '⛶'}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] text-xs px-3 py-2 rounded-xl leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-none'
                  : 'bg-farm-border text-gray-200 rounded-bl-none'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-farm-border px-3 py-2 rounded-xl rounded-bl-none">
              <span className="inline-flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about your herd..."
          className="flex-1 bg-farm-border text-sm text-white placeholder-gray-500 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary-500"
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="w-9 h-9 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 rounded-lg flex items-center justify-center transition-colors"
        >
          <span className="text-base">➤</span>
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;
