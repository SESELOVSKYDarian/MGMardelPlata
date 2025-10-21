import { PrismaClient, FuelType } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()


async function main(){
const password = await bcrypt.hash('admin123', 10)
await prisma.adminUser.upsert({
where: { email: 'admin@mgclone.local' },
update: {},
create: { email: 'admin@mgclone.local', password }
})


const mg3 = await prisma.carModel.upsert({
where: { slug: 'mg-3-hybrid' },
update: {},
create: {
name: 'ALL NEW MG 3 HYBRID', slug: 'mg-3-hybrid', fuelType: FuelType.HYBRID,
priceFromUsd: 23500, teaser: 'Full Hybrid con gran rendimiento',
heroImageUrl: '/images/mg3.jpg'
}
})
const zshev = await prisma.carModel.upsert({
where: { slug: 'mg-zs-hybrid' },
update: {},
create: { name: 'ALL NEW MG ZS HYBRID', slug: 'mg-zs-hybrid', fuelType: FuelType.HYBRID, priceFromUsd: 27500,
teaser: 'Opción híbrida eficiente', heroImageUrl: '/images/zs.jpg' }
})
const cyber = await prisma.carModel.upsert({
where: { slug: 'mg-cyberster' },
update: {},
create: { name: 'MG CYBERSTER', slug: 'mg-cyberster', fuelType: FuelType.ELECTRIC, priceFromUsd: 130000,
teaser: 'Deportivo eléctrico', heroImageUrl: '/images/cyberster.jpg' }
})


await prisma.highlight.createMany({ data: [
{ title: 'ALL NEW MG 3 HYBRID', subtitle: 'Desde: USD 23.500 *', ctaLabel: 'Cotizar', ctaHref: '/cotizar', badge: 'NUEVO', fuelFilter: FuelType.HYBRID, imageUrl: '/images/mg3.jpg', order: 1},
{ title: 'ALL NEW MG ZS HYBRID', subtitle: 'Desde: USD 27.500 *', ctaLabel: 'Cotizar', ctaHref: '/cotizar', badge: 'NUEVO', fuelFilter: FuelType.HYBRID, imageUrl: '/images/zs.jpg', order: 2},
{ title: 'MG CYBERSTER', subtitle: 'Desde: USD 130.000 *', ctaLabel: 'Cotizar', ctaHref: '/cotizar', badge: 'Eléctrico', fuelFilter: FuelType.ELECTRIC, imageUrl: '/images/cyberster.jpg', order: 3}
]})


await prisma.dealer.createMany({ data: [
{ name: 'MG Centro', city: 'CABA', phone: '+54 11 1234-5678', address: 'Av. Siempreviva 123' },
{ name: 'MG Norte', city: 'Tucumán', phone: '+54 381 555-2211', address: 'San Martín 321' }
]})
}


main().finally(()=>prisma.$disconnect())