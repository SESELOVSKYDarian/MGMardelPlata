import { config as loadEnv } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

loadEnv();
const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(__dirname, '../../.env'), override: false });

import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import morgan from 'morgan';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

import { store } from './store.js';
import {
  FUEL_TYPES,
  TD_STATUSES,
  type Campaign,
  type CarModel,
  type Dealer,
  type Highlight,
  type News,
} from './types.js';

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map((value) => value.trim())
  .filter((value) => value.length > 0);

const jwtSecret = process.env.JWT_SECRET ?? 'local-dev-secret';
if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET no está definido, usando valor por defecto solo para desarrollo.');
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan('dev'));

interface AuthenticatedRequest extends Request {
  user?: { sub: string; email?: string };
}

function auth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No autorizado' });
    return;
  }
  try {
    const payload = jwt.verify(header.slice(7), jwtSecret);
    if (typeof payload === 'string' || !payload || typeof payload !== 'object') {
      throw new Error('Payload inválido');
    }
    req.user = { sub: String(payload.sub ?? ''), email: typeof payload.email === 'string' ? payload.email : undefined };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
}

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.post('/auth/login', async (req: Request, res: Response) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });
  const result = schema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json(result.error.format());
    return;
  }
  const user = store.findAdminByEmail(result.data.email);
  if (!user) {
    res.status(401).json({ message: 'Credenciales inválidas' });
    return;
  }
  const matches = await bcrypt.compare(result.data.password, user.password);
  if (!matches) {
    res.status(401).json({ message: 'Credenciales inválidas' });
    return;
  }
  const token = jwt.sign({ sub: user.id, email: user.email }, jwtSecret, { expiresIn: '8h' });
  res.json({ token });
});

const modelSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  fuelType: z.enum(FUEL_TYPES),
  teaser: z.string().nullish(),
  heroImageUrl: z.string().nullish(),
  priceFromUsd: z.number().int().positive().nullish(),
  isNew: z.boolean().optional(),
  gallery: z.any().optional().nullable(),
  specs: z.any().optional().nullable(),
});

app.get('/models', (_req: Request, res: Response) => {
  res.json(store.listCarModels());
});

app.post('/models', auth, (req: Request, res: Response) => {
  const result = modelSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json(result.error.format());
    return;
  }
  const created = store.createCarModel({
    name: result.data.name,
    slug: result.data.slug,
    fuelType: result.data.fuelType,
    isNew: result.data.isNew ?? false,
    priceFromUsd: result.data.priceFromUsd ?? null,
    teaser: result.data.teaser ?? null,
    heroImageUrl: result.data.heroImageUrl ?? null,
    gallery: result.data.gallery ?? null,
    specs: result.data.specs ?? null,
  });
  res.json(created);
});

app.patch('/models/:id', auth, (req: Request, res: Response) => {
  const result = modelSchema.partial().safeParse(req.body);
  if (!result.success) {
    res.status(400).json(result.error.format());
    return;
  }
  const payload: Partial<Omit<CarModel, 'id' | 'createdAt' | 'updatedAt'>> = {};
  if (result.data.name !== undefined) payload.name = result.data.name;
  if (result.data.slug !== undefined) payload.slug = result.data.slug;
  if (result.data.fuelType !== undefined) payload.fuelType = result.data.fuelType;
  if (result.data.isNew !== undefined) payload.isNew = result.data.isNew;
  if (result.data.priceFromUsd !== undefined) payload.priceFromUsd = result.data.priceFromUsd ?? null;
  if (result.data.teaser !== undefined) payload.teaser = result.data.teaser ?? null;
  if (result.data.heroImageUrl !== undefined) payload.heroImageUrl = result.data.heroImageUrl ?? null;
  if (result.data.gallery !== undefined) payload.gallery = result.data.gallery ?? null;
  if (result.data.specs !== undefined) payload.specs = result.data.specs ?? null;

  const updated = store.updateCarModel(req.params.id, payload);
  if (!updated) {
    res.status(404).json({ message: 'Modelo no encontrado' });
    return;
  }
  res.json(updated);
});

app.delete('/models/:id', auth, (req: Request, res: Response) => {
  const deleted = store.deleteCarModel(req.params.id);
  if (!deleted) {
    res.status(404).json({ message: 'Modelo no encontrado' });
    return;
  }
  res.json({ ok: true });
});

const highlightSchema = z.object({
  title: z.string(),
  subtitle: z.string().nullish(),
  ctaLabel: z.string().nullish(),
  ctaHref: z.string().nullish(),
  badge: z.string().nullish(),
  fuelFilter: z.enum(FUEL_TYPES).nullish(),
  imageUrl: z.string().nullish(),
  order: z.number().int().nonnegative().optional(),
});

app.get('/highlights', (_req: Request, res: Response) => {
  res.json(store.listHighlights());
});

app.post('/highlights', auth, (req: Request, res: Response) => {
  const result = highlightSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json(result.error.format());
    return;
  }
  const created = store.createHighlight({
    title: result.data.title,
    subtitle: result.data.subtitle ?? null,
    ctaLabel: result.data.ctaLabel ?? null,
    ctaHref: result.data.ctaHref ?? null,
    badge: result.data.badge ?? null,
    fuelFilter: result.data.fuelFilter ?? null,
    imageUrl: result.data.imageUrl ?? null,
    order: result.data.order ?? 0,
  });
  res.json(created);
});

app.patch('/highlights/:id', auth, (req: Request, res: Response) => {
  const result = highlightSchema.partial().safeParse(req.body);
  if (!result.success) {
    res.status(400).json(result.error.format());
    return;
  }
  const payload: Partial<Omit<Highlight, 'id' | 'createdAt' | 'updatedAt'>> = {};
  if (result.data.title !== undefined) payload.title = result.data.title;
  if (result.data.subtitle !== undefined) payload.subtitle = result.data.subtitle ?? null;
  if (result.data.ctaLabel !== undefined) payload.ctaLabel = result.data.ctaLabel ?? null;
  if (result.data.ctaHref !== undefined) payload.ctaHref = result.data.ctaHref ?? null;
  if (result.data.badge !== undefined) payload.badge = result.data.badge ?? null;
  if (result.data.fuelFilter !== undefined) payload.fuelFilter = result.data.fuelFilter ?? null;
  if (result.data.imageUrl !== undefined) payload.imageUrl = result.data.imageUrl ?? null;
  if (result.data.order !== undefined) payload.order = result.data.order;

  const updated = store.updateHighlight(req.params.id, payload);
  if (!updated) {
    res.status(404).json({ message: 'Destacado no encontrado' });
    return;
  }
  res.json(updated);
});

app.delete('/highlights/:id', auth, (req: Request, res: Response) => {
  const deleted = store.deleteHighlight(req.params.id);
  if (!deleted) {
    res.status(404).json({ message: 'Destacado no encontrado' });
    return;
  }
  res.json({ ok: true });
});

const dealerSchema = z.object({
  name: z.string(),
  city: z.string(),
  phone: z.string().nullish(),
  address: z.string().nullish(),
  lat: z.number().nullish(),
  lng: z.number().nullish(),
});

app.get('/dealers', (_req: Request, res: Response) => {
  res.json(store.listDealers());
});

app.post('/dealers', auth, (req: Request, res: Response) => {
  const result = dealerSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json(result.error.format());
    return;
  }
  const created = store.createDealer({
    name: result.data.name,
    city: result.data.city,
    phone: result.data.phone ?? null,
    address: result.data.address ?? null,
    lat: result.data.lat ?? null,
    lng: result.data.lng ?? null,
  });
  res.json(created);
});

app.patch('/dealers/:id', auth, (req: Request, res: Response) => {
  const result = dealerSchema.partial().safeParse(req.body);
  if (!result.success) {
    res.status(400).json(result.error.format());
    return;
  }
  const payload: Partial<Omit<Dealer, 'id' | 'createdAt' | 'updatedAt'>> = {};
  if (result.data.name !== undefined) payload.name = result.data.name;
  if (result.data.city !== undefined) payload.city = result.data.city;
  if (result.data.phone !== undefined) payload.phone = result.data.phone ?? null;
  if (result.data.address !== undefined) payload.address = result.data.address ?? null;
  if (result.data.lat !== undefined) payload.lat = result.data.lat ?? null;
  if (result.data.lng !== undefined) payload.lng = result.data.lng ?? null;

  const updated = store.updateDealer(req.params.id, payload);
  if (!updated) {
    res.status(404).json({ message: 'Concesionario no encontrado' });
    return;
  }
  res.json(updated);
});

app.delete('/dealers/:id', auth, (req: Request, res: Response) => {
  const deleted = store.deleteDealer(req.params.id);
  if (!deleted) {
    res.status(404).json({ message: 'Concesionario no encontrado' });
    return;
  }
  res.json({ ok: true });
});

const newsSchema = z.object({
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullish(),
  coverUrl: z.string().nullish(),
  content: z.any().optional().nullable(),
  published: z.boolean().optional(),
});

app.get('/news', (_req: Request, res: Response) => {
  res.json(store.listNews());
});

app.post('/news', auth, (req: Request, res: Response) => {
  const result = newsSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json(result.error.format());
    return;
  }
  const created = store.createNews({
    title: result.data.title,
    slug: result.data.slug,
    excerpt: result.data.excerpt ?? null,
    coverUrl: result.data.coverUrl ?? null,
    content: result.data.content ?? null,
    published: result.data.published ?? false,
  });
  res.json(created);
});

app.patch('/news/:id', auth, (req: Request, res: Response) => {
  const result = newsSchema.partial().safeParse(req.body);
  if (!result.success) {
    res.status(400).json(result.error.format());
    return;
  }
  const payload: Partial<Omit<News, 'id' | 'createdAt' | 'updatedAt'>> = {};
  if (result.data.title !== undefined) payload.title = result.data.title;
  if (result.data.slug !== undefined) payload.slug = result.data.slug;
  if (result.data.excerpt !== undefined) payload.excerpt = result.data.excerpt ?? null;
  if (result.data.coverUrl !== undefined) payload.coverUrl = result.data.coverUrl ?? null;
  if (result.data.content !== undefined) payload.content = result.data.content ?? null;
  if (result.data.published !== undefined) payload.published = result.data.published;

  const updated = store.updateNews(req.params.id, payload);
  if (!updated) {
    res.status(404).json({ message: 'Noticia no encontrada' });
    return;
  }
  res.json(updated);
});

app.delete('/news/:id', auth, (req: Request, res: Response) => {
  const deleted = store.deleteNews(req.params.id);
  if (!deleted) {
    res.status(404).json({ message: 'Noticia no encontrada' });
    return;
  }
  res.json({ ok: true });
});

const campaignSchema = z.object({
  title: z.string(),
  content: z.any().optional().nullable(),
  linkUrl: z.string().nullish(),
});

app.get('/campaigns', (_req: Request, res: Response) => {
  res.json(store.listCampaigns());
});

app.post('/campaigns', auth, (req: Request, res: Response) => {
  const result = campaignSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json(result.error.format());
    return;
  }
  const created = store.createCampaign({
    title: result.data.title,
    content: result.data.content ?? null,
    linkUrl: result.data.linkUrl ?? null,
  });
  res.json(created);
});

app.patch('/campaigns/:id', auth, (req: Request, res: Response) => {
  const result = campaignSchema.partial().safeParse(req.body);
  if (!result.success) {
    res.status(400).json(result.error.format());
    return;
  }
  const payload: Partial<Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>> = {};
  if (result.data.title !== undefined) payload.title = result.data.title;
  if (result.data.content !== undefined) payload.content = result.data.content ?? null;
  if (result.data.linkUrl !== undefined) payload.linkUrl = result.data.linkUrl ?? null;

  const updated = store.updateCampaign(req.params.id, payload);
  if (!updated) {
    res.status(404).json({ message: 'Campaña no encontrada' });
    return;
  }
  res.json(updated);
});

app.delete('/campaigns/:id', auth, (req: Request, res: Response) => {
  const deleted = store.deleteCampaign(req.params.id);
  if (!deleted) {
    res.status(404).json({ message: 'Campaña no encontrada' });
    return;
  }
  res.json({ ok: true });
});

const testDriveSchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string().nullish(),
  modelId: z.string(),
  prefersDate: z
    .string()
    .regex(/\d{4}-\d{2}-\d{2}/, 'Fecha debe tener formato AAAA-MM-DD')
    .nullish(),
  message: z.string().nullish(),
});

app.post('/test-drive', (req: Request, res: Response) => {
  const result = testDriveSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json(result.error.format());
    return;
  }
  try {
    const created = store.createTestDriveRequest({
      fullName: result.data.fullName,
      email: result.data.email,
      phone: result.data.phone ?? null,
      modelId: result.data.modelId,
      prefersDate: result.data.prefersDate ? new Date(result.data.prefersDate) : null,
      message: result.data.message ?? null,
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudo crear la solicitud' });
  }
});

const testDriveUpdateSchema = z.object({
  status: z.enum(TD_STATUSES),
});

app.get('/test-drive', auth, (_req: Request, res: Response) => {
  res.json(store.listTestDriveRequests());
});

app.patch('/test-drive/:id', auth, (req: Request, res: Response) => {
  const result = testDriveUpdateSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json(result.error.format());
    return;
  }
  const updated = store.updateTestDriveStatus(req.params.id, result.data.status);
  if (!updated) {
    res.status(404).json({ message: 'Solicitud no encontrada' });
    return;
  }
  res.json(updated);
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({ message: 'Error inesperado' });
});

const port = Number(process.env.PORT ?? '4000');
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
