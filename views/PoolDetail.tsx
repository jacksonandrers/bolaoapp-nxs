
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Pool, PoolStatus, UserRole, Bet } from '../types';
import { ArrowLeft, Trophy, CheckCircle2, Phone, Calendar, Timer, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface PoolDetailProps {
  poolId: string;
  onBack: () => void;
  onRefresh?: () => void;
}

const PoolDetail: React.FC<PoolDetailProps> = ({ poolId, onBack, onRefresh }) => {
  const [pool, setPool] = useState<Pool | null>(null);
  const [user, setUser] = useState<any>(null);
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { data: poolData } = await supabase.from('pools').select('*').eq('id', poolId).single();
      const { data: betsData } = await supabase.from('bets').select('*').eq('pool_id', poolId);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setUser(profile);
      }
      
      if (poolData) setPool(poolData as Pool);
      if (betsData) setBets(betsData as Bet[]);
    };
    fetchData();
  }, [poolId]);

  const handleBet = async () => {
    if (!user || !pool || !selectedOption) return;
    if (user.balance < pool.bet_amount) {
      setError('Saldo insuficiente.');
      return;
    }

    setLoading(true);
    try {
      // 1. Deduct balance
      const newBalance = user.balance - pool.bet_amount;
      await supabase.from('profiles').update({ balance: newBalance }).eq('id', user.id);
      
      // 2. Create bet
      await supabase.from('bets').insert({
        pool_id: pool.id,
        user_id: user.id,
        option_selected: selectedOption,
        amount: pool.bet_amount
      });

      // 3. Create transaction record
      await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'BET',
        amount: pool.bet_amount,
        status: 'APPROVED',
        reference_id: pool.id
      });

      if (onRefresh) onRefresh();
      onBack();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!pool) return <div className="py-20 text-center uppercase font-black opacity-10 italic">Localizando Evento...</div>;

  const estimativaPremio = bets.length > 0 ? (bets.reduce((acc, b) => acc + b.amount, 0) * 0.9) : (pool.bet_amount * 0.9);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-20">
      <button onClick={onBack} className="flex items-center text-[#FAFAFA]/50 hover:text-[#FAFAFA] text-xs font-black uppercase italic tracking-widest">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#141417] border border-[#27272A] rounded-[2rem] p-10 shadow-2xl">
            <h1 className="text-4xl font-black italic text-white uppercase mb-8">{pool.name}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-8 border-y border-[#27272A]/50 mb-8">
              <div className="flex items-center space-x-4 text-orange-400"><Timer className="w-5 h-5" /><span>{format(new Date(pool.deadline), "dd/MM - HH:mm")}</span></div>
              <div className="flex items-center space-x-4 text-blue-400"><Calendar className="w-5 h-5" /><span>{format(new Date(pool.event_date), "dd/MM - HH:mm")}</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-[#0A0A0B] p-5 rounded-2xl border border-[#27272A] text-center">
                <DollarSign className="w-5 h-5 text-[#10B981] mx-auto mb-2" />
                <p className="text-[10px] uppercase font-black opacity-30">Custo</p>
                <p className="text-xl font-black">R$ {pool.bet_amount.toFixed(2)}</p>
              </div>
              <div className="bg-[#0A0A0B] p-5 rounded-2xl border border-[#27272A] text-center">
                <Trophy className="w-5 h-5 text-[#10B981] mx-auto mb-2" />
                <p className="text-[10px] uppercase font-black opacity-30">Prêmio Est.</p>
                <p className="text-xl font-black text-[#10B981]">R$ {estimativaPremio.toFixed(2)}</p>
              </div>
            </div>

            {pool.status === PoolStatus.OPEN && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pool.options.map(opt => (
                    <button key={opt} onClick={() => setSelectedOption(opt)} className={`p-6 rounded-2xl border-2 font-black italic uppercase transition-all ${selectedOption === opt ? 'border-[#10B981] bg-[#10B981]/5' : 'border-[#27272A] bg-[#0A0A0B]'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
                {error && <p className="text-red-500 text-center font-black uppercase text-xs">{error}</p>}
                <button onClick={handleBet} disabled={loading || !selectedOption} className="w-full bg-[#10B981] text-black font-black py-5 rounded-2xl uppercase italic disabled:opacity-30">
                  {loading ? 'CONFIRMANDO...' : 'FINALIZAR PALPITE'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolDetail;
