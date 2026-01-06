
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  (import.meta as any).env?.VITE_SUPABASE_URL || 
  'https://vaibomlqtbhhasufviye.supabase.co';

const supabaseAnonKey = 
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
  ''; 

const isConfigured = supabaseUrl && supabaseAnonKey && supabaseAnonKey.length > 10;

// Objeto de proteção para desenvolvimento sem chaves
// Agora com suporte a encadeamento .from().update().eq() etc.
const dummySupabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: { user: null }, error: new Error("Credenciais Supabase ausentes.") }),
    signUp: async () => ({ data: { user: null }, error: new Error("Credenciais Supabase ausentes.") }),
    signOut: async () => ({ error: null }),
  },
  from: () => {
    const chain = {
      select: () => chain,
      insert: () => Promise.resolve({ data: null, error: new Error("Configuração pendente.") }),
      update: () => chain,
      delete: () => chain,
      eq: () => chain,
      order: () => chain,
      single: () => Promise.resolve({ data: null, error: null }),
      then: (resolve: any) => resolve({ data: [], error: null })
    };
    return chain;
  }
} as any;

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : dummySupabase;
