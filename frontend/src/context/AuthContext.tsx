import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { registerUser, loginUser } from '../services/authService';

// --- Tipos ---
interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  register: (email: string, password: string) => Promise<{ error: string | null }>;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

// --- Contexto ---
const AuthContext = createContext<AuthContextValue | null>(null);

// --- Provider ---
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Carga la sesión activa al montar (ej: si el usuario ya estaba logueado)
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setIsLoading(false);
    });

    // Escucha cambios de sesión (login, logout, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function register(email: string, password: string) {
    // Llama a NestJS → NestJS valida DTO → NestJS llama a Supabase
    return registerUser(email, password);
  }

  async function login(email: string, password: string) {
    // Llama a NestJS → NestJS valida DTO → NestJS llama a Supabase → setSession
    return loginUser(email, password);
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, session, isLoading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// --- Hook ---
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
