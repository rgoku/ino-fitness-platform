'use client';

import { useState } from 'react';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hi! I'm your AI fitness coach. How can I help you today?", isBot: true },
    { id: 2, text: 'I want to build muscle', isBot: false },
    { id: 3, text: 'Great! I recommend a strength training program with progressive overload. Focus on compound movements like squats, deadlifts, and bench press 3-4 times per week.', isBot: true },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { id: messages.length + 1, text: input, isBot: false }]);
      setInput('');

      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          text: "That's a great question! I'd be happy to help you with that. Let me provide you with some personalized advice based on your fitness goals.",
          isBot: true
        }]);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <span className="text-xs font-bold text-white">AI</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">INO Coach</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] text-white/30">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {messages.map(msg => (
          <div key={msg.id} className={`flex mb-3 ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
            <div
              className={`max-w-xs px-4 py-3 rounded-2xl ${
                msg.isBot
                  ? 'rounded-bl-md'
                  : 'bg-brand-500 text-white rounded-br-md shadow-[0_0_15px_rgba(16,185,129,0.15)]'
              }`}
              style={msg.isBot ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' } : undefined}
            >
              <p className={`text-sm ${msg.isBot ? 'text-white/80' : 'text-white'}`}>{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 flex gap-3 border-t border-white/[0.06]" style={{ background: 'rgba(10,10,10,0.95)' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask your coach anything..."
          className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-full px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-500/50 focus:shadow-[0_0_12px_rgba(16,185,129,0.1)] transition-all"
        />
        <button
          onClick={sendMessage}
          className="bg-brand-500 text-white w-11 h-11 rounded-full flex items-center justify-center hover:bg-brand-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
