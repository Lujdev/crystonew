# CrystoDolar

Plataforma web y API REST para consultar, comparar y convertir tasas de cambio venezolanas. El proyecto reúne la experiencia visual de CrystoAstro, la API de CrystoAPI y una arquitectura preparada para más fuentes, monedas, histórico, API keys y backups en Google Drive.

## Stack

- pnpm workspaces + Turborepo.
- Next.js 16.3, App Router y Turbopack.
- NestJS 11, REST, Swagger y health checks.
- SQLite con better-sqlite3 y TypeORM migrations.
- TypeScript 6.
- Tailwind CSS 4 y Lucide React; la UI compartida queda preparada para extraerse a `packages/ui`.
- Biome y Jest.
- Docker Compose para desarrollo y despliegue en VPS.

## Estructura

```text
apps/web       Next.js: landing, app, histórico, documentación y PWA
apps/api       NestJS: tasas, histórico, API keys, magic links y backups
packages/*     Contratos, UI y configuración compartida
infra/docker   Imágenes multi-stage
data/          SQLite persistente en desarrollo
backups/       Artefactos locales antes de subirlos a Drive
```

## Inicio rápido

```bash
pnpm install
Copy-Item .env.example .env
pnpm db:migrate
pnpm db:seed
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:3001
- Swagger: http://localhost:3001/docs
- Health: http://localhost:3001/health

También puedes ejecutar todo con Docker:

```bash
docker compose up --build
docker compose exec -T api node dist/database/seeds/run-seeds.js
docker compose restart api
```

En el primer arranque, ejecuta el seed y reinicia la API para cargar las monedas,
fuentes, pares y planes iniciales en SQLite.

## API pública

```text
GET  /v1/rates
GET  /v1/history/:pairCode
GET  /v1/convert?amount=100&from=USD&to=VES
GET  /v1/status
POST /v1/backups                    (x-backup-token)
```

Las tasas actuales se pueden consultar sin clave. El uso con API key acepta `Authorization: Bearer <API_KEY>` y queda registrado por endpoint y día para aplicar el límite mensual.

## API keys

El registro usa correo y magic link. La integración de correo está abstraída detrás de `EmailPort`; cuando exista `RESEND_API_KEY`, el adaptador enviará el enlace por Resend. En desarrollo, el enlace se registra en la consola.

Planes iniciales mensuales:

| Plan | Límite |
| --- | ---: |
| Free | 500 solicitudes |
| Development | 10.000 solicitudes |

Las claves se almacenan como hash. El registro inicial se hace por magic link, permite escoger `free` o `development`, y la clave se muestra una sola vez en el flujo de verificación.

## Fuentes, monedas e histórico

Los proveedores y monedas son registros de base de datos, no constantes rígidas. Para agregar una fuente se implementa `RateProvider`, se registra su configuración y se vincula a uno o más pares. El histórico se guarda como eventos append-only en `quote_history`, con índices por proveedor, par y fecha.

## Backups

El servicio crea snapshots consistentes de SQLite, calcula SHA-256 y los guarda localmente. Si se configura OAuth2 con una cuenta personal, también los sube a Google Drive. La integración está detrás de `BackupStorage` para permitir otros proveedores después. El endpoint manual requiere `BACKUP_ADMIN_TOKEN`.

Variables relevantes:

```text
GOOGLE_DRIVE_FOLDER_ID
GOOGLE_DRIVE_REFRESH_TOKEN
GOOGLE_DRIVE_CLIENT_ID
GOOGLE_DRIVE_CLIENT_SECRET
BACKUP_ENCRYPTION_KEY       # reservado para cifrado gestionado en la siguiente iteración
BACKUP_ADMIN_TOKEN
```

## SEO y PWA

La web incluye metadata por ruta, canonical URLs, sitemap, robots, Open Graph, favicon y logo de CrystoDolar, además de manifest instalable para PWA.

## Principios de diseño

- SOLID en módulos de dominio y adaptadores.
- Proveedores y almacenamiento detrás de interfaces.
- Servicios pequeños con una responsabilidad clara.
- DTOs y validación en los límites de la API.
- Migraciones explícitas; no se usa `synchronize` en producción.
- Los precios se almacenan como enteros escalados para evitar errores de punto flotante.

## Scripts

```bash
pnpm dev
pnpm build
pnpm check
pnpm test
pnpm db:migrate
pnpm db:seed
pnpm docker:up
pnpm docker:down
```

## Licencia

Pendiente de confirmar para el nuevo repositorio.
