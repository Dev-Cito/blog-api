# 📝 Blog API — Full-Stack Monorepo

A production-ready blog platform built with **NestJS** + **Next.js**, featuring JWT authentication, refresh token rotation, Redis-backed token blacklisting, CSRF protection, CSP headers, and TypeORM migrations.

## 🌍 Live Demo

| Service | URL |
|---|---|
| 🌐 **Frontend** | [blog-api-nine-chi.vercel.app](https://blog-api-nine-chi.vercel.app) |
| ⚙️ **Backend API** | [blog-api-0pjk.onrender.com/api](https://blog-api-0pjk.onrender.com/api) |
| 📚 **Swagger Docs** | [blog-api-0pjk.onrender.com/api/docs](https://blog-api-0pjk.onrender.com/api/docs) |

> The backend runs on Render's free tier — it may take ~30s to wake up on first request.

---

## 🗂️ Project Structure

```
blog-api/
├── 📦 backend/          # NestJS REST API (port 3002)
├── 🖥️  frontend/         # Next.js App Router (port 3000)
├── 🐳 docker-compose.yml
├── 📄 pnpm-workspace.yaml
└── 📄 package.json
```

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| 🖥️ Frontend | Next.js 16, Tailwind CSS, Zustand, Axios |
| ⚙️ Backend | NestJS 11, TypeORM 1, Passport JWT |
| 🗄️ Database | PostgreSQL 16 (port 5434) |
| ⚡ Cache / Blacklist | Redis 7 (port 6379) |
| 🔐 Auth | JWT (httpOnly cookies) + Refresh Token Rotation |
| 🐳 DevOps | Docker Compose |
| 📦 Package Manager | pnpm 11 (workspaces) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) ≥ 20
- [pnpm](https://pnpm.io) ≥ 11
- [Docker](https://www.docker.com) Desktop

### 1️⃣ Clone & install

```bash
git clone <repo-url>
cd blog-api
pnpm install
```

### 2️⃣ Start infrastructure

```bash
docker compose up -d
```

This starts:
- 🐘 **PostgreSQL** on `localhost:5434`
- 🔴 **Redis** on `localhost:6379`

### 3️⃣ Configure environment

```bash
cp backend/.env.example backend/.env
```

The default `.env` works out of the box with the Docker Compose setup:

```env
DB_HOST=localhost
DB_PORT=5434
DB_USERNAME=
DB_PASSWORD=
DB_NAME=

PORT=3002
NODE_ENV=development

JWT_SECRET=<your-secret>
JWT_EXPIRES_IN=15m

FRONTEND_URL=http://localhost:3000

REDIS_HOST=localhost
REDIS_PORT=6379
```

### 4️⃣ Run migrations

```bash
cd backend
pnpm migration:run
```

### 5️⃣ Seed the database

```bash
cd backend
pnpm seed
```

### 6️⃣ Start dev servers

From the root (two terminals):

```bash
# Terminal 1 — backend
pnpm dev:backend

# Terminal 2 — frontend
pnpm dev:frontend
```

| Service | URL |
|---|---|
| 🌐 Frontend | http://localhost:3000 |
| ⚙️ API | http://localhost:3002/api |
| 📚 Swagger | http://localhost:3002/api/docs |

---

## 🔑 Accounts

### 🛡️ Admin
| Field | Value |
|---|---|
| **Email** | `live@gmail.com` |
| **Password** | `Live.123456` |
| **Role** | `admin` |

### ✍️ User
| Field | Value |
|---|---|
| **Email** | `olivier@gmail.com` |
| **Password** | `Olivier.123456` |
| **Role** | `user` |

---

## 🏗️ Backend Architecture

```
backend/src/
├── 🔐 auth/
│   ├── strategies/         # JWT Passport strategy
│   ├── guards/             # JwtAuthGuard, AdminGuard, CsrfGuard
│   ├── decorators/         # @SkipCsrf()
│   ├── entities/           # RefreshToken entity
│   ├── dto/                # RegisterDto, LoginDto
│   ├── auth.controller.ts  # /auth endpoints
│   ├── auth.service.ts
│   ├── refresh-token.service.ts
│   └── token-blacklist.service.ts
├── 👤 users/
├── 📝 posts/
├── 🏷️  categories/
├── 🔖 tags/
├── ⚡ redis/               # Global Redis module (ioredis)
├── ⚙️  config/              # Joi env validation
├── 🗄️  database/
│   ├── migrations/         # TypeORM migrations
│   └── seeds/              # Dev seed data
└── 📦 common/
    ├── filters/            # AllExceptionsFilter
    ├── interceptors/       # ResponseInterceptor
    └── decorators/         # @CurrentUser()
```

### 🔒 Security Features

| Feature | Implementation |
|---|---|
| 🍪 **httpOnly cookies** | Access token (15min) + Refresh token (7 days) |
| 🔄 **Refresh token rotation** | Opaque token, SHA-256 hashed in DB, deleted on use |
| 🚫 **JWT blacklist** | Redis `bl:{jti}` key with TTL on logout |
| 🛡️ **CSRF protection** | Double-submit cookie pattern (`X-CSRF-Token` header) |
| 🔏 **Helmet CSP** | Content-Security-Policy on all responses |
| ⚡ **Rate limiting** | Global 100/min + per-route (register: 5/min, login: 10/min) |
| 👮 **AdminGuard** | Role-based access on category/tag mutations |
| ✅ **Input validation** | `class-validator` with `forbidNonWhitelisted: true` |

---

## 🌐 API Endpoints

### 🔐 Auth

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user | — |
| `POST` | `/api/auth/login` | Login | — |
| `POST` | `/api/auth/refresh` | Rotate access token | — |
| `POST` | `/api/auth/logout` | Logout + blacklist token | 🔒 JWT |
| `GET` | `/api/auth/me` | Get current user | 🔒 JWT |

### 📝 Posts

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/posts` | List posts (paginated, filterable) | — |
| `GET` | `/api/posts/:id` | Get single post | — |
| `POST` | `/api/posts` | Create post | 🔒 JWT |
| `PUT` | `/api/posts/:id` | Update post | 🔒 JWT (owner) |
| `DELETE` | `/api/posts/:id` | Delete post | 🔒 JWT (owner) |
| `PATCH` | `/api/posts/:id/publish` | Publish post | 🔒 JWT (owner) |

### 🏷️ Categories

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/categories` | List categories | — |
| `POST` | `/api/categories` | Create category | 🔒 Admin |
| `PUT` | `/api/categories/:id` | Update category | 🔒 Admin |
| `DELETE` | `/api/categories/:id` | Delete category | 🔒 Admin |

### 🔖 Tags

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/tags` | List tags | — |
| `POST` | `/api/tags` | Create tag | 🔒 JWT |
| `PUT` | `/api/tags/:id` | Update tag | 🔒 Admin |
| `DELETE` | `/api/tags/:id` | Delete tag | 🔒 Admin |

---

## 🖥️ Frontend Pages

| Route | Description | Access |
|---|---|---|
| `/blog` | Public blog listing | Everyone |
| `/blog/[slug]` | Single post view | Everyone |
| `/categories/[slug]` | Posts by category | Everyone |
| `/login` | Login page | Guest |
| `/register` | Register page | Guest |
| `/dashboard` | Role-aware dashboard | 🔒 JWT |
| `/posts/new` | Create post | 🔒 JWT |
| `/posts/[id]/edit` | Edit post | 🔒 JWT (owner) |

---

## 🗄️ Database Schema

```
users ──────────────────┐
  id, email, password   │ (authorId)
  name, role            │
                        ▼
                      posts ──────────── categories
                        │  id, title       id, name, slug
                        │  slug, content
                        │  status, viewCount
                        │
                        └──── posts_tags_tags ──── tags
                                                   id, name, slug

refresh_tokens
  id, tokenHash (SHA-256), userId, expiresAt
```

---

## 🗃️ Migrations

```bash
cd backend

# Generate a new migration after changing an entity
pnpm migration:generate src/database/migrations/YourMigrationName

# Run pending migrations
pnpm migration:run

# Undo last migration
pnpm migration:revert

# Show migration status
pnpm migration:show
```

---

## 🐳 Docker Services

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f

# Reset database (⚠️ deletes all data)
docker compose down -v
```

---

## 📦 Root Scripts

```bash
pnpm dev:backend      # Start NestJS in watch mode
pnpm dev:frontend     # Start Next.js dev server
pnpm build:backend    # Build NestJS for production
pnpm build:frontend   # Build Next.js for production
```

---


## ☁️ Production Deployment

| Service | Platform | Notes |
|---|---|---|
| 🌐 Frontend | [Vercel](https://vercel.com) | Auto-deploys on `git push` to `main` |
| ⚙️ Backend | [Render](https://render.com) | Free tier — spins down after 15 min inactivity |
| 🗄️ Database | [Neon](https://neon.tech) | Serverless PostgreSQL, free tier |
| ⚡ Cache | [Render Key Value](https://render.com) | Redis-compatible, free tier |

### Redeploy frontend
```bash
npx vercel --prod   # from project root
```

### Promote a user to admin
Run in the [Neon SQL Editor](https://console.neon.tech):
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## 📚 Resources

- [NestJS Docs](https://docs.nestjs.com)
- [Next.js Docs](https://nextjs.org/docs)
- [TypeORM Docs](https://typeorm.io)
- [Swagger Docs (live)](https://blog-api-0pjk.onrender.com/api/docs)

---

<div align="center">
  Built with ❤️ using NestJS + Next.js + PostgreSQL + Redis
</div>
