
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { TransactionType, TransactionStatus, User, Transaction } from '../types';
import { Wallet, Landmark, Phone, QrCode, Upload, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface BalanceProps {
  onNavigate: (tab: string) => void;
  onRefresh: () => void;
  currentUser: User;
}

const Balance: React.FC<BalanceProps> = ({ onNavigate, onRefresh, currentUser }) => {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [receipt, setReceipt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchData = async () => {
    const { data } = await supabase.from('transactions').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false });
    if (data) setTransactions(data as Transaction[]);
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.from('transactions').insert({
        user_id: currentUser.id,
        type: TransactionType.DEPOSIT,
        amount: parseFloat(depositAmount),
        status: TransactionStatus.PENDING,
        receipt_url: receipt
      });
      alert("Depósito enviado para análise!");
      setDepositAmount('');
      setReceipt(null);
      fetchData();
    } catch (e) {
      alert("Erro ao depositar");
    } finally {
      setLoading(false);
    }
  };

  const isProfileIncomplete = !currentUser.whatsapp || currentUser.whatsapp.length < 5;

  return (
    <div className="space-y-10 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#141417] border border-[#27272A] rounded-[2rem] p-8 shadow-2xl">
          <p className="text-[10px] font-black text-[#FAFAFA]/40 uppercase tracking-[0.2em]">Saldo Jogo</p>
          <p className="text-5xl font-black text-white">R$ {currentUser.balance.toFixed(2)}</p>
        </div>
        <div className="bg-[#141417] border border-[#27272A] rounded-[2rem] p-8 shadow-2xl">
          <p className="text-[10px] font-black text-[#FAFAFA]/40 uppercase tracking-[0.2em]">Saldo Saque</p>
          <p className="text-5xl font-black text-white">R$ {currentUser.withdrawable_balance.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-[#141417] border border-[#27272A] rounded-[2rem] p-10">
        <h3 className="text-xl font-black italic uppercase mb-6">Novo Depósito PIX</h3>
        <form onSubmit={handleDeposit} className="space-y-6 max-w-md">
          <input type="number" step="0.01" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-2xl px-6 py-4 outline-none font-bold" placeholder="Valor R$" required />
          <button type="submit" disabled={loading} className="w-full bg-[#10B981] text-black font-black py-5 rounded-2xl uppercase italic disabled:opacity-50">
            {loading ? 'ENVIANDO...' : 'CONFIRMAR DEPÓSITO'}
          </button>
        </form>
      </div>

      <div className="bg-[#141417] border border-[#27272A] rounded-[2rem] p-10">
        <h3 className="text-xl font-black italic uppercase mb-6">Últimas Movimentações</h3>
        <div className="space-y-3">
          {transactions.map(tx => (
            <div key={tx.id} className="p-4 bg-[#0A0A0B] border border-[#27272A] rounded-xl flex justify-between">
              <div>
                <p className="text-xs font-black uppercase text-white">{tx.type}</p>
                <p className="text-[9px] text-white/30">{format(new Date(tx.created_at || Date.now()), "dd/MM HH:mm")}</p>
              </div>
              <p className={`font-black ${tx.type === 'DEPOSIT' ? 'text-[#10B981]' : 'text-red-500'}`}>R$ {tx.amount.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Balance;
