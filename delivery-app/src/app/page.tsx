'use client';

import { useState, useEffect } from 'react';
import { OrderCard } from '@/components/OrderCard';
import { DriverCard } from '@/components/DriverCard';
import { OrderForm } from '@/components/OrderForm';
import { DriverForm } from '@/components/DriverForm';
import { AssignDriverModal } from '@/components/AssignDriverModal';
import { Order, Driver, useDeliveryStore } from '@/store/deliveryStore';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'drivers'>('dashboard');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);

  const orders = useDeliveryStore((state) => state.orders);
  const drivers = useDeliveryStore((state) => state.drivers);
  const addOrder = useDeliveryStore((state) => state.addOrder);

  // Initialize with sample data
  useEffect(() => {
    if (drivers.length === 0) {
      // Add sample drivers
      const sampleDrivers: Driver[] = [
        {
          id: 'DRV-001',
          name: 'John Smith',
          phone: '555-0101',
          vehicle: 'Honda Civic',
          status: 'available',
          currentLocation: { lat: 40.7128, lng: -74.006 },
          rating: 4.8,
        },
        {
          id: 'DRV-002',
          name: 'Maria Garcia',
          phone: '555-0102',
          vehicle: 'Toyota Camry',
          status: 'available',
          currentLocation: { lat: 40.758, lng: -73.9855 },
          rating: 4.9,
        },
        {
          id: 'DRV-003',
          name: 'Alex Johnson',
          phone: '555-0103',
          vehicle: 'Ford Transit',
          status: 'available',
          currentLocation: { lat: 40.7489, lng: -73.968 },
          rating: 4.7,
        },
      ];

      sampleDrivers.forEach((driver) => {
        useDeliveryStore.setState((state) => ({
          drivers: [...state.drivers, driver],
        }));
      });

      // Add sample orders
      const sampleOrders: Order[] = [
        {
          id: 'ORD-001',
          customerId: 'CUST-001',
          customerName: 'Alice Wilson',
          pickupAddress: '123 Main St, New York, NY',
          deliveryAddress: '456 Oak Ave, New York, NY',
          status: 'pending',
          items: [{ name: 'Package', quantity: 1, price: 25.99 }],
          totalPrice: 25.99,
          createdAt: new Date(),
        },
        {
          id: 'ORD-002',
          customerId: 'CUST-002',
          customerName: 'Bob Brown',
          pickupAddress: '789 Pine Rd, New York, NY',
          deliveryAddress: '321 Elm St, New York, NY',
          status: 'in-transit',
          driverId: 'DRV-001',
          items: [{ name: 'Electronics', quantity: 2, price: 89.99 }],
          totalPrice: 89.99,
          createdAt: new Date(),
        },
      ];

      sampleOrders.forEach((order) => addOrder(order));
    }
  }, []);

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const availableDrivers = drivers.filter((d) => d.status === 'available');

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-primary">🚚 Delivery App</h1>
            <nav className="flex gap-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveTab('drivers')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'drivers'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Drivers
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-gray-600 text-sm font-medium">Total Orders</div>
                <div className="text-3xl font-bold text-primary mt-2">{orders.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-gray-600 text-sm font-medium">Pending Orders</div>
                <div className="text-3xl font-bold text-yellow-600 mt-2">{pendingOrders.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-gray-600 text-sm font-medium">Delivered</div>
                <div className="text-3xl font-bold text-green-600 mt-2">{deliveredOrders.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-gray-600 text-sm font-medium">Available Drivers</div>
                <div className="text-3xl font-bold text-blue-600 mt-2">{availableDrivers.length}</div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {orders.slice(-5).reverse().map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onClick={() => {
                      setSelectedOrder(order);
                      if (order.status === 'pending') {
                        setShowAssignModal(true);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
              <button
                onClick={() => setShowOrderForm(true)}
                className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                + New Order
              </button>
            </div>

            {showOrderForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
                <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                  <button
                    onClick={() => setShowOrderForm(false)}
                    className="float-right text-gray-600 hover:text-gray-900 text-2xl p-2"
                  >
                    ✕
                  </button>
                  <div className="p-6">
                    <OrderForm onSubmit={() => setShowOrderForm(false)} />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onClick={() => {
                    setSelectedOrder(order);
                    if (order.status === 'pending') {
                      setShowAssignModal(true);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Drivers Tab */}
        {activeTab === 'drivers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Drivers Management</h2>
              <button
                onClick={() => setShowDriverForm(true)}
                className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                + Add Driver
              </button>
            </div>

            {showDriverForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
                <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                  <button
                    onClick={() => setShowDriverForm(false)}
                    className="float-right text-gray-600 hover:text-gray-900 text-2xl p-2"
                  >
                    ✕
                  </button>
                  <div className="p-6">
                    <DriverForm onSubmit={() => setShowDriverForm(false)} />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {drivers.map((driver) => (
                <DriverCard key={driver.id} driver={driver} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Assign Driver Modal */}
      {showAssignModal && selectedOrder && (
        <AssignDriverModal
          order={selectedOrder}
          drivers={drivers}
          onAssign={() => {
            setShowAssignModal(false);
            setSelectedOrder(null);
          }}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}
