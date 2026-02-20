import { create } from 'zustand';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  pickupAddress: string;
  deliveryAddress: string;
  status: 'pending' | 'assigned' | 'in-transit' | 'delivered' | 'cancelled';
  driverId?: string;
  items: { name: string; quantity: number; price: number }[];
  totalPrice: number;
  createdAt: Date;
  estimatedDelivery?: Date;
  currentLocation?: { lat: number; lng: number };
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  status: 'available' | 'busy' | 'offline';
  currentLocation: { lat: number; lng: number };
  rating: number;
  activeOrderId?: string;
}

interface DeliveryStore {
  orders: Order[];
  drivers: Driver[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  assignDriver: (orderId: string, driverId: string) => void;
  updateDriverLocation: (driverId: string, location: { lat: number; lng: number }) => void;
  updateDriverStatus: (driverId: string, status: Driver['status']) => void;
  getOrderById: (orderId: string) => Order | undefined;
  getDriverById: (driverId: string) => Driver | undefined;
}

export const useDeliveryStore = create<DeliveryStore>((set, get) => ({
  orders: [],
  drivers: [],
  
  addOrder: (order) =>
    set((state) => ({ orders: [...state.orders, order] })),
  
  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      ),
    })),
  
  assignDriver: (orderId, driverId) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, driverId, status: 'assigned' as const } : order
      ),
      drivers: state.drivers.map((driver) =>
        driver.id === driverId ? { ...driver, activeOrderId: orderId, status: 'busy' as const } : driver
      ),
    })),
  
  updateDriverLocation: (driverId, location) =>
    set((state) => ({
      drivers: state.drivers.map((driver) =>
        driver.id === driverId ? { ...driver, currentLocation: location } : driver
      ),
    })),
  
  updateDriverStatus: (driverId, status) =>
    set((state) => ({
      drivers: state.drivers.map((driver) =>
        driver.id === driverId ? { ...driver, status } : driver
      ),
    })),
  
  getOrderById: (orderId) => {
    const state = get();
    return state.orders.find((order) => order.id === orderId);
  },
  
  getDriverById: (driverId) => {
    const state = get();
    return state.drivers.find((driver) => driver.id === driverId);
  },
}));
