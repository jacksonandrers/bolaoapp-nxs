
import { createClient } from '@supabase/supabase-js';

// Usando as chaves do ambiente Vite
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Atenção: Credenciais do Supabase não encontradas. O app pode apresentar erros de conexão.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
