
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Pool, PoolStatus, UserMessage } from '../types';
import PoolCard from '../components/PoolCard';
import { Wallet, Landmark, Phone, Bell, X, MailOpen, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface HomeViewProps {
  onPoolClick: (pool: Pool) => void;
  onNavigate: (tab: string) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onPoolClick, onNavigate }) => {
  const [activeFilter, setActiveFilter] = useState<PoolStatus>(PoolStatus.OPEN);
  const [showNotifications, setShowNotifications] = useState(false);
  const [pools, setPools] = useState<Pool[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          setUser(profile);
        }

        const { data: poolsData } = await supabase
          .from('pools')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (poolsData) setPools(poolsData as Pool[]);
      } catch (e) {
        console.error("Erro ao buscar dados:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeFilter]);

  const messages = (user?.messages as UserMessage[]) || [];
  const unreadCount = messages.filter(m => !m.read).length;

  const filteredPools = useMemo(() => {
    return pools.filter(p => p.status === activeFilter);
  }, [pools, activeFilter]);

  const handleReadMessage = async (messageId: string) => {
    if (!user) return;
    const updatedMessages = messages.filter(m => m.id !== messageId);
    await supabase.from('profiles').update({ messages: updatedMessages }).eq('id', user.id);
    setUser({ ...user, messages: updatedMessages });
  };

  if (loading) return <div className="py-20 text-center text-[#FAFAFA]/20 font-black uppercase italic">Sincronizando...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Minimalista - Apenas Sininho */}
      <div className="flex items-center justify-end">
        <div className="relative">
          <button onClick={() => setShowNotifications(!showNotifications)} className="p-3 bg-[#141417] border border-[#27272A] rounded-2xl text-[#FAFAFA]/40 hover:text-[#10B981] transition-all relative">
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-[#10B981] text-black text-[11px] font-black rounded-full flex items-center justify-center border-2 border-[#0A0A0B]">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-4 w-[450px] max-w-[90vw] bg-[#141417] border border-[#27272A] rounded-[2.5rem] shadow-2xl z-[100] overflow-hidden">
              <div className="p-7 border-b border-[#27272A] flex items-center justify-between bg-[#1A1A1E]">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-5 h-5 text-[#10B981]" />
                  <h4 className="text-xs font-black uppercase text-white">Mensagens da Empresa</h4>
                </div>
                <button onClick={() => setShowNotifications(false)} className="text-white/20 p-2 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="max-h-[500px] overflow-y-auto p-6 space-y-4 bg-[#0D0D0F]">
                {messages.length > 0 ? messages.map(msg => (
                  <div key={msg.id} onClick={() => handleReadMessage(msg.id)} className="p-6 bg-[#141417] border border-[#27272A] rounded-[2rem] cursor-pointer hover:border-[#10B981]/60 transition-all relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#10B981]"></div>
                    <span className="text-[10px] font-black text-[#10B981] uppercase">{format(msg.timestamp, "dd MMM • HH:mm")}</span>
                    <p className="text-sm text-white/90 font-bold mt-2">"{msg.text}"</p>
                  </div>
                )) : <p className="text-center py-20 opacity-20 uppercase font-black text-xs italic tracking-widest">Nenhuma mensagem nova</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hero Banner Sem Imagem e Sem Logo */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#10B981]/15 via-[#141417] to-[#0A0A0B] border border-[#27272A] rounded-[3rem] p-8 md:p-14 shadow-2xl">
        <div className="relative z-10 text-center md:text-left">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-tight italic uppercase">
            Seja bem <span className="text-[#10B981]">vindo</span>
          </h1>
          <p className="text-[#FAFAFA]/40 text-sm font-medium mb-10 max-w-sm mx-auto md:mx-0 uppercase tracking-widest">
            A maior plataforma de bolões do Brasil. Aqui sua diversão é levada a sério.
          </p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <button onClick={() => onNavigate('create-pool')} className="font-black px-8 py-4 rounded-2xl text-xs bg-[#10B981] text-black shadow-lg hover:bg-[#0ea372] transition-all uppercase italic tracking-widest">Criar Bolão</button>
            <button onClick={() => onNavigate('balance')} className="bg-white/5 text-white font-black px-8 py-4 rounded-2xl text-xs border border-white/10 hover:bg-white/10 transition-all uppercase italic tracking-widest">Gerenciar Saldo</button>
          </div>
        </div>
        
        {/* Efeito visual de fundo em vez da imagem */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#10B981]/5 blur-[120px] rounded-full -mr-20 -mt-20"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#141417] border border-[#27272A] p-6 rounded-2xl">
          <div className="flex items-center space-x-2 mb-2"><Wallet className="w-4 h-4 text-[#10B981]" /><p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Saldo Jogo</p></div>
          <p className="text-2xl font-black">R$ {user?.balance?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="bg-[#141417] border border-[#27272A] p-6 rounded-2xl">
          <div className="flex items-center space-x-2 mb-2"><Landmark className="w-4 h-4 text-orange-400" /><p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Saldo Saque</p></div>
          <p className="text-2xl font-black">R$ {user?.withdrawable_balance?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="bg-[#141417] border border-[#27272A] p-6 rounded-2xl">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Eventos Abertos</p>
          <p className="text-2xl font-black text-[#10B981]">{pools.filter(p => p.status === PoolStatus.OPEN).length}</p>
        </div>
        <div className="bg-[#141417] border border-[#27272A] p-6 rounded-2xl">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Aguardando</p>
          <p className="text-2xl font-black text-orange-400">{pools.filter(p => p.status === PoolStatus.AWAITING_RESULT).length}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#27272A]">
        <h2 className="text-xl font-black italic uppercase">Lista de Eventos</h2>
        <div className="flex gap-1 p-1 bg-[#141417] border border-[#27272A] rounded-xl">
          <button onClick={() => setActiveFilter(PoolStatus.OPEN)} className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${activeFilter === PoolStatus.OPEN ? 'bg-[#10B981] text-black' : 'text-[#FAFAFA]/40 hover:text-white'}`}>ABERTOS</button>
          <button onClick={() => setActiveFilter(PoolStatus.AWAITING_RESULT)} className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${activeFilter === PoolStatus.AWAITING_RESULT ? 'bg-[#10B981] text-black' : 'text-[#FAFAFA]/40 hover:text-white'}`}>AGUARDANDO</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPools.length > 0 ? filteredPools.map(pool => (
          <PoolCard key={pool.id} pool={pool} onClick={onPoolClick} />
        )) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-10 uppercase font-black tracking-widest">Nenhum evento nesta categoria</div>
        )}
      </div>
    </div>
  );
};

export default HomeView;
