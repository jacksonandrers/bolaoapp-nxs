import React, { useState } from 'react';
import { supabase } from '../lib/supabase'; // Caminho consistente
import { UserRole } from '../types';
import { Phone, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

interface AuthProps {
  onLogin: (profile: any) => void; // Recebe o profile
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let profile: any = null;

      if (isRegistering) {
        if (!name || name.length < 3) {
          throw new Error('Nome muito curto.');
        }
        if (!whatsapp || whatsapp.length < 10) {
          throw new Error('Informe um WhatsApp válido.');
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;
        if (!data.user) throw new Error('Usuário não criado.');

        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: name,
            email,
            whatsapp,
            role: email.toLowerCase().includes('admin')
              ? UserRole.ADMIN
              : UserRole.USER,
            balance: 0,
            withdrawable_balance: 0,
          });

        if (profileError) throw profileError;

        const { data: fetchedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        profile = fetchedProfile;

      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        if (!data.user) throw new Error('Usuário não encontrado.');

        const userId = data.user.id;

        let { data: fetchedProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (fetchError || !fetchedProfile) {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: data.user.email,
              full_name: 'Usuário',
              whatsapp: '',
              role: UserRole.USER,
              balance: 0,
              withdrawable_balance: 0,
            })
            .select()
            .single();

          if (createError) throw createError;
          fetchedProfile = newProfile;
        }

        profile = fetchedProfile;
      }

      onLogin(profile); // Passa o profile completo

    } catch (err: any) {
      setError(err.message || 'Erro inesperado.');
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
                />
                <input
                  placeholder="WhatsApp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full p-3 rounded bg-black text-white"
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
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#10B981] text-black font-bold py-3 rounded"
            >
              {loading
                ? 'Processando...'
                : isRegistering
                ? 'Criar conta'
                : 'Entrar'}
            </button>
          </form>

          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="mt-6 text-sm text-white/50 w-full text-center"
          >
            {isRegistering ? 'Já tenho conta' : 'Criar conta'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;