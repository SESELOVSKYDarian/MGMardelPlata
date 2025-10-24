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

0. **Pre-requisitos del sistema**

   - Instalá [Node.js 20 LTS](https://nodejs.org/).
   - Activá PNPM con Corepack (incluido con Node 16+):

     ```powershell
     corepack enable
     corepack prepare pnpm@9.10.0 --activate
     ```

     > En Windows podés ejecutar los comandos anteriores en PowerShell. Si preferís instalar PNPM de forma global, `npm install -g pnpm` también funciona.

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

2. **Instalar dependencias (obligatorio antes de cualquier script)**

   ```bash
   pnpm install
   ```

   > Esto descarga `next`, `tsx`, `prisma` y el resto de binarios necesarios para que los comandos funcionen. Si ves errores del tipo `"next" no se reconoce como un comando interno o externo` o `"prisma" no se reconoce...`, asegurate de haber corrido `pnpm install` en la raíz del monorepo y de ejecutarlo nuevamente después de actualizar dependencias.

3. **Aplicar el esquema y seed**

   ```bash
   pnpm db:push
   pnpm db:seed
   ```

   El seed genera el usuario `admin@mgclone.local` con clave `admin123` y carga modelos, destacados y concesionarios de ejemplo.
   Si Prisma reporta que no encuentra el schema asegurate de que el archivo `prisma/schema.prisma` exista en la raíz (los scripts ya lo referencian automáticamente).

4. **Levantar todo junto**

   ```bash
   pnpm dev
   ```

   - API: http://localhost:4000
   - Web: http://localhost:3000
   - Admin: http://localhost:3001

   El comando usa `concurrently` para orquestar los tres servicios; detenerlo con `Ctrl+C`.

## Scripts útiles

- `pnpm install` – instala/actualiza dependencias de todo el workspace.
- `pnpm db:push` – sincroniza Prisma con la base configurada.
- `pnpm db:seed` – carga datos demo.
- `pnpm build` – compila los tres proyectos (web/admin via Next, API via `tsc`).
- `pnpm start` – inicia API, web y admin en modo producción (requiere `pnpm build`).

## Solución de problemas comunes

- **`"next" / "tsx" / "prisma" no se reconoce como un comando interno o externo**: indica que las dependencias no están instaladas. Ejecutá `pnpm install` en la raíz y luego repetí el comando (`pnpm dev`, `pnpm db:push`, etc.).
- **`Local package.json exists, but node_modules missing, did you mean to install?`**: es el mismo caso anterior; asegurate de instalar dependencias antes de cualquier script.
- **Base de datos no accesible**: revisá la variable `DATABASE_URL` y que PostgreSQL esté corriendo. Podés probar la conexión con `pnpm --filter api exec prisma db pull`.

## Notas adicionales

- El front (`apps/web`) espera que la API responda en `NEXT_PUBLIC_API_URL` y hace fetch en server components sin cache.
- La API valida inputs con Zod y protege endpoints de escritura con JWT. Recordá definir `JWT_SECRET` antes de levantarla.
- El formulario de Test Drive consume `/models` para listar vehículos y envía solicitudes a `/test-drive`.

¡Listo! Con estos pasos el proyecto queda funcionando y bastante cercano a https://mgargentina.ar, listo para que ajustes contenido e imágenes según necesites.
