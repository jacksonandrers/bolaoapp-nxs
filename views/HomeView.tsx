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
        console.error('Erro ao buscar bolões:', e);
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

    const updatedMessages = messages.map(m =>
      m.id === messageId ? { ...m, read: true } : m
    );

    await supabase
      .from('profiles')
      .update({ messages: updatedMessages })
      .eq('id', currentUser.id);

    currentUser.messages = updatedMessages;
  };

  const filteredPools = useMemo(() => {
    return pools.filter(p => p.status === activeFilter);
  }, [pools, activeFilter]);

  if (loading) {
    return (
      <div className="text-center py-20 text-white/40 font-bold">
        Carregando bolões...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Sininho no canto superior direito */}
      <div className="flex justify-end">
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
            <div className="absolute right-0 mt-3 w-80 bg-[#141417] border border-[#27272A] rounded-2xl p-4 z-50">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-black text-white">Notificações</h4>
                <button onClick={() => setShowNotifications(false)}>
                  <X className="w-5 h-5 text-white/60 hover:text-white" />
                </button>
              </div>

              {messages.length === 0 && (
                <div className="text-white/40 text-sm">
                  Nenhuma notificação.
                </div>
              )}

              <div className="space-y-3 max-h-80 overflow-auto">
                {messages
                  .slice()
                  .reverse()
                  .map(message => (
                    <div
                      key={message.id}
                      onClick={() => handleReadMessage(message.id)}
                      className={`p-3 rounded-xl cursor-pointer ${
                        message.read
                          ? 'bg-[#0A0A0B] text-white/60'
                          : 'bg-[#10B981] text-black font-bold'
                      }`}
                    >
                      <div className="text-sm">{message.text}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {format(new Date(message.timestamp), 'dd/MM/yyyy HH:mm')}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3">
        {Object.values(PoolStatus).map(status => (
          <button
            key={status}
            onClick={() => setActiveFilter(status)}
            className={`px-5 py-2 rounded-xl font-black ${
              activeFilter === status
                ? 'bg-[#10B981] text-black'
                : 'bg-[#141417] border border-[#27272A] text-white/60'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Lista de bolões */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPools.map(pool => (
          <PoolCard
            key={pool.id}
            pool={pool}
            onClick={() => onPoolClick(pool)}
          />
        ))}
      </div>
    </div>
  );
};

export default HomeView;
