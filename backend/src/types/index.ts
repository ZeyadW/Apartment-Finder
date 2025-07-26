// Shared TypeScript types and interfaces for the backend

export interface Apartment {
  _id: string;
  unitName: string;
  unitNumber: string;
  project: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  description: string;
  amenities: string[];
  images: string[];
  isAvailable: boolean;
  agent?: string;
  favorites?: string[];
  createdAt: Date;
  updatedAt: Date;
  developer: string;
  compound: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  userId: string;
  role: 'user' | 'admin';
} 