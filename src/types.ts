export interface User {
  id: string;
  email: string;
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'server';
  created_at: string;
  session_id: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
}