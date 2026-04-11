import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// Extrae el mensaje de error de una respuesta de NestJS (puede ser string o array)
function extractError(err: any): string {
  const message = err?.response?.data?.message;
  if (!message) return 'Error de conexión con el servidor';
  return Array.isArray(message) ? message[0] : message;
}

// Capa 2 (backend): NestJS valida el DTO antes de llamar a Supabase
export async function registerUser(
  email: string,
  password: string,
): Promise<{ error: string | null }> {
  try {
    await axios.post(`${API_URL}/auth/register`, { email, password });
    return { error: null };
  } catch (err) {
    return { error: extractError(err) };
  }
}

// NestJS valida el DTO, llama a Supabase y devuelve la sesión
// El frontend activa la sesión con supabase.auth.setSession()
export async function loginUser(
  email: string,
  password: string,
): Promise<{ error: string | null }> {
  try {
    const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
    return { error: null };
  } catch (err) {
    return { error: extractError(err) };
  }
}
