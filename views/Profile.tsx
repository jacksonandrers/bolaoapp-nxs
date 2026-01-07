import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { format } from 'date-fns';
import { Shield, Mail, Calendar, Key, Save, AlertCircle, Phone } from 'lucide-react';

interface ProfileProps {
  onUpdate: () => void;
  currentUser: User;
}

const Profile: React.FC<ProfileProps> = ({ onUpdate, currentUser }) => {
  const [name, setName] = useState(currentUser.full_name || '');
  const [whatsapp, setWhatsapp] = useState(currentUser.whatsapp || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const isProfileIncomplete = !currentUser.whatsapp || currentUser.whatsapp.length < 8;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: name, whatsapp }) // Atualiza full_name
        .eq('id', currentUser.id);

      if (error) throw error;
      
      setMessage('Perfil atualizado com sucesso!');
      onUpdate();
    } catch (err: any) {
      setMessage('Erro: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      
      {isProfileIncomplete && (
        <div className="bg-orange-500/10 border-2 border-dashed border-orange-500/50 rounded-[3rem] p-10 text-center">
           <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-6" />
           <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">PERFIL INCOMPLETO</h2>
           <p className="text-sm text-orange-500 font-bold uppercase tracking-widest mt-2">Cadastre seu WhatsApp para liberar as funções de aposta e saque.</p>
        </div>
      )}

      <div className="bg-[#141417] border border-[#27272A] rounded-[3rem] p-12 text-center shadow-2xl relative">
        <div className="w-24 h-24 rounded-full bg-[#10B981]/10 flex items-center justify-center text-[#10B981] text-4xl font-black mx-auto mb-6 italic border-2 border-[#10B981]/20">
          {currentUser.full_name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <h2 className="text-4xl font-black mb-3 italic text-white uppercase">{currentUser.full_name || 'Usuário'}</h2>
        <p className="text-[#FAFAFA]/30 text-xs font-black uppercase tracking-widest">{currentUser.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-[#141417] border border-[#27272A] rounded-[3rem] p-10 shadow-2xl">
           <div className="flex items-center space-x-4 mb-8">
              <Key className="w-6 h-6 text-[#10B981]" />
              <h3 className="text-xl font-black italic uppercase text-white">Editar Dados</h3>
           </div>
           
           <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#FAFAFA]/40 uppercase tracking-widest">Nome de Exibição</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-2xl px-6 py-4 focus:border-[#10B981] outline-none font-bold text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#FAFAFA]/40 uppercase tracking-widest">WhatsApp</label>
                <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-2xl px-6 py-4 focus:border-[#10B981] outline-none font-bold text-white" placeholder="(00) 00000-0000" />
              </div>
              
              {message && (
                <div className={`p-4 rounded-xl text-xs font-black uppercase ${message.includes('sucesso') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                  {message}
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full bg-[#10B981] text-black font-black py-5 rounded-2xl hover:bg-[#0ea372] transition-all flex items-center justify-center space-x-2 uppercase italic shadow-xl shadow-[#10B981]/10">
                <Save className="w-5 h-5" />
                <span>{loading ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}</span>
              </button>
           </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;