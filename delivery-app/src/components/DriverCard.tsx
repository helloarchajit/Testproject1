'use client';

import { FC } from 'react';
import clsx from 'clsx';
import { Driver } from '@/store/deliveryStore';

interface DriverCardProps {
  driver: Driver;
  onClick?: () => void;
}

export const DriverCard: FC<DriverCardProps> = ({ driver, onClick }) => {
  const statusColors = {
    available: 'bg-green-100 text-green-800',
    busy: 'bg-yellow-100 text-yellow-800',
    offline: 'bg-gray-100 text-gray-800',
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-gray-900">{driver.name}</h3>
          <p className="text-sm text-gray-500">{driver.vehicle}</p>
        </div>
        <span
          className={clsx('px-3 py-1 rounded-full text-xs font-medium', statusColors[driver.status])}
        >
          {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
        </span>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-600">📞 {driver.phone}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">⭐ {driver.rating.toFixed(1)}</span>
          {driver.activeOrderId && (
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
              Active Delivery
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
