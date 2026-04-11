import { createClient } from '@supabase/supabase-js';

// Estas variables se definen en .env.local (nunca en el repo)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente singleton — importa este objeto en cualquier parte del frontend
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
