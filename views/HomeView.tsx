import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Pool, PoolStatus, UserMessage } from '../types';
import PoolCard from '../components/PoolCard';
import { Wallet, Landmark, Bell, X, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface HomeViewProps {
  currentUser: any; // Recebe o profile completo do App.tsx
  onPoolClick: (pool: Pool) => void;
  onNavigate: (tab: string) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ currentUser, onPoolClick, onNavigate }) => {
  const [activeFilter, setActiveFilter] = useState<PoolStatus>(PoolStatus.OPEN);
  const [showNotifications, setShowNotifications] = useState(false);
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const { data: poolsData } = await supabase
          .from('pools')
          .select('*')
          .order('created_at', { ascending: false });

        if (poolsData) setPools(poolsData as Pool[]);
      } catch (e) {
        console.error('Erro ao buscar pools:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchPools();
  }, []);

  const messages = (currentUser?.messages as UserMessage[]) || [];
  const unreadCount = messages.filter(m => !m.read).length;

  const filteredPools = useMemo(() => {
    return pools.filter(p => p.status === activeFilter);
  }, [pools, activeFilter]);

  const handleReadMessage = async (messageId: string) => {
    if (!currentUser) return;
    const updatedMessages = messages.filter(m => m.id !== messageId);
    await supabase
      .from('profiles')
      .update({ messages: updatedMessages })
      .eq('id', currentUser.id);

    // Atualiza localmente para refletir imediato
    currentUser.messages = updatedMessages;
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-white/20 font-black uppercase italic">
        Sincronizando...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Notificações */}
      <div className="flex justify-end">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-3 bg-[#141417] border border-[#27272A] rounded-2xl text-white/40 hover:text-[#10B981]"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-[#10B981] text-black text-xs font-black rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-4 w-[420px] bg-[#141417] border border-[#27272A] rounded-3xl z-50">
              <div className="p-4 flex justify-between items-center border-b border-[#27272A]">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#10B981]" />
                  <span className="text-xs font-black uppercase">Mensagens</span>
                </div>
                <button onClick={() => setShowNotifications(false)}>
                  <X className="w-5 h-5 text-white/30" />
                </button>
              </div>

              <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                {messages.length > 0 ? (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      onClick={() => handleReadMessage(msg.id)}
                      className="p-4 bg-[#0D0D0F] border border-[#27272A] rounded-2xl cursor-pointer"
                    >
                      <span className="text-[10px] text-[#10B981] font-black uppercase">
                        {format(msg.timestamp, 'dd/MM HH:mm')}
                      </span>
                      <p className="text-sm mt-2">{msg.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-white/20 text-xs uppercase font-black">
                    Nenhuma mensagem
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hero – agora usa o nome do usuário! */}
      <div className="bg-[#141417] border border-[#27272A] rounded-3xl p-10">
        <h1 className="text-5xl font-black italic uppercase">
          Seja bem <span className="text-[#10B981]">vindo{currentUser?.full_name ? `, ${currentUser.full_name}` : ''}</span>
        </h1>

        <p className="text-white/40 text-sm mt-4 max-w-md uppercase tracking-widest">
          A maior plataforma de bolões do Brasil
        </p>

        <div className="flex gap-4 mt-8">
          <button
            onClick={() => onNavigate('create-pool')}
            className="px-8 py-4 bg-[#10B981] text-black font-black rounded-2xl uppercase text-xs"
          >
            Criar Bolão
          </button>

          <button
            onClick={() => onNavigate('balance')}
            className="px-8 py-4 border border-white/10 rounded-2xl uppercase text-xs font-black"
          >
            Gerenciar Saldo
          </button>
        </div>
      </div>

      {/* Eventos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPools.length > 0 ? (
          filteredPools.map(pool => (
            <PoolCard key={pool.id} pool={pool} onClick={onPoolClick} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-white/20 uppercase font-black">
            Nenhum evento
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeView;