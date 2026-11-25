'use client';

import React from 'react';

interface PaymentSelectorProps {
  value: string;
  onChange: (method: string) => void;
  cashAmount: string;
  setCashAmount: (v: string) => void;
}

export function PaymentSelector({ value, onChange, cashAmount, setCashAmount }: PaymentSelectorProps) {
  const methods = [
    ['CASH', 'Tunai'],
    ['QRIS', 'QRIS'],
    ['E_WALLET', 'E-Wallet'],
    ['CREDIT_CARD', 'Kartu'],
  ];

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-coffee-700">Metode Pembayaran</label>
      <div className="grid grid-cols-2 gap-2">
        {methods.map(([method, label]) => (
          <button
            key={method}
            onClick={() => onChange(method)}
            className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
              value === method
                ? 'neumorphic-pressed bg-coffee-700 text-white border-coffee-700'
                : 'neumorphic-btn text-coffee-600 border-coffee-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {value === 'CASH' && (
        <div className="mt-3">
          <label className="text-sm font-medium text-coffee-700 block mb-1">Jumlah Tunai</label>
          <input
            type="number"
            className="neumorphic-input w-full px-4 py-2 text-coffee-700"
            value={cashAmount}
            onChange={(e) => setCashAmount(e.target.value)}
            placeholder="Masukkan nominal"
          />
        </div>
      )}
    </div>
  );
}