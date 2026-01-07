import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types';
import { Phone, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

interface AuthProps {
  onLogin: (profile: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Função reutilizável para garantir que o profile exista
  const ensureProfileExists = async (userId: string, userEmail: string, extraData?: any) => {
    // Primeiro tenta buscar
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      return existingProfile;
    }

    // Se não existir (ou erro de "no row"), cria com upsert
    const profileData = {
      id: userId,
      email: userEmail,
      full_name: extraData?.full_name || 'Usuário',
      whatsapp: extraData?.whatsapp || '',
      role: extraData?.role || UserRole.USER,
      balance: 0,
      withdrawable_balance: 0,
    };

    const { data: newProfile, error: upsertError } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' })
      .select()
      .single();

    if (upsertError) throw upsertError;

    return newProfile;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let profile: any = null;

      if (isRegistering) {
        // Validações simples
        if (!name || name.trim().length < 3) throw new Error('Nome muito curto.');
        if (!whatsapp || whatsapp.trim().length < 10) throw new Error('WhatsApp inválido.');

        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error('Falha ao criar usuário.');

        // Cria profile completo no cadastro
        profile = await ensureProfileExists(authData.user.id, email, {
          full_name: name.trim(),
          whatsapp: whatsapp.trim(),
          role: email.toLowerCase().includes('admin') ? UserRole.ADMIN : UserRole.USER,
        });
      } else {
        // Login normal
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        if (!authData.user) throw new Error('Usuário não encontrado.');

        // Garante profile (cria se for primeiro login)
        profile = await ensureProfileExists(authData.user.id, authData.user.email!);
      }

      onLogin(profile); // Passa o profile pro componente pai
    } catch (err: any) {
      setError(err.message || 'Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B]">
      <div className="w-full max-w-md px-6">
        <div className="bg-[#141417] border border-[#27272A] rounded-3xl p-10">
          <h1 className="text-center text-3xl font-black text-white mb-6">
            BOLÃO <span className="text-[#10B981]">PRO</span>
          </h1>

          <form onSubmit={handleAuth} className="space-y-4">
            {isRegistering && (
              <>
                <input
                  placeholder="Nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded bg-black text-white"
                  required
                />
                <input
                  placeholder="WhatsApp (somente números)"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-3 rounded bg-black text-white"
                  required
                />
              </>
            )}

            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded bg-black text-white"
              required
            />

            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded bg-black text-white"
              required
            />

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#10B981] hover:bg-[#0d9a6e] transition text-black font-bold py-3 rounded"
            >
              {loading ? 'Processando...' : isRegistering ? 'Criar conta' : 'Entrar'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            className="mt-6 text-sm text-white/50 w-full text-center hover:text-white/80 transition"
          >
            {isRegistering ? 'Já tenho conta' : 'Criar conta'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;