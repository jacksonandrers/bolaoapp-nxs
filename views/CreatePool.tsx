
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Pool, PoolStatus, User } from '../types';
import { ArrowLeft, Trophy, AlertTriangle, ChevronDown, Calendar } from 'lucide-react';

interface CreatePoolProps {
  onCreated: () => void;
  onCancel: () => void;
  currentUser: User;
}

const CreatePool: React.FC<CreatePoolProps> = ({ onCreated, onCancel, currentUser }) => {
  const [name, setName] = useState('');
  const [modality, setModality] = useState('🎾 Beach Tennis');
  const [sideA, setSideA] = useState('');
  const [sideB, setSideB] = useState('');
  const [betAmount, setBetAmount] = useState('10.00');
  const [deadline, setDeadline] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [loading, setLoading] = useState(false);

  const modalities = [
    '🎾 Beach Tennis', '⚽ Futebol', '🏀 Basquete', '🏐 Vôlei', '🏎️ F1', '🥊 MMA', '🎮 E-Sports', '🎯 Outros'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('pools').insert({
        creator_id: currentUser.id,
        name,
        modality,
        deadline,
        event_date: eventDate,
        bet_amount: parseFloat(betAmount),
        options: [sideA, sideB],
        status: PoolStatus.OPEN
      });

      if (error) throw error;
      onCreated();
    } catch (e) {
      alert("Erro ao criar bolão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <button onClick={onCancel} className="flex items-center text-[#FAFAFA]/60 hover:text-[#FAFAFA] transition-colors text-sm font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </button>

      <div className="bg-[#141417] border border-[#27272A] rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#27272A] flex items-center space-x-4">
          <h2 className="text-lg font-bold uppercase italic tracking-tighter">Criar Novo Bolão</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select value={modality} onChange={(e) => setModality(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-4 py-3 text-sm font-bold outline-none" required>
              {modalities.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-4 py-3 text-sm font-bold" placeholder="Nome do Evento" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" value={sideA} onChange={(e) => setSideA(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-4 py-3 text-sm font-bold" placeholder="Time A" required />
            <input type="text" value={sideB} onChange={(e) => setSideB(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-4 py-3 text-sm font-bold" placeholder="Time B" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="number" step="0.01" value={betAmount} onChange={(e) => setBetAmount(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-4 py-3 text-sm font-bold text-[#10B981]" required />
            <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-4 py-3 text-sm font-bold" required />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#10B981] text-black font-black py-4 rounded-xl uppercase italic disabled:opacity-50">
            {loading ? 'PUBLICANDO...' : 'PUBLICAR BOLÃO'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePool;
