import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'


const app = express()
const prisma = new PrismaClient()


app.use(cors({ origin: (process.env.CORS_ORIGIN || '').split(','), credentials: true }))
app.use(express.json())
app.use(morgan('dev'))


// --- Auth muy simple (JWT) ---
app.post('/auth/login', async (req, res) => {
const schema = z.object({ email: z.string().email(), password: z.string().min(6) })
const parsed = schema.safeParse(req.body)
if (!parsed.success) return res.status(400).json(parsed.error)
const user = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } })
if (!user) return res.status(401).json({ message: 'Credenciales inválidas' })
const bcrypt = await import('bcryptjs')
const ok = await bcrypt.compare(parsed.data.password, user.password)
if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' })
const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '8h' })
res.json({ token })
})


// Middleware mínimo de auth
function auth(req, res, next) {
const hdr = req.headers.authorization
if (!hdr?.startsWith('Bearer ')) return res.status(401).json({ message: 'No autorizado' })
try {
const payload = jwt.verify(hdr.slice(7), process.env.JWT_SECRET!)
// @ts-ignore
req.user = payload
next()
} catch {
res.status(401).json({ message: 'Token inválido' })
}
}


// --- CRUDs ---
app.get('/models', async (_, res) => {
const data = await prisma.carModel.findMany({ orderBy: { createdAt: 'desc' } })
res.json(data)
})
app.post('/models', auth, async (req, res) => {
const data = await prisma.carModel.create({ data: req.body })
res.json(data)
})
app.patch('/models/:id', auth, async (req, res) => {
const data = await prisma.carModel.update({ where: { id: req.params.id }, data: req.body })
res.json(data)
})
app.delete('/models/:id', auth, async (req, res) => {
await prisma.carModel.delete({ where: { id: req.params.id } })
res.json({ ok: true })
})


app.get('/highlights', async (_, res) => {
const data = await prisma.highlight.findMany({ orderBy: { order: 'asc' } })
res.json(data)
})
app.post('/highlights', auth, async (req, res) => {
const data = await prisma.highlight.create({ data: req.body })
res.json(data)
})


})