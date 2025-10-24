import { hashSync } from 'bcryptjs';
import { createId, type AdminUser, type Campaign, type CarModel, type Dealer, type Highlight, type News, type TestDriveRequest, type WithModel, FUEL_TYPES, FuelType, TDStatus, TD_STATUSES } from './types.js';

const now = () => new Date();

const carModels: CarModel[] = [
  {
    id: createId(),
    name: 'ALL NEW MG 3 HYBRID',
    slug: 'mg-3-hybrid',
    fuelType: 'HYBRID',
    isNew: true,
    priceFromUsd: 23500,
    teaser: 'Full Hybrid con gran rendimiento',
    heroImageUrl: '/images/mg3.jpg',
    gallery: null,
    specs: null,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: createId(),
    name: 'ALL NEW MG ZS HYBRID',
    slug: 'mg-zs-hybrid',
    fuelType: 'HYBRID',
    isNew: true,
    priceFromUsd: 27500,
    teaser: 'Opción híbrida eficiente',
    heroImageUrl: '/images/zs.jpg',
    gallery: null,
    specs: null,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: createId(),
    name: 'MG CYBERSTER',
    slug: 'mg-cyberster',
    fuelType: 'ELECTRIC',
    isNew: false,
    priceFromUsd: 130000,
    teaser: 'Deportivo eléctrico',
    heroImageUrl: '/images/cyberster.jpg',
    gallery: null,
    specs: null,
    createdAt: now(),
    updatedAt: now(),
  },
];

const highlights: Highlight[] = [
  {
    id: createId(),
    title: 'ALL NEW MG 3 HYBRID',
    subtitle: 'Desde: USD 23.500 *',
    ctaLabel: 'Cotizar',
    ctaHref: '/cotizar',
    badge: 'NUEVO',
    fuelFilter: 'HYBRID',
    imageUrl: '/images/mg3.jpg',
    order: 1,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: createId(),
    title: 'ALL NEW MG ZS HYBRID',
    subtitle: 'Desde: USD 27.500 *',
    ctaLabel: 'Cotizar',
    ctaHref: '/cotizar',
    badge: 'NUEVO',
    fuelFilter: 'HYBRID',
    imageUrl: '/images/zs.jpg',
    order: 2,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: createId(),
    title: 'MG CYBERSTER',
    subtitle: 'Desde: USD 130.000 *',
    ctaLabel: 'Cotizar',
    ctaHref: '/cotizar',
    badge: 'Eléctrico',
    fuelFilter: 'ELECTRIC',
    imageUrl: '/images/cyberster.jpg',
    order: 3,
    createdAt: now(),
    updatedAt: now(),
  },
];

const dealers: Dealer[] = [
  {
    id: createId(),
    name: 'MG Centro',
    city: 'CABA',
    phone: '+54 11 1234-5678',
    address: 'Av. Siempreviva 123',
    lat: null,
    lng: null,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: createId(),
    name: 'MG Norte',
    city: 'Tucumán',
    phone: '+54 381 555-2211',
    address: 'San Martín 321',
    lat: null,
    lng: null,
    createdAt: now(),
    updatedAt: now(),
  },
];

const news: News[] = [];
const campaigns: Campaign[] = [];
const testDriveRequests: TestDriveRequest[] = [];

const adminUsers: AdminUser[] = [
  {
    id: createId(),
    email: 'admin@mgclone.local',
    password: hashSync('admin123', 10),
    createdAt: now(),
  },
];

function assertFuelType(value: string): FuelType {
  if ((FUEL_TYPES as readonly string[]).includes(value)) {
    return value as FuelType;
  }
  throw new Error('Tipo de combustible inválido');
}

function assertTDStatus(value: string): TDStatus {
  if ((TD_STATUSES as readonly string[]).includes(value)) {
    return value as TDStatus;
  }
  throw new Error('Estado inválido');
}

function sortByDateDesc<T extends { createdAt: Date }>(items: T[]) {
  return [...items].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export const store = {
  findAdminByEmail(email: string) {
    return adminUsers.find((user) => user.email.toLowerCase() === email.toLowerCase());
  },

  listCarModels() {
    return sortByDateDesc(carModels);
  },

  createCarModel(data: Omit<CarModel, 'id' | 'createdAt' | 'updatedAt'>) {
    const nowDate = now();
    const model: CarModel = {
      ...data,
      fuelType: assertFuelType(data.fuelType),
      id: createId(),
      createdAt: nowDate,
      updatedAt: nowDate,
    };
    carModels.push(model);
    return model;
  },

  updateCarModel(id: string, data: Partial<Omit<CarModel, 'id' | 'createdAt' | 'updatedAt'>>) {
    const existing = carModels.find((model) => model.id === id);
    if (!existing) {
      return undefined;
    }
    Object.assign(existing, data);
    if (data.fuelType) {
      existing.fuelType = assertFuelType(data.fuelType);
    }
    existing.updatedAt = now();
    return existing;
  },

  deleteCarModel(id: string) {
    const index = carModels.findIndex((model) => model.id === id);
    if (index === -1) {
      return false;
    }
    carModels.splice(index, 1);
    return true;
  },

  listHighlights() {
    return [...highlights].sort((a, b) => a.order - b.order);
  },

  createHighlight(data: Omit<Highlight, 'id' | 'createdAt' | 'updatedAt'>) {
    const nowDate = now();
    const highlight: Highlight = {
      ...data,
      fuelFilter: data.fuelFilter ? assertFuelType(data.fuelFilter) : null,
      id: createId(),
      createdAt: nowDate,
      updatedAt: nowDate,
    };
    highlights.push(highlight);
    return highlight;
  },

  updateHighlight(id: string, data: Partial<Omit<Highlight, 'id' | 'createdAt' | 'updatedAt'>>) {
    const existing = highlights.find((item) => item.id === id);
    if (!existing) {
      return undefined;
    }
    if (data.fuelFilter) {
      existing.fuelFilter = assertFuelType(data.fuelFilter);
    }
    Object.assign(existing, data);
    existing.updatedAt = now();
    return existing;
  },

  deleteHighlight(id: string) {
    const index = highlights.findIndex((item) => item.id === id);
    if (index === -1) {
      return false;
    }
    highlights.splice(index, 1);
    return true;
  },

  listDealers() {
    return [...dealers].sort((a, b) => a.name.localeCompare(b.name));
  },

  createDealer(data: Omit<Dealer, 'id' | 'createdAt' | 'updatedAt'>) {
    const nowDate = now();
    const dealer: Dealer = {
      ...data,
      id: createId(),
      createdAt: nowDate,
      updatedAt: nowDate,
    };
    dealers.push(dealer);
    return dealer;
  },

  updateDealer(id: string, data: Partial<Omit<Dealer, 'id' | 'createdAt' | 'updatedAt'>>) {
    const existing = dealers.find((item) => item.id === id);
    if (!existing) {
      return undefined;
    }
    Object.assign(existing, data);
    existing.updatedAt = now();
    return existing;
  },

  deleteDealer(id: string) {
    const index = dealers.findIndex((item) => item.id === id);
    if (index === -1) {
      return false;
    }
    dealers.splice(index, 1);
    return true;
  },

  listNews() {
    return sortByDateDesc(news);
  },

  createNews(data: Omit<News, 'id' | 'createdAt' | 'updatedAt'>) {
    const nowDate = now();
    const entry: News = {
      ...data,
      id: createId(),
      createdAt: nowDate,
      updatedAt: nowDate,
    };
    news.push(entry);
    return entry;
  },

  updateNews(id: string, data: Partial<Omit<News, 'id' | 'createdAt' | 'updatedAt'>>) {
    const existing = news.find((item) => item.id === id);
    if (!existing) {
      return undefined;
    }
    Object.assign(existing, data);
    existing.updatedAt = now();
    return existing;
  },

  deleteNews(id: string) {
    const index = news.findIndex((item) => item.id === id);
    if (index === -1) {
      return false;
    }
    news.splice(index, 1);
    return true;
  },

  listCampaigns() {
    return sortByDateDesc(campaigns);
  },

  createCampaign(data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) {
    const nowDate = now();
    const entry: Campaign = {
      ...data,
      id: createId(),
      createdAt: nowDate,
      updatedAt: nowDate,
    };
    campaigns.push(entry);
    return entry;
  },

  updateCampaign(id: string, data: Partial<Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>>) {
    const existing = campaigns.find((item) => item.id === id);
    if (!existing) {
      return undefined;
    }
    Object.assign(existing, data);
    existing.updatedAt = now();
    return existing;
  },

  deleteCampaign(id: string) {
    const index = campaigns.findIndex((item) => item.id === id);
    if (index === -1) {
      return false;
    }
    campaigns.splice(index, 1);
    return true;
  },

  createTestDriveRequest(data: Omit<TestDriveRequest, 'id' | 'createdAt' | 'status'>) {
    const model = carModels.find((item) => item.id === data.modelId);
    if (!model) {
      throw new Error('Modelo no encontrado');
    }
    const request: TestDriveRequest = {
      ...data,
      id: createId(),
      status: 'PENDING',
      createdAt: now(),
    };
    testDriveRequests.push(request);
    return request;
  },

  listTestDriveRequests(): WithModel<TestDriveRequest>[] {
    return sortByDateDesc(testDriveRequests).map((request) => ({
      ...request,
      model: carModels.find((item) => item.id === request.modelId)!,
    }));
  },

  updateTestDriveStatus(id: string, status: TDStatus) {
    const request = testDriveRequests.find((item) => item.id === id);
    if (!request) {
      return undefined;
    }
    request.status = assertTDStatus(status);
    return request;
  },
};

export type Store = typeof store;
