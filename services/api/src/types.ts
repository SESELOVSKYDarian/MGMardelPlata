import { randomUUID } from 'node:crypto';

export const FUEL_TYPES = ['HYBRID', 'ELECTRIC', 'GASOLINE'] as const;
export type FuelType = (typeof FUEL_TYPES)[number];

export const TD_STATUSES = ['PENDING', 'CONFIRMED', 'DONE', 'CANCELED'] as const;
export type TDStatus = (typeof TD_STATUSES)[number];

export interface CarModel {
  id: string;
  name: string;
  slug: string;
  fuelType: FuelType;
  isNew: boolean;
  priceFromUsd: number | null;
  teaser: string | null;
  heroImageUrl: string | null;
  gallery: unknown | null;
  specs: unknown | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Highlight {
  id: string;
  title: string;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  badge: string | null;
  fuelFilter: FuelType | null;
  imageUrl: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Dealer {
  id: string;
  name: string;
  city: string;
  phone: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface News {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverUrl: string | null;
  content: unknown | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Campaign {
  id: string;
  title: string;
  content: unknown | null;
  linkUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestDriveRequest {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  modelId: string;
  prefersDate: Date | null;
  message: string | null;
  status: TDStatus;
  createdAt: Date;
}

export interface AdminUser {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
}

export type WithModel<T> = T & { model: CarModel };

export const createId = () => randomUUID();
