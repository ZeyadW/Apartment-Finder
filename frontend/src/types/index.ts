// Shared TypeScript types and interfaces for the frontend

export interface Developer {
  _id: string;
  name: string;
  description?: string;
  website?: string;
}

export interface Compound {
  _id: string;
  name: string;
  description?: string;
  location?: string;
}

export interface Amenity {
  _id: string;
  name: string;
  description?: string;
}

export interface Apartment {
  _id: string;
  unitName: string;
  unitNumber: string;
  project: string;
  address: string;
  city: string;
  price: number;
  listingType: 'rent' | 'sale';
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  description: string;
  amenities: Amenity[];
  images: string[];
  isAvailable: boolean;
  agent?: string | { _id: string; firstName: string; lastName: string; email: string };
  favorites?: string[];
  developer: string | Developer;
  compound: string | Compound;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  isActive?: boolean;
  createdAt?: string;
  lastLogin?: string;
} 