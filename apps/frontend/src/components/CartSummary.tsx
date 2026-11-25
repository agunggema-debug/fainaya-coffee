'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { NeumorphicButton } from '@/components/NeumorphicButton';
import { NeumorphicCard } from '@/components/NeumorphicCard';

interface CartSummaryProps {
  cart: any[];
  subtotal: number;
  tax: number;
  total: number;
  change: number;
  paymentMethod: string;
  cashAmount: string;
  loading: boolean;
  onCheckout: () => void;
}

export function CartSummary({
  cart,
  subtotal,
  tax,
  total,
  change,
  paymentMethod,
  cashAmount,
  loading,
  onCheckout,
}: CartSummaryProps) {
  return (
    <div className="flex-1 flex flex-col">
      <NeumorphicCard className="p-5">
        <h3 className="text-coffee-900 font-semibold text-lg mb-4">Keranjang ({cart.length})</h3>

        {cart.length === 0 ? (
          <div className="text-center py-8 text-coffee-600">
            <span className="text-[48px] mx-auto mb-3 opacity-50">🛒</span>
            <p className="text-sm">Keranjang kosong</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto pr-2 space-y-3">
            {cart.map((item) => (
              <div key={item.productId} className="flex justify-between items-center p-2 rounded-lg bg-white/50 border border-coffee-200">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-coffee-900 truncate">{item.name}</h4>
                  <p className="text-xs text-coffee-600">{item.station === 'barista' ? 'Barista' : 'Dapur'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-coffee-900">
                    Rp {((Number(item.price) || 0) * (Number(item.quantity) || 0)).toLocaleString('id-ID')}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-coffee-600">x{item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-coffee-600">Subtotal</span>
            <span className="font-medium text-coffee-900">Rp {(Number(subtotal) || 0).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-coffee-600">Pajak (11%)</span>
            <span className="font-medium text-coffee-900">Rp {(Number(tax) || 0).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t border-coffee-300 pt-2">
            <span className="text-coffee-900">Total</span>
            <span className="text-coffee-700">Rp {(Number(total) || 0).toLocaleString('id-ID')}</span>
          </div>
        </div>

        <PaymentSelectorInline
          value={paymentMethod}
          cashAmount={cashAmount}
        />
      </NeumorphicCard>

      {change > 0 && (
        <NeumorphicCard className="p-4 border-2 border-green-400 bg-green-50">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" />
            <span className="font-bold text-green-700">Kembalian: Rp {(Number(change) || 0).toLocaleString('id-ID')}</span>
          </div>
        </NeumorphicCard>
      )}
    </div>
  );
}

function PaymentSelectorInline({ value, cashAmount }: { value: string; cashAmount: string }) {
  return (
    <div className="mt-4 space-y-3">
      <label className="text-sm font-medium text-coffee-700">Metode Pembayaran</label>
      <div className="grid grid-cols-2 gap-2">
        {[
          ['CASH', 'Tunai'],
          ['QRIS', 'QRIS'],
          ['E_WALLET', 'E-Wallet'],
          ['CREDIT_CARD', 'Kartu'],
        ].map(([method, label]) => (
          <button
            key={method}
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
        <input
          type="number"
          className="neumorphic-input w-full px-4 py-2 text-coffee-700"
          value={cashAmount}
          placeholder="Masukkan nominal"
        />
      )}
    </div>
  );
}

function CheckCircle({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}