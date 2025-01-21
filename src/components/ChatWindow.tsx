import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { Message } from '../types';
import { subscribeToMessages } from '../lib/supabase';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
}

export function ChatWindow({ messages, onSendMessage }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleNewMessage = (message: Message) => {
    // Handle new message
  };

  useEffect(() => {
    const subscription = subscribeToMessages('currentSessionId', handleNewMessage);
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p>{message.content}</p>
              <span className="text-xs opacity-75">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full border px-4 py-2 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 transition-colors"
            disabled={!input.trim()}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
