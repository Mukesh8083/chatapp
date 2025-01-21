import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        email: email,
      },
    },
  });
  
  if (error) throw error;

  // Create profile after signup
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: data.user.id,
          email: email,
        },
      ]);
    
    if (profileError) throw profileError;
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function createChatSession() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');

  const { data: session, error } = await supabase
    .from('chat_sessions')
    .insert({
      user_id: user.id,
    })
    .select(`
      *,
      messages (*)
    `)
    .single();
  
  if (error) throw error;
  return {
    ...session,
    messages: [],
  };
}

export async function getChatSessions() {
  const { data: sessions, error } = await supabase
    .from('chat_sessions')
    .select(`
      *,
      messages (*)
    `)
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  return sessions;
}

export async function sendMessage(sessionId: string, content: string, sender: 'user' | 'server') {
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      session_id: sessionId,
      content,
      sender
    })
    .select()
    .single();
  
  if (error) throw error;
  return message;
}

export function subscribeToMessages(sessionId: string, callback: (message: any) => void) {
  return supabase
    .channel(`messages:${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `session_id=eq.${sessionId}`
      },
      callback
    )
    .subscribe();
}
