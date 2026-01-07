import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { Shield, Send, CheckCircle, Edit, X } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [broadcastText, setBroadcastText] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editBalance, setEditBalance] = useState('');
  const [editWithdrawable, setEditWithdrawable] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, balance, withdrawable_balance, messages')
        .order('full_name');

      if (data) setUsers(data as User[]);
    } catch (e) {
      console.error('Erro ao buscar usuários:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBroadcast = async () => {
    if (!broadcastText.trim()) return;

    setSending(true);
    setSentSuccess(false);

    try {
      const newMessage = {
        id: crypto.randomUUID(),
        text: broadcastText.trim(),
        timestamp: new Date().toISOString(),
        read: false,
      };

      // Atualiza todos os usuários com a nova mensagem
      const { error } = await supabase.rpc('broadcast_message', { message_text: broadcastText.trim() });

      if (error) {
        // Fallback manual se a function não existir
        for (const user of users) {
          const updatedMessages = [...(user.messages || []), newMessage];
          await supabase.from('profiles').update({ messages: updatedMessages }).eq('id', user.id);
        }
      }

      setBroadcastText('');
      setSentSuccess(true);
      setTimeout(() => setSentSuccess(false), 4000);
      fetchUsers();
    } catch (e) {
      alert('Erro ao enviar mensagem');
      console.error(e);
    } finally {
      setSending(false);
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
      fetchUsers();
    } catch (e) {
      alert("Erro ao atualizar saldo");
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-white/40 font-black uppercase italic">Carregando painel...</div>;
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center space-x-4">
        <Shield className="w-8 h-8 text-white" />
        <h2 className="text-3xl font-black text-white uppercase italic">Painel Admin</h2>
      </div>

      {/* Caixa de Broadcast */}
      <div className="bg-[#141417] border border-[#27272A] rounded-2xl p-6">
        <h3 className="text-lg font-black text-white mb-4">Enviar Mensagem para Todos os Usuários</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={broadcastText}
            onChange={(e) => setBroadcastText(e.target.value)}
            placeholder="Digite a mensagem aqui..."
            className="flex-1 bg-[#0A0A0B] border border-[#27272A] px-4 py-3 rounded-xl text-white placeholder-white/30"
            disabled={sending}
          />
          <button
            onClick={handleBroadcast}
            disabled={sending || !broadcastText.trim()}
            className="bg-[#10B981] text-black font-black px-6 py-3 rounded-xl hover:bg-[#0ea372] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            {sending ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
        {sentSuccess && (
          <div className="mt-4 flex items-center gap-2 text-[#10B981] font-bold">
            <CheckCircle className="w-5 h-5" />
            Mensagem enviada com sucesso para todos!
          </div>
        )}
      </div>

      {/* Lista de Usuários */}
      <div className="bg-[#141417] border border-[#27272A] rounded-2xl overflow-hidden">
        <div className="p-8">
          <h3 className="text-xl font-black text-white mb-6">Lista de Usuários</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-[#FAFAFA]/30 uppercase border-b border-[#27272A]">
                  <th className="pb-4">Nome</th>
                  <th className="pb-4">Email</th>
                  <th className="pb-4">Saldo Jogo</th>
                  <th className="pb-4">Saldo Saque</th>
                  <th className="pb-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]/50">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-white/5 transition">
                    <td className="py-4 text-white font-bold text-sm">{user.full_name || 'Sem nome'}</td>
                    <td className="py-4 text-white/80 text-sm">{user.email}</td>
                    <td className="py-4 text-[#10B981] font-bold">R$ {user.balance?.toFixed(2) || '0.00'}</td>
                    <td className="py-4 text-orange-400 font-bold">R$ {user.withdrawable_balance?.toFixed(2) || '0.00'}</td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setEditBalance(user.balance?.toString() || '0');
                          setEditWithdrawable(user.withdrawable_balance?.toString() || '0');
                        }}
                        className="p-2 bg-white/10 text-white rounded-lg hover:bg-[#10B981] hover:text-black transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <div className="bg-[#141417] border border-[#27272A] p-8 rounded-2xl w-full max-w-md space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-xl font-black text-white">Editar Saldo: {editingUser.full_name}</h4>
              <button onClick={() => setEditingUser(null)} className="text-white/40 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <input
              type="number"
              step="0.01"
              value={editBalance}
              onChange={(e) => setEditBalance(e.target.value)}
              className="w-full bg-[#0A0A0B] border border-[#27272A] p-4 rounded-xl text-white font-bold"
              placeholder="Saldo Jogo"
            />
            <input
              type="number"
              step="0.01"
              value={editWithdrawable}
              onChange={(e) => setEditWithdrawable(e.target.value)}
              className="w-full bg-[#0A0A0B] border border-[#27272A] p-4 rounded-xl text-white font-bold"
              placeholder="Saldo Saque"
            />
            <button
              onClick={handleUpdateBalances}
              className="w-full bg-[#10B981] text-black font-black py-4 rounded-xl uppercase"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;