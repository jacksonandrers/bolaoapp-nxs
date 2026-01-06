
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types';
import { Phone, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

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
        if (!whatsapp || whatsapp.length < 10) {
          throw new Error('Informe um WhatsApp válido com DDD.');
        }
        if (!name || name.length < 3) {
          throw new Error('Nome muito curto.');
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            data: { 
              full_name: name,
              whatsapp: whatsapp 
            } 
          }
        });

        if (signUpError) throw signUpError;
        if (!data?.user) throw new Error('Não foi possível criar o usuário.');

        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name,
            email,
            whatsapp,
            role: email.toLowerCase().includes('admin') ? UserRole.ADMIN : UserRole.USER,
            balance: 0,
            withdrawable_balance: 0,
            created_at: new Date().toISOString()
          });

        if (profileError) throw profileError;
        
        alert('Conta criada com sucesso!');
        setIsRegistering(false);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) throw signInError;
        onLogin();
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[#10B981]/5 blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md px-6 relative z-10">
        <div className="bg-[#141417] border border-[#27272A] rounded-[2.5rem] p-10 shadow-2xl">
          <div className="text-center mb-8">
             <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">
               BOLÃO <span className="text-[#10B981]">PRO</span>
             </h1>
             <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest mt-1">Acesso Premium</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isRegistering && (
              <>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input type="text" placeholder="Nome Completo" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#27272A] p-4 pl-12 rounded-2xl text-white outline-none focus:border-[#10B981] transition-all text-sm font-medium" required />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input type="text" placeholder="WhatsApp (com DDD)" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#27272A] p-4 pl-12 rounded-2xl text-white outline-none focus:border-[#10B981] transition-all text-sm font-medium" required />
                </div>
              </>
            )}
            
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#27272A] p-4 pl-12 rounded-2xl text-white outline-none focus:border-[#10B981] transition-all text-sm font-medium" required />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#27272A] p-4 pl-12 rounded-2xl text-white outline-none focus:border-[#10B981] transition-all text-sm font-medium" required />
            </div>
            
            {error && (
              <div className="flex items-center space-x-2 text-red-500 bg-red-500/10 p-4 rounded-xl text-[10px] font-black uppercase">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-[#10B981] text-black font-black py-5 rounded-2xl hover:opacity-90 transition-all uppercase italic tracking-widest text-xs shadow-lg shadow-[#10B981]/10">
              {loading ? 'SINCRONIZANDO...' : (isRegistering ? 'CADASTRAR' : 'ENTRAR')}
            </button>
          </form>

          <button onClick={() => setIsRegistering(!isRegistering)} className="w-full text-center mt-8 text-[10px] text-white/20 uppercase font-black hover:text-[#10B981] transition-colors tracking-[0.2em]">
            {isRegistering ? 'Logar' : 'Criar conta'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
