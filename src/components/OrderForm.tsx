'use client';

import { FC, useState } from 'react';
import { Order, useDeliveryStore } from '@/store/deliveryStore';

interface OrderFormProps {
  onSubmit?: (order: Order) => void;
}

export const OrderForm: FC<OrderFormProps> = ({ onSubmit }) => {
  const addOrder = useDeliveryStore((state) => state.addOrder);
  const [formData, setFormData] = useState({
    customerName: '',
    pickupAddress: '',
    deliveryAddress: '',
    items: '',
    totalPrice: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      customerId: `CUST-${Date.now()}`,
      customerName: formData.customerName,
      pickupAddress: formData.pickupAddress,
      deliveryAddress: formData.deliveryAddress,
      status: 'pending',
      items: [
        {
          name: formData.items || 'Package',
          quantity: 1,
          price: parseFloat(formData.totalPrice) || 0,
        },
      ],
      totalPrice: parseFloat(formData.totalPrice) || 0,
      createdAt: new Date(),
    };

    addOrder(newOrder);
    onSubmit?.(newOrder);

    setFormData({
      customerName: '',
      pickupAddress: '',
      deliveryAddress: '',
      items: '',
      totalPrice: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Create New Order</h2>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Customer Name"
          value={formData.customerName}
          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />

        <input
          type="text"
          placeholder="Pickup Address"
          value={formData.pickupAddress}
          onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />

        <input
          type="text"
          placeholder="Delivery Address"
          value={formData.deliveryAddress}
          onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />

        <input
          type="text"
          placeholder="Items Description"
          value={formData.items}
          onChange={(e) => setFormData({ ...formData, items: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <input
          type="number"
          placeholder="Total Price"
          value={formData.totalPrice}
          onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          step="0.01"
          required
        />

        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
        >
          Create Order
        </button>
      </div>
    </form>
  );
};
