import React from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import { ChatSession } from '../types';

interface SessionListProps {
  sessions: ChatSession[];
  currentSessionId: string;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
}

export function SessionList({
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewSession,
}: SessionListProps) {
  return (
    <div className="border-r h-full flex flex-col">
      <div className="p-4 border-b">
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white rounded-lg py-2 px-4 hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Chat
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => onSessionSelect(session.id)}
            className={`w-full text-left p-4 hover:bg-gray-100 flex items-center gap-3 ${
              session.id === currentSessionId ? 'bg-gray-100' : ''
            }`}
          >
            <MessageSquare className="w-5 h-5 text-gray-500" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {session.messages[session.messages.length - 1]?.content || 'New Chat'}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(session.lastMessageAt).toLocaleDateString()}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}