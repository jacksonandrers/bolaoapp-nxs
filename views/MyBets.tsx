
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Pool, PoolStatus, User, Bet } from '../types';
import PoolCard from '../components/PoolCard';
import { Trophy, UserCircle, Archive, ArrowLeft } from 'lucide-react';

interface MyBetsProps {
  onPoolClick: (pool: Pool) => void;
  currentUser: User;
}

const MyBets: React.FC<MyBetsProps> = ({ onPoolClick, currentUser }) => {
  const [activeSubTab, setActiveSubTab] = useState<'bets' | 'created'>('bets');
  const [pools, setPools] = useState<Pool[]>([]);
  const [userBets, setUserBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: poolsData } = await supabase.from('pools').select('*');
      const { data: betsData } = await supabase.from('bets').select('*').eq('user_id', currentUser.id);
      
      if (poolsData) setPools(poolsData as Pool[]);
      if (betsData) setUserBets(betsData as Bet[]);
      setLoading(false);
    };
    fetchData();
  }, [currentUser]);

  const filteredPools = useMemo(() => {
    if (activeSubTab === 'bets') {
      const poolIds = Array.from(new Set(userBets.map(b => b.pool_id)));
      return pools.filter(p => poolIds.includes(p.id));
    } else {
      return pools.filter(p => p.creator_id === currentUser.id);
    }
  }, [activeSubTab, pools, userBets, currentUser]);

  if (loading) return <div className="py-20 text-center opacity-10 uppercase font-black italic">Carregando seus bolões...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">Meus Bolões</h2>

      <div className="flex space-x-2">
        <button 
          onClick={() => setActiveSubTab('bets')}
          className={`flex items-center px-5 py-2.5 rounded-xl text-xs font-black transition-all border ${activeSubTab === 'bets' ? 'bg-[#10B981] text-black border-[#10B981] shadow-lg' : 'bg-transparent text-[#FAFAFA]/40 border-[#27272A]'}`}
        >
          <Trophy className="w-4 h-4 mr-2" />
          Minhas Apostas
        </button>
        <button 
          onClick={() => setActiveSubTab('created')}
          className={`flex items-center px-5 py-2.5 rounded-xl text-xs font-black transition-all border ${activeSubTab === 'created' ? 'bg-[#10B981] text-black border-[#10B981] shadow-lg' : 'bg-transparent text-[#FAFAFA]/40 border-[#27272A]'}`}
        >
          <UserCircle className="w-4 h-4 mr-2" />
          Criados por Mim
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPools.map(pool => (
          <PoolCard key={pool.id} pool={pool} onClick={onPoolClick} />
        ))}

        {filteredPools.length === 0 && (
          <div className="col-span-full py-24 bg-[#141417]/30 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center opacity-20">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">Nenhum bolão encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBets;
