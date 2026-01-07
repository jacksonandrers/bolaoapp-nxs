import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Pool, PoolStatus } from '../types';
import PoolCard from '../components/PoolCard';

interface HomeViewProps {
  onPoolClick: (pool: Pool) => void;
  onNavigate: (tab: string) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onPoolClick, onNavigate }) => {
  const [activeFilter, setActiveFilter] = useState<PoolStatus>(PoolStatus.OPEN);
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);

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

  const filteredPools = useMemo(() => {
    return pools.filter(p => p.status === activeFilter);
  }, [pools, activeFilter]);

  if (loading) {
    return <div className="text-center py-20 text-white/40 font-bold">Carregando bolões...</div>;
  }

  return (
    <div className="space-y-8">
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