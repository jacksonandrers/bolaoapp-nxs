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
      <div className="flex justify-end">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-3 bg-[#141417] border border-[#27272A] rounded-xl text-white/60 hover:text-[#10B981] transition relative"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#10B981] text-black text-xs font-black rounded-full flex