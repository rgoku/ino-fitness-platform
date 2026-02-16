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
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {messages.map(msg => (
          <div key={msg.id} className={`flex mb-3 ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-xs px-4 py-3 rounded-2xl ${
              msg.isBot ? 'bg-white shadow-sm' : 'bg-blue-500 text-white'
            }`}>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t bg-white p-4 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask your coach anything..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-600 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
