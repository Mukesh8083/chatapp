import { ChatSession, Message } from '../types';

const SESSIONS_KEY = 'chat_sessions';

export function getSessions(): ChatSession[] {
  const stored = localStorage.getItem(SESSIONS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveSession(session: ChatSession): void {
  const sessions = getSessions();
  const existingIndex = sessions.findIndex(s => s.id === session.id);
  
  if (existingIndex >= 0) {
    sessions[existingIndex] = session;
  } else {
    sessions.push(session);
  }
  
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function createNewSession(): ChatSession {
  const session: ChatSession = {
    id: crypto.randomUUID(),
    messages: [],
    createdAt: Date.now(),
    lastMessageAt: Date.now()
  };
  saveSession(session);
  return session;
}

export function addMessage(sessionId: string, content: string, sender: 'user' | 'server'): Message {
  const sessions = getSessions();
  const session = sessions.find(s => s.id === sessionId);
  
  if (!session) {
    throw new Error('Session not found');
  }
  
  const message: Message = {
    id: crypto.randomUUID(),
    content,
    sender,
    timestamp: Date.now()
  };
  
  session.messages.push(message);
  session.lastMessageAt = message.timestamp;
  saveSession(session);
  
  return message;
}