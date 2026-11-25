'use client';

import React from 'react';

interface OrderCardProps {
  item: any;
  onUpdate: (id: string, status: string) => void;
  isSlaBreached: boolean;
}

export function OrderCard({ item, onUpdate, isSlaBreached }: OrderCardProps) {
  const statuses = ['pending', 'preparing', 'ready', 'served'];
  const currentIndex = statuses.indexOf(item.status);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'served': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getMinutesAgo = (dateStr: string) => {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    return mins > 0 ? `${mins}m` : '0m';
  };

  return (
    <div
      className={`neumorphic-card p-4 rounded-xl ${isSlaBreached ? 'border-2 border-red-500' : ''} relative`}
    >
      {isSlaBreached && (
        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
          SLA BREACHED
        </div>
      )}
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="text-xs font-bold text-coffee-700 uppercase tracking-wider">
            #{item.order.orderNumber}
          </span>
          <span className="ml-2 text-xs text-coffee-500">
            {item.order.table?.name || 'Takeaway'} • {getMinutesAgo(item.order.createdAt)}
          </span>
        </div>
        <div className={`${getStatusColor(item.status)} text-xs font-bold px-2 py-1 rounded-full`}>
          {item.status}
        </div>
      </div>

      <div className="mb-3">
        <h4 className="text-sm font-bold text-coffee-900">{item.name}</h4>
        <p className="text-xs text-coffee-600">
          x{item.quantity} • {item.station === 'barista' ? 'Barista' : 'Dapur'}
          {item.notes ? ` • Catatan: ${item.notes}` : ''}
        </p>
      </div>

      <div className="flex gap-2">
        {statuses.slice(currentIndex + 1).map((s) => (
          <button
            key={s}
            onClick={() => onUpdate(item.id, s)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium neumorphic-btn text-coffee-600"
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}