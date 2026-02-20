'use client';

import { FC, useState, useRef } from 'react';
import { Driver, useDeliveryStore } from '@/store/deliveryStore';

interface DriverFormProps {
  onSubmit?: (driver: Driver) => void;
}

export const DriverForm: FC<DriverFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicle: '',
  });
  const [success, setSuccess] = useState('');
  const nameRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // simple validation
    if (!formData.name.trim()) return;
    const phoneDigits = formData.phone.replace(/[^0-9]/g, '');
    if (phoneDigits.length < 7) {
      alert('Enter a valid phone number');
      return;
    }
    const newDriver: Driver = {
      id: `DRV-${Date.now()}`,
      name: formData.name,
      phone: formData.phone,
      vehicle: formData.vehicle,
      status: 'available',
      currentLocation: { lat: 40.7128, lng: -74.006 }, // Default NYC location
      rating: 5,
    };

    // Add to global store so parent pages don't need to handle insertion
    useDeliveryStore.setState((s) => ({ drivers: [...s.drivers, newDriver] }));
    // Call optional callback (keeps existing behavior)
    onSubmit?.(newDriver);

    setFormData({ name: '', phone: '', vehicle: '' });
    setSuccess('Driver added');
    // focus name field for faster entry
    nameRef.current?.focus();
    setTimeout(() => setSuccess(''), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Add Driver</h2>

      <div className="space-y-4">
        <input
          ref={nameRef}
          type="text"
          placeholder="Driver Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />

        <input
          type="tel"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />

        <input
          type="text"
          placeholder="Vehicle Type"
          value={formData.vehicle}
          onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />

        <button
          type="submit"
          disabled={!formData.name || !formData.phone || !formData.vehicle}
          className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Driver
        </button>
        {success && <div className="small" style={{marginTop:8,color:'green'}}>{success}</div>}
      </div>
    </form>
  );
};
