
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { 
  TransactionStatus, 
  Pool, 
  User, 
  TransactionType, 
  PoolStatus,
  Transaction
} from '../types';
import { 
  Shield, 
  Users, 
  Trophy, 
  Wallet, 
  ArrowDownCircle, 
  AlertTriangle,
  Check,
  X,
  Edit,
  QrCode,
  Trash2,
  Upload,
  FileText,
  Send,
  Info
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('deposits');
  const [users, setUsers] = useState<User[]>([]);
  const [pools, setPools] = useState<Pool[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [betsCount, setBetsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editBalance, setEditBalance] = useState('');
  const [editWithdrawable, setEditWithdrawable] = useState('');
  const [selectedPoolDetail, setSelectedPoolDetail] = useState<Pool | null>(null);
  
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const [pixKey, setPixKey] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const { data: usersData } = await supabase.from('profiles').select('*');
    const { data: poolsData } = await supabase.from('pools').select('*');
    const { data: txData } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    const { count } = await supabase.from('bets').select('*', { count: 'exact', head: true });

    if (usersData) setUsers(usersData as User[]);
    if (poolsData) setPools(poolsData as Pool[]);
    if (txData) setTransactions(txData as Transaction[]);
    if (count !== null) setBetsCount(count);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const metrics = useMemo(() => {
    const activePoolsCount = pools.filter(p => p.status === PoolStatus.OPEN).length;
    const pendingWithdrawals = transactions.filter(t => t.status === TransactionStatus.PENDING && t.type === TransactionType.WITHDRAWAL).length;
    
    return [
      { label: 'Usuários', value: users.length, icon: Users, color: 'text-white' },
      { label: 'Bolões Ativos', value: activePoolsCount, icon: Trophy, color: 'text-white' },
      { label: 'Total Apostas', value: betsCount, icon: Wallet, color: 'text-[#10B981]' },
      { label: 'Saques Pendentes', value: pendingWithdrawals, icon: ArrowDownCircle, color: 'text-orange-400' },
    ];
  }, [users, pools, transactions, betsCount]);

  const handleActionConfirm = async (txId: string, approve: boolean) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;

    try {
      const newStatus = approve ? TransactionStatus.APPROVED : TransactionStatus.REJECTED;
      
      // Se aprovar depósito, aumenta saldo
      if (approve && tx.type === TransactionType.DEPOSIT) {
        const user = users.find(u => u.id === tx.user_id);
        if (user) {
          await supabase.from('profiles').update({ balance: user.balance + tx.amount }).eq('id', tx.user_id);
        }
      }

      await supabase.from('transactions').update({ status: newStatus }).eq('id', txId);
      fetchData();
    } catch (e) {
      alert("Erro ao processar transação");
    }
  };

  const handleUpdateBalances = async () => {
    if (!editingUser) return;
    try {
      await supabase.from('profiles').update({
        balance: parseFloat(editBalance) || 0,
        withdrawable_balance: parseFloat(editWithdrawable) || 0
      }).eq('id', editingUser.id);
      setEditingUser(null);
      fetchData();
    } catch (e) {
      alert("Erro ao atualizar");
    }
  };

  if (loading) return <div className="py-20 text-center opacity-20 font-black uppercase italic">Carregando Dashboard...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-white" />
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Administração Master</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-[#141417] border border-[#27272A] p-6 rounded-xl flex flex-col justify-between">
            <m.icon className={`w-4 h-4 ${m.color}`} />
            <p className="text-[10px] font-black text-[#FAFAFA]/40 uppercase mt-2">{m.label}</p>
            <p className={`text-xl font-black ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 bg-[#141417] p-1 border border-[#27272A] rounded-xl w-fit">
        {['deposits', 'withdrawals', 'users', 'history'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-[#10B981] text-black' : 'text-[#FAFAFA]/40 hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-[#141417] border border-[#27272A] rounded-2xl overflow-hidden min-h-[400px]">
        {activeTab === 'deposits' && (
          <div className="p-8">
            <h3 className="text-lg font-black text-white italic uppercase mb-6">Depósitos Pendentes</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-[#FAFAFA]/20 uppercase border-b border-[#27272A]">
                    <th className="pb-4">Usuário</th>
                    <th className="pb-4">Valor</th>
                    <th className="pb-4 text-center">Recibo</th>
                    <th className="pb-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272A]/30">
                  {transactions.filter(t => t.type === TransactionType.DEPOSIT && t.status === TransactionStatus.PENDING).map(tx => {
                    const u = users.find(user => user.id === tx.user_id);
                    return (
                      <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 font-black text-white text-xs">{u?.name || 'Desconhecido'} <br/><span className="text-[9px] text-emerald-500">{u?.whatsapp}</span></td>
                        <td className="py-4 font-black text-[#10B981]">R$ {tx.amount.toFixed(2)}</td>
                        <td className="py-4 text-center">
                           {tx.receipt_url && <button onClick={() => setPreviewImage(tx.receipt_url!)} className="text-[#10B981] text-[10px] font-black uppercase italic hover:underline">Ver Imagem</button>}
                        </td>
                        <td className="py-4 text-right flex justify-end space-x-2">
                          <button onClick={() => handleActionConfirm(tx.id, true)} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><Check className="w-4 h-4" /></button>
                          <button onClick={() => handleActionConfirm(tx.id, false)} className="p-2 bg-red-500/10 text-red-500 rounded-lg"><X className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="p-8">
             <h3 className="text-lg font-black text-white italic uppercase mb-6">Membros Registrados</h3>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="text-[10px] font-black text-[#FAFAFA]/20 uppercase border-b border-white/5">
                     <th className="pb-4">Nome</th>
                     <th className="pb-4">S. Jogo</th>
                     <th className="pb-4">S. Saque</th>
                     <th className="pb-4 text-right">Ação</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {users.map(u => (
                     <tr key={u.id} className="hover:bg-white/5 transition-colors">
                       <td className="py-4 font-black text-white text-xs">{u.name} <br/><span className="text-[9px] text-white/40">{u.whatsapp}</span></td>
                       <td className="py-4 text-emerald-500 font-bold text-xs">R$ {u.balance.toFixed(2)}</td>
                       <td className="py-4 text-orange-400 font-bold text-xs">R$ {u.withdrawable_balance.toFixed(2)}</td>
                       <td className="py-4 text-right">
                         <button onClick={() => { setEditingUser(u); setEditBalance(u.balance.toString()); setEditWithdrawable(u.withdrawable_balance.toString()); }} className="p-3 bg-white/5 text-white rounded-xl hover:bg-[#10B981] hover:text-black transition-all">
                           <Edit className="w-4 h-4" />
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/98 animate-in fade-in">
           <div className="bg-[#141417] border border-[#27272A] p-10 rounded-[2.5rem] w-full max-w-md space-y-8 relative shadow-2xl">
              <button onClick={() => setEditingUser(null)} className="absolute top-6 right-6 text-white/20 hover:text-white"><X className="w-6 h-6" /></button>
              <h4 className="text-xl font-black uppercase text-white italic text-center">Ajustar Saldo: {editingUser.name}</h4>
              <div className="space-y-5">
                <input type="number" step="0.01" value={editBalance} onChange={(e) => setEditBalance(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#27272A] p-4 rounded-2xl text-white font-bold" placeholder="Saldo Jogo" />
                <input type="number" step="0.01" value={editWithdrawable} onChange={(e) => setEditWithdrawable(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#27272A] p-4 rounded-2xl text-white font-bold" placeholder="Saldo Saque" />
              </div>
              <button onClick={handleUpdateBalances} className="w-full py-4 bg-[#10B981] text-black rounded-2xl font-black uppercase italic">SALVAR DADOS</button>
           </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/98" onClick={() => setPreviewImage(null)}>
           <img src={previewImage} className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl border border-white/10" alt="Comprovante" />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
