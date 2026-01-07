import React from 'react';

interface BalanceProps {
  currentUser: any;
}

const Balance: React.FC<BalanceProps> = ({ currentUser }) => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black text-white">Saldo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#141417] border border-[#27272A] p-8 rounded-2xl text-center">
          <p className="text-white/40 text-sm font-bold uppercase mb-2">Saldo Disponível</p>
          <p className="text-4xl font-black text-[#10B981]">
            R$ {currentUser?.balance?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="bg-[#141417] border border-[#27272A] p-8 rounded-2xl text-center">
          <p className="text-white/40 text-sm font-bold uppercase mb-2">Saldo para Saque</p>
          <p className="text-4xl font-black text-orange-400">
            R$ {currentUser?.withdrawable_balance?.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      <div className="text-center py-20 text-white/40 font-bold">
        Em breve: depósito e saque via PIX
      </div>
    </div>
  );
};

export default Balance;