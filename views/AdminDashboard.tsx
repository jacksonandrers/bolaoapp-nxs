import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, UserRole } from '../types';
import { Shield, Send, CheckCircle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [broadcastText, setBroadcastText] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // 🔐 garante que só admin pode carregar
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== UserRole.ADMIN) {
        setLoading(false);
        return;
      }

      // ✅ query segura (sem campo inexistente)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, balance, withdrawable_balance')
        .order('full_name');

      if (error) {
        console.error('Erro Supabase:', error);
        return;
      }

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
      // ⚠️ Mensagens globais DEVEM ir para outra tabela futuramente
      alert('Broadcast preparado, mas mensagens globais ainda não implementadas.');
      setBroadcastText('');
      setSentSuccess(true);
      setTimeout(() => setSentSuccess(false), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-white/40 font-black uppercase italic">
        Carregando painel...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center space-x-4">
        <Shield className="w-8 h-8 text-white" />
        <h2 className="text-3xl font-black text-white uppercase italic">
          Painel Admin
        </h2>
      </div>

      {/* Broadcast */}
      <div className="bg-[#141417] border border-[#27272A] rounded-2xl p-6">
        <h3 className="text-lg font-black text-white mb-4">
          Enviar Mensagem para Todos
        </h3>

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
            className="bg-[#10B981] text-black font-black px-6 py-3 rounded-xl hover:bg-[#0ea372] disabled:opacity-50 transition flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            {sending ? 'Enviando...' : 'Enviar'}
          </button>
        </div>

        {sentSuccess && (
          <div className="mt-4 flex items-center gap-2 text-[#10B981] font-bold">
            <CheckCircle className="w-5 h-5" />
            Mensagem enviada!
          </div>
        )}
      </div>

      {/* Lista */}
      <div className="bg-[#141417] border border-[#27272A] rounded-2xl overflow-hidden">
        <div className="p-8">
          <h3 className="text-xl font-black text-white mb-6">
            Lista de Usuários
          </h3>

          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex justify-between items-center bg-[#0A0A0B] border border-[#27272A] rounded-xl px-4 py-3"
              >
                <div>
                  <p className="text-white font-bold">{user.full_name}</p>
                  <p className="text-white/40 text-sm">{user.email}</p>
                </div>

                <div className="text-right text-sm text-white/60">
                  <div>Saldo: R$ {user.balance?.toFixed(2) ?? '0.00'}</div>
                  <div>Saque: R$ {user.withdrawable_balance?.toFixed(2) ?? '0.00'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;