import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { registerUser, loginUser } from '../services/authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// --- Tipos ---
interface AuthContextValue {
  user: User | null;
  session: Session | null;
  role: string | null;
  isLoading: boolean;
  register: (email: string, password: string) => Promise<{ error: string | null }>;
  login: (email: string, password: string) => Promise<{ error: string | null; role?: string | null }>;
  logout: () => Promise<void>;
}

// --- Helpers ---
async function fetchRole(accessToken: string): Promise<string | null> {
  try {
    const { data } = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return data.role ?? null;
  } catch {
    return null;
  }
}

// --- Contexto ---
const AuthContext = createContext<AuthContextValue | null>(null);

// --- Provider ---
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Carga la sesión activa y el rol al montar
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session) {
        const r = await fetchRole(data.session.access_token);
        setRole(r);
      }
      setIsLoading(false);
    });

    // Escucha cambios de sesión (logout, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (!newSession) setRole(null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function register(email: string, password: string) {
    return registerUser(email, password);
  }

  async function login(email: string, password: string): Promise<{ error: string | null; role?: string | null }> {
    const result = await loginUser(email, password);
    if (result.error) return result;
    // Session ya está activa en supabase client tras loginUser
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      const r = await fetchRole(data.session.access_token);
      setRole(r);
      return { error: null, role: r };
    }
    return { error: null, role: null };
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, session, role, isLoading, register, login, logout }}>
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
