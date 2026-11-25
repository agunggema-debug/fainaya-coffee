'use client';

import React from 'react';

interface CartItemProps {
  item: any;
  onQuantityChange: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

export function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  return (
    <div className="flex items-center justify-between gap-3 p-2 rounded-lg bg-white/50 border border-coffee-200">
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-coffee-900 truncate">{item.name}</h4>
        <p className="text-xs text-coffee-600">{item.station === 'barista' ? 'Barista' : 'Dapur'}</p>
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => onQuantityChange(item.productId, -1)}
            className="w-6 h-6 rounded-lg neumorphic-btn flex items-center justify-center text-coffee-600"
          >
            <span className="text-[10px]">−</span>
          </button>
          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
          <button
            onClick={() => onQuantityChange(item.productId, 1)}
            className="w-6 h-6 rounded-lg neumorphic-btn flex items-center justify-center text-coffee-600"
          >
            <span className="text-[10px]">+</span>
          </button>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-coffee-900">
          Rp {((Number(item.price) || 0) * (Number(item.quantity) || 0)).toLocaleString('id-ID')}
        </p>
        <button
          onClick={() => onRemove(item.productId)}
          className="text-xs text-red-500 hover:text-red-700"
        >
          Hapus
        </button>
      </div>
    </div>
  );
}