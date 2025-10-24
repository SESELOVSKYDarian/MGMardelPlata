import { config as loadEnv } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

loadEnv();
const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(__dirname, '../../.env'), override: false });
import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import { PrismaClient, FuelType, TDStatus } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map((value) => value.trim())
  .filter((value) => value.length > 0);

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET must be defined');
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

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/auth/login', async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });
  const result = schema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json(result.error.format());
    return;
  }
  const user = await prisma.adminUser.findUnique({ where: { email: result.data.email } });
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

app.get('/models', async (_req, res) => {
  const models = await prisma.carModel.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(models);
});

const modelSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  fuelType: z.nativeEnum(FuelType),
  teaser: z.string().nullish(),
  heroImageUrl: z.string().nullish(),
  priceFromUsd: z.number().int().positive().nullish(),
  isNew: z.boolean().optional(),
  gallery: z.any().optional().nullable(),
  specs: z.any().optional().nullable(),
});

app.post('/models', auth, async (req, res) => {
  const result = modelSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json(result.error.format());
    return;
  }
  const created = await prisma.carModel.create({ data: result.data });
  res.json(created);
});

app.patch('/models/:id', auth, async (req, res) => {
  const result = modelSchema.partial().safeParse(req.body);
  if (!result.success) {
    res.status(400).json(result.error.format());
    return;
  }
  const updated = await prisma.carModel.update({ where: { id: req.params.id }, data: result.data });
  res.json(updated);
});

app.delete('/models/:id', auth, async (req, res) => {
  await prisma.carModel.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

const highlightSchema = z.object({
  title: z.string(),
  subtitle: z.string().nullish(),
  ctaLabel: z.string().nullish(),
  ctaHref: z.string().nullish(),
  badge: z.string().nullish(),
  fuelFilter: z.nativeEnum(FuelType).nullish(),
  imageUrl: z.string().nullish(),
  order: z.number().int().nonnegative().optional(),
});

app.get('/highlights', async (_req, res) => {
  const highlights = await prisma.highlight.findMany({ orderBy: { order: 'asc' } });
  res.json(highlights);
});

app.post('/highlights', auth, async (req, res) => {
  const result = highlightSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json(result.error.format());
    return;
  }
  const created = await prisma.highlight.create({ data: result.data });
  res.json(created);
});

app.patch('/highlights/:id', auth, async (req, res) => {
  const result = highlightSchema.partial().safeParse(req.body);
  if (!result.success) {
    res.status(400).json(result.error.format());
    return;
  }
  const updated = await prisma.highlight.update({ where: { id: req.params.id }, data: result.data });
  res.json(updated);
});

app.delete('/highlights/:id', auth, async (req, res) => {
  await prisma.highlight.delete({ where: { id: req.params.id } });
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

app.get('/dealers', async (_req, res) => {
  const dealers = await prisma.dealer.findMany({ orderBy: { name: 'asc' } });
  res.json(dealers);
});

app.post('/dealers', auth, async (req, res) => {
  const result = dealerSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json(result.error.format());
    return;
  }
  const created = await prisma.dealer.create({ data: result.data });
  res.json(created);
});

app.patch('/dealers/:id', auth, async (req, res) => {
  const result = dealerSchema.partial().safeParse(req.body);
  if (!result.success) {
    res.status(400).json(result.error.format());
    return;
  }
  const updated = await prisma.dealer.update({ where: { id: req.params.id }, data: result.data });
  res.json(updated);
});

app.delete('/dealers/:id', auth, async (req, res) => {
  await prisma.dealer.delete({ where: { id: req.params.id } });
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

app.get('/news', async (_req, res) => {
  const news = await prisma.news.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(news);
});

app.post('/news', auth, async (req, res) => {
  const result = newsSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json(result.error.format());
    return;
  }
  const created = await prisma.news.create({ data: result.data });
  res.json(created);
});

app.patch('/news/:id', auth, async (req, res) => {
  const result = newsSchema.partial().safeParse(req.body);
  if (!result.success) {
    res.status(400).json(result.error.format());
    return;
  }
  const updated = await prisma.news.update({ where: { id: req.params.id }, data: result.data });
  res.json(updated);
});

app.delete('/news/:id', auth, async (req, res) => {
  await prisma.news.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

const campaignSchema = z.object({
  title: z.string(),
  content: z.any().optional().nullable(),
  linkUrl: z.string().nullish(),
});

app.get('/campaigns', async (_req, res) => {
  const campaigns = await prisma.campaign.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(campaigns);
});

app.post('/campaigns', auth, async (req, res) => {
  const result = campaignSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json(result.error.format());
    return;
  }
  const created = await prisma.campaign.create({ data: result.data });
  res.json(created);
});

app.patch('/campaigns/:id', auth, async (req, res) => {
  const result = campaignSchema.partial().safeParse(req.body);
  if (!result.success) {
    res.status(400).json(result.error.format());
    return;
  }
  const updated = await prisma.campaign.update({ where: { id: req.params.id }, data: result.data });
  res.json(updated);
});

app.delete('/campaigns/:id', auth, async (req, res) => {
  await prisma.campaign.delete({ where: { id: req.params.id } });
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

app.post('/test-drive', async (req, res) => {
  const result = testDriveSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json(result.error.format());
    return;
  }
  const created = await prisma.testDriveRequest.create({
    data: {
      ...result.data,
      prefersDate: result.data.prefersDate ? new Date(result.data.prefersDate) : null,
    },
  });
  res.status(201).json(created);
});

const testDriveUpdateSchema = z.object({
  status: z.nativeEnum(TDStatus),
});

app.get('/test-drive', auth, async (_req, res) => {
  const requests = await prisma.testDriveRequest.findMany({
    include: { model: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(requests);
});

app.patch('/test-drive/:id', auth, async (req, res) => {
  const result = testDriveUpdateSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json(result.error.format());
    return;
  }
  const updated = await prisma.testDriveRequest.update({ where: { id: req.params.id }, data: { status: result.data.status } });
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

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
