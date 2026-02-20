'use client';

import { FC } from 'react';
import clsx from 'clsx';
import { Order } from '@/store/deliveryStore';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}

export const OrderCard: FC<OrderCardProps> = ({ order, onClick }) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    assigned: 'bg-blue-100 text-blue-800',
    'in-transit': 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-gray-900">{order.customerName}</h3>
          <p className="text-sm text-gray-500">Order #{order.id.slice(0, 8)}</p>
        </div>
        <span
          className={clsx('px-3 py-1 rounded-full text-xs font-medium', statusColors[order.status])}
        >
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="text-sm">
          <p className="text-gray-600">📍 {order.pickupAddress}</p>
          <p className="text-gray-600">→ {order.deliveryAddress}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-lg font-bold text-primary">${order.totalPrice.toFixed(2)}</span>
        <span className="text-sm text-gray-500">{order.items.length} items</span>
      </div>
    </div>
  );
};
