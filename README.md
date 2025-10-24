# MG Argentina Clone Monorepo

Este monorepo contiene tres aplicaciones manejadas con PNPM:

- **services/api** – API Express con datos en memoria para autenticación, modelos, destacados, concesionarios, noticias, campañas y solicitudes de test-drive.
- **apps/web** – Front público en Next.js que consume la API.
- **apps/admin** – Panel de administración en Next.js para editar contenido vía API.

## Requisitos

- Node.js 20+
- PNPM 9+

## Configuración rápida

1. **Preparar PNPM**

   Activá PNPM con Corepack (incluido en Node 16+):

   ```powershell
   corepack enable
   corepack prepare pnpm@9.10.0 --activate
   ```

   > En Windows también podés instalar PNPM de forma global: `npm install -g pnpm`.

2. **Variables de entorno**

   Copiá `.env.example` a `.env` en la raíz y ajustá los valores si es necesario:

   ```env
   PORT=4000
   JWT_SECRET="cambiame-para-produccion"
   CORS_ORIGIN="http://localhost:3000,http://localhost:3001"
   NEXT_PUBLIC_API_URL="http://localhost:4000"
   ```

   - `JWT_SECRET` se usa para firmar los tokens del panel de administración. Si la variable no está definida se utilizará un secreto de desarrollo por defecto.
   - `CORS_ORIGIN` acepta una lista separada por comas con los orígenes autorizados para la API.

3. **Instalar dependencias**

   ```bash
   pnpm install
   ```

   > Este paso descarga los binarios de `next`, `tsx`, etc. Si ves errores del estilo `"next" no se reconoce como un comando interno o externo`, asegurate de haber corrido `pnpm install` en la raíz.

4. **Levantar el entorno local**

   ```bash
   pnpm dev
   ```

   - API: http://localhost:4000
   - Web: http://localhost:3000
   - Admin: http://localhost:3001

   El comando utiliza `concurrently` para orquestar los tres servicios; detenelo con `Ctrl+C`.

5. **Credenciales de administración**

   - Usuario: `admin@mgclone.local`
   - Clave: `admin123`

   Los datos de ejemplo (modelos, destacados, concesionarios) viven en memoria, por lo que se regeneran cada vez que se reinicia la API.

## Scripts útiles

- `pnpm install` – instala/actualiza dependencias de todo el workspace.
- `pnpm dev` – levanta API, web y admin en modo desarrollo.
- `pnpm build` – compila los tres proyectos (web/admin via Next, API via `tsc`).
- `pnpm start` – inicia API, web y admin en modo producción (requiere `pnpm build`).

## Solución de problemas comunes

- **`"next" / "tsx" no se reconoce como un comando interno o externo`**: indica que las dependencias no están instaladas. Ejecutá `pnpm install` en la raíz y luego repetí el comando (`pnpm dev`, etc.).
- **Los cambios desaparecen al reiniciar la API**: la API ahora utiliza un almacén en memoria para simplificar la configuración. Guardá la información importante en otro lugar o adaptá el store si necesitás persistencia.

## Notas adicionales

- El front (`apps/web`) espera que la API responda en `NEXT_PUBLIC_API_URL` y realiza fetch en server components sin cache.
- El formulario de Test Drive consume `/models` para listar vehículos y envía solicitudes a `/test-drive`.

¡Listo! Con estos pasos el proyecto queda funcionando sin dependencias de base de datos, listo para personalizar contenido e imágenes.
