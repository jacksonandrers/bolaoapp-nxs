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
        .select('id, full_name, email, balance, withdrawable_balance')
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
      for (const user of users) {
        const updatedMessages = [...(user.messages || []), newMessage];
        await supabase.from('profiles').update({ messages: updatedMessages }).eq('id', user.id);
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
        <h3 className="text-lg font-black text-white mb-4">Enviar Mensagem para Todos</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={broadcastText}
            onChange={(e) => setBroadcastText(e.target.value)}
            placeholder="Digite a mensagem aqui..."
            className="flex-1 bg-[#0A0A0B] border border-[#27272A] px-4 py-3 rounded-xl text-white"
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
            Mensagem enviada para todos os usuários!
          </div>
        )}
      </div>

      {/* Lista de Usuários */}
      <div className="bg-[#141417] border border-[#27272A] rounded-2xl overflow-hidden">
        <div className="p-8">
          <h3 className="text-xl font-black text-white mb-6">Lista de Usuários</h3>
