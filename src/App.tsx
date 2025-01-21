import React, { useState, useEffect } from 'react';
import { ChatWindow } from './components/ChatWindow';
import { SessionList } from './components/SessionList';
import { AuthPage } from './components/AuthPage';
import { User, ChatSession } from './types';
import { supabase, getChatSessions, createChatSession, sendMessage } from './lib/supabase';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  const loadSessions = async () => {
    try {
      const sessions = await getChatSessions();
      setSessions(sessions);
      
      if (sessions.length === 0) {
        const newSession = await createChatSession();
        setSessions([newSession]);
        setCurrentSessionId(newSession.id);
      } else {
        setCurrentSessionId(sessions[0].id);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const handleNewSession = async () => {
    try {
      const newSession = await createChatSession();
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
    } catch (error) {
      console.error('Error creating new session:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    try {
      // Add user message
      await sendMessage(currentSessionId, content, 'user');
      
      // Simulate server response (echo)
      setTimeout(async () => {
        await sendMessage(currentSessionId, content, 'server');
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthSuccess={() => loadSessions()} />;
  }

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  return (
    <div className="flex h-screen bg-white">
      <div className="w-80 h-full">
        <SessionList
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSessionSelect={setCurrentSessionId}
          onNewSession={handleNewSession}
        />
      </div>
      
      <div className="flex-1">
        {currentSession && (
          <ChatWindow
            messages={currentSession.messages}
            onSendMessage={handleSendMessage}
          />
        )}
      </div>
    </div>
  );
}

export default App;