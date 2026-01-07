import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Pool, PoolStatus, UserMessage } from '../types';
import PoolCard from '../components/PoolCard';
import { Bell, X } from 'lucide-react';
import { format } from 'date-fns';

interface HomeViewProps {
  onPoolClick: (pool: Pool) => void;
  onNavigate: (tab: string) => void;
  currentUser: any;
}

const HomeView: React.FC<HomeViewProps> = ({ onPoolClick, onNavigate, currentUser }) => {
  const [activeFilter, setActiveFilter] = useState<PoolStatus>(PoolStatus.OPEN);
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const { data } = await supabase
          .from('pools')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (data) setPools(data as Pool[]);
      } catch (e) {
        console.error("Erro ao buscar bolões:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchPools();
  }, []);

  const messages = (currentUser?.messages as UserMessage[]) || [];
  const unreadCount = messages.filter(m => !m.read).length;

  const handleReadMessage = async (messageId: string) => {
    if (!currentUser) return;
    const updatedMessages = messages.map(m => m.id === messageId ? { ...m, read: true } : m);
    await supabase.from('profiles').update({ messages: updatedMessages }).eq('id', currentUser.id);
    // Atualiza local sem reload
    currentUser.messages = updatedMessages;
  };

  const filteredPools = useMemo(() => {
    return pools.filter(p => p.status === activeFilter);
  }, [pools, activeFilter]);

  if (loading) {
    return <div className="text-center py-20 text-white/40 font-bold">Carregando bolões...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Sininho no canto superior direito */}
      <div className="flex justify-end mb-4">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-3 bg-[#141417] border border-[#27272A] rounded-xl text-white/60 hover:text-[#10B981] transition relative"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#10B981] text-black text-xs font-black rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-96 bg-[#141417] border border-[#27272A] rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="p-4 border-b border-[#27272A] flex justify-between items-center">
                <h4 className="text-white font-bold">Notificações</h4>
                <button onClick={() => setShowNotifications(false)} className="text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto p-4 space-y-3">
                {messages.length > 0 ? messages.map(msg => (
                  <div 
                    key={msg.id} 
                    onClick={() => handleReadMessage(msg.id)}
                    className={`p-4 rounded-xl cursor-pointer transition ${msg.read ? 'bg-[#0A0A0B]' : 'bg-[#10B981]/10 border border-[#10B981]/20'}`}
                  >
                    <p className="text-xs text-white/40">{format(new Date(msg.timestamp), "dd/MM/yyyy HH:mm")}</p>
                    <p className="text-white font-medium mt-1">{msg.text}</p>
                  </div>
                )) : (
                  <p className="text-center text-white/40 py-8">Nenhuma mensagem</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lista de Bolões */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-white">Bolões</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveFilter(PoolStatus.OPEN)}
            className={`px-6 py-2 rounded-lg font-bold ${activeFilter === PoolStatus.OPEN ? 'bg-[#10B981] text-black' : 'bg-[#141417] text-white/60'}`}
          >
            Abertos
          </button>
          <button 
            onClick={() => setActiveFilter(PoolStatus.AWAITING_RESULT)}
            className={`px-6 py-2 rounded-lg font-bold ${activeFilter === PoolStatus.AWAITING_RESULT ? 'bg-[#10B981] text-black' : 'bg-[#141417] text-white/60'}`}
          >
            Aguardando
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPools.length > 0 ? (
          filteredPools.map(pool => (
            <PoolCard key={pool.id} pool={pool} onClick={() => onPoolClick(pool)} />
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-white/40 font-bold text-xl">
            Nenhum evento {activeFilter === PoolStatus.OPEN ? 'aberto' : 'aguardando resultado'}
          </div>
        )}
      </div>

      <div className="text-center mt-10">
        <button 
          onClick={() => onNavigate('create-pool')}
          className="bg-[#10B981] text-black font-bold px-8 py-4 rounded-xl text-lg hover:bg-[#0ea372] transition"
        >
          Criar Novo Bolão
        </button>
      </div>
    </div>
  );
};

export default HomeView;