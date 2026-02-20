'use client';

import { FC } from 'react';
import { Driver, Order, useDeliveryStore } from '@/store/deliveryStore';

interface AssignDriverModalProps {
  order: Order;
  drivers: Driver[];
  onAssign?: (orderId: string, driverId: string) => void;
  onClose?: () => void;
}

export const AssignDriverModal: FC<AssignDriverModalProps> = ({
  order,
  drivers,
  onAssign,
  onClose,
}) => {
  const assignDriver = useDeliveryStore((state) => state.assignDriver);
  const availableDrivers = drivers.filter((d) => d.status === 'available');

  const handleAssign = (driverId: string) => {
    assignDriver(order.id, driverId);
    onAssign?.(order.id, driverId);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Assign Driver</h2>
        <p className="text-gray-600 mb-4">Order #{order.id.slice(0, 8)}</p>

        {availableDrivers.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No available drivers</p>
        ) : (
          <div className="space-y-2">
            {availableDrivers.map((driver) => (
              <button
                key={driver.id}
                onClick={() => handleAssign(driver.id)}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-primary hover:text-white hover:border-primary transition-colors"
              >
                <div className="font-semibold">{driver.name}</div>
                <div className="text-sm opacity-75">{driver.vehicle}</div>
                <div className="text-sm opacity-75">⭐ {driver.rating.toFixed(1)}</div>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-4 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
