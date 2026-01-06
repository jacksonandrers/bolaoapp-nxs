
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types';
import { Phone, Mail, Lock, User as UserIcon } from 'lucide-react';

interface AuthProps {
  onLogin: () => void;
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
      if (isRegistering) {
        if (!whatsapp || whatsapp.length < 8) throw new Error('WhatsApp inválido.');
        
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name }
          }
        });

        if (signUpError) throw signUpError;
        if (!data.user) throw new Error('Falha no cadastro.');

        // Create profile in profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name,
            email,
            whatsapp,
            role: email.toLowerCase().includes('admin') || email === 'upmarketingassessoria@gmail.com' ? UserRole.ADMIN : UserRole.USER,
            balance: 0,
            withdrawable_balance: 0,
            messages: []
          });

        if (profileError) throw profileError;
        alert('Cadastro realizado! Verifique seu e-mail se necessário.');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) throw signInError;
      }
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Erro na autenticação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B] relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#10B981]/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#10B981]/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md px-6 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[#10B981]/20 to-transparent p-1 mb-6 shadow-2xl shadow-[#10B981]/10">
            <img 
              src="https://raw.githubusercontent.com/stackblitz/stackblitz-images/main/bolao-app-logo.png" 
              alt="Logo" 
              className="w-full h-full object-cover rounded-[1.8rem] border border-white/10"
            />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase mb-1">
            BOLÃO <span className="text-[#10B981]">APP</span>
          </h1>
          <p className="text-[#FAFAFA]/30 font-black uppercase tracking-[0.3em] text-[10px]">Cloud Powered Platform</p>
        </div>

        <div className="bg-[#141417]/80 backdrop-blur-xl border border-[#27272A] rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">
              {isRegistering ? 'Criar Conta' : 'Acessar Área VIP'}
            </h2>
          </div>
          
          <form onSubmit={handleAuth} className="space-y-5">
            {isRegistering && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-[#FAFAFA]/40 ml-1">Nome Completo</label>
                  <div className="relative">
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-2xl pl-12 pr-5 py-4 font-bold text-white outline-none focus:border-[#10B981] transition-all" placeholder="Seu nome" required />
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FAFAFA]/10" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-[#10B981] ml-1">WhatsApp</label>
                  <div className="relative">
                    <input type="text" placeholder="(00) 00000-0000" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#10B981]/30 rounded-2xl pl-12 pr-5 py-4 font-bold text-white outline-none focus:border-[#10B981] transition-all" required />
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#10B981]/50" />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase text-[#FAFAFA]/40 ml-1">E-mail</label>
              <div className="relative">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-2xl pl-12 pr-5 py-4 font-bold text-white outline-none focus:border-[#10B981] transition-all" placeholder="seu@email.com" required />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FAFAFA]/10" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase text-[#FAFAFA]/40 ml-1">Senha</label>
              <div className="relative">
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-2xl pl-12 pr-5 py-4 font-bold text-white outline-none focus:border-[#10B981] transition-all" placeholder="••••••••" required />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FAFAFA]/10" />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl">
                <p className="text-red-400 text-[10px] font-black uppercase text-center">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-[#10B981] text-black font-black py-5 rounded-2xl hover:bg-[#0ea372] transition-all shadow-xl shadow-[#10B981]/10 mt-4 uppercase italic disabled:opacity-50">
              {loading ? 'PROCESSANDO...' : isRegistering ? 'FINALIZAR CADASTRO' : 'ENTRAR NO SISTEMA'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#27272A] text-center">
            <button onClick={() => { setError(''); setIsRegistering(!isRegistering); }} className="text-[10px] font-black text-[#FAFAFA]/30 uppercase hover:text-[#10B981] tracking-widest">
              {isRegistering ? 'Já tem conta? Faça Login' : 'Ainda não é membro? Cadastre-se'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
