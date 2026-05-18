export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'pharmacist' | 'admin';
  address?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  requiresPrescription: boolean;
  imageUrl: string;
  dosage?: string;
  sideEffects?: string;
  expiryDate?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'out-for-delivery' | 'delivered' | 'cancelled';
  total: number;
  prescriptionUrl?: string;
  deliveryAddress: string;
  trackingInfo?: {
    lat: number;
    lng: number;
    statusText: string;
  };
  scheduledDeliveryDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Reminder {
  id: string;
  userId: string;
  medicineId: string;
  medicineName: string;
  frequencyDays: number;
  lastRefillDate: string;
  nextRefillDate: string;
}
