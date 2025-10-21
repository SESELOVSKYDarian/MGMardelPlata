# MG Argentina Clone Monorepo

Este monorepo contiene tres aplicaciones PNPM:

- **services/api** – API Express + Prisma que expone autenticación y CRUD para modelos, destacados, concesionarios, noticias, campañas y solicitudes de test-drive.
- **apps/web** – Front público en Next.js que consume la API.
- **apps/admin** – Panel de administración simple en Next.js para editar contenido vía API.

## Requisitos

- Node.js 20+
- PNPM 9+
- PostgreSQL 14+ (local o remoto)

## Configuración paso a paso

1. **Variables de entorno**

   Copiá `.env.example` a `.env` en la raíz y ajustá los valores si es necesario. El archivo ya propone una base `mg_clone` en `localhost`:

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/mg_clone?schema=public"
   PORT=4000
   JWT_SECRET="supersecretchange"
   CORS_ORIGIN="http://localhost:3000,http://localhost:3001"
   NEXT_PUBLIC_API_URL="http://localhost:4000"
   ```

   > **Base de datos**: si usás PostgreSQL local bastará con crear la base `mg_clone` (`createdb mg_clone`). Podés cambiar el nombre en la URL si preferís otro.

2. **Instalar dependencias**

   ```bash
   pnpm install
   ```

3. **Aplicar el esquema y seed**

   ```bash
   pnpm db:push
   pnpm db:seed
   ```

   El seed genera el usuario `admin@mgclone.local` con clave `admin123` y carga modelos, destacados y concesionarios de ejemplo.

4. **Levantar todo junto**

   ```bash
   pnpm dev
   ```

   - API: http://localhost:4000
   - Web: http://localhost:3000
   - Admin: http://localhost:3001

   El comando usa `concurrently` para orquestar los tres servicios; detenerlo con `Ctrl+C`.

## Scripts útiles

- `pnpm db:push` – sincroniza Prisma con la base configurada.
- `pnpm db:seed` – carga datos demo.
- `pnpm build` – compila los tres proyectos (web/admin via Next, API via `tsc`).
- `pnpm start` – inicia API, web y admin en modo producción (requiere `pnpm build`).

## Notas adicionales

- El front (`apps/web`) espera que la API responda en `NEXT_PUBLIC_API_URL` y hace fetch en server components sin cache.
- La API valida inputs con Zod y protege endpoints de escritura con JWT. Recordá definir `JWT_SECRET` antes de levantarla.
- El formulario de Test Drive consume `/models` para listar vehículos y envía solicitudes a `/test-drive`.

¡Listo! Con estos pasos el proyecto queda funcionando y bastante cercano a https://mgargentina.ar, listo para que ajustes contenido e imágenes según necesites.
