# ClinicFlow — Patient & Appointment Management

A web application (PERN stack) for a small clinic to manage patients,
appointments and users, with a simple statistics dashboard.

**Stack:** PostgreSQL · Express (Node.js, TypeScript) · React · Docker Compose

## Quick start (Makefile)

### Option A: one command (requires `make` and Docker)

```bash
git clone <repo-url> && cd clinicflow
make up
```

`make up` creates `.env` from `.env.example` if it doesn't exist, then builds and
starts the frontend, backend and PostgreSQL. The database is migrated and seeded
automatically.

### Option B: without `make`

```bash
git clone <repo-url> && cd clinicflow
cp .env.example .env
docker compose up --build
```

### Useful commands

| Command        | Description                                          |
|----------------|------------------------------------------------------|
| `make up`      | Build and start everything (foreground)              |
| `make start`   | Build and start everything in the background         |
| `make down`    | Stop all containers                                  |
| `make logs`    | Follow logs                                          |
| `make ps`      | Show running containers                              |
| `make reset`   | Stop and delete the database volume (fresh start)    |
| `make help`    | List all commands                                    |

`make` is optional: every target is a thin wrapper around `docker compose`.

## Features

- JWT authentication with two roles: `admin` and `staff`
- Patient CRUD with pagination and search (full name / CIN); deletion is admin-only
- Appointment management with status workflow (`pending` → `confirmed` / `cancelled`)
- Business rule: a patient cannot have two **confirmed** appointments within 30 minutes
- Dashboard: total patients, today's appointments, pending and confirmed counts
- Input validation (Zod), bcrypt password hashing, consistent error handling

## (Docker, recommended)

```bash
git clone <repo-url> && cd clinicflow
cp .env.example .env
docker compose up --build
```

| Service    | URL                          |
|------------|------------------------------|
| Frontend   | http://localhost:<FRONT_PORT> |
| Backend    | http://localhost:<API_PORT>   |
| Health     | http://localhost:<API_PORT>/api/health |
| PostgreSQL | localhost:<DB_PORT>           |

The database schema is created and seeded automatically on first start
(see [Database](#database)).

To reset everything (including data):

```bash
docker compose down -v
```

## Demo accounts (from seed)

| Role  | Email                | Password     |
|-------|----------------------|--------------|
| admin | <admin@clinic.com>   | <password>   |
| staff | <staff1@clinic.com>  | <password>   |
| staff | <staff2@clinic.com>  | <password>   |

## Manual setup (without Docker)

**Prerequisites:** Node.js >= <version>, PostgreSQL >= <version>

```bash
# 1. Database
createdb clinicflow

# 2. Backend
cd backend
cp .env.example .env        # edit values
npm install
npm run <migrate>           # create tables
npm run <seed>              # insert test data
npm run dev

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Environment variables

| Variable        | Description                         | Example                  |
|-----------------|-------------------------------------|--------------------------|
| `DATABASE_URL`  | PostgreSQL connection string        | `postgres://user:pass@db:5432/clinicflow` |
| `JWT_SECRET`    | Secret used to sign tokens          | `change-me`              |
| `JWT_EXPIRES_IN`| Token lifetime                      | `1d`                     |
| `PORT`          | Backend port                        | `4000`                   |
| `VITE_API_URL`  | API base URL used by the frontend   | `http://localhost:4000/api` |

> Copy the values from your real `.env.example` here.

## Database

- Schema/migrations: `backend/db/<file or folder>`
- Seed data: 1 admin, 2 staff, 5 patients, 10 appointments (mix of pending / confirmed / cancelled)
- Full design explanation and ERD: see [`docs/DESIGN.md`](docs/DESIGN.md)

## API overview

All routes are prefixed with `/api`. Everything except login requires
`Authorization: Bearer <token>`.

| Method | Route                          | Access      | Description                      |
|--------|--------------------------------|-------------|----------------------------------|
| GET    | `/health`                      | public      | API + DB health check            |
| POST   | `/auth/login`                  | public      | Login, returns JWT               |
| POST   | `/auth/register`               | **admin**   | Create a new user (admin or staff)
| GET    | `/auth/me`                     | auth        | Current user                     |
| POST   | `/patients`                    | auth        | Create patient                   |
| GET    | `/patients?search=&page=&limit=` | auth      | Paginated list + search          |
| GET    | `/patients/:id`                | auth        | Patient details                  |
| PUT    | `/patients/:id`                | auth        | Update patient                   |
| DELETE | `/patients/:id`                | **admin**   | Delete patient                   |
| POST   | `/appointments`                | auth        | Create appointment               |
| GET    | `/appointments?date=&status=`  | auth        | List with filters                |
| PATCH  | `/appointments/:id/status`     | auth        | Update status                    |
| GET    | `/dashboard/stats`             | auth        | Dashboard statistics             |

### Error format

| Code | Meaning                                  |
|------|------------------------------------------|
| 400  | Validation error / business rule violated |
| 401  | Missing or invalid token                 |
| 403  | Insufficient role                        |
| 404  | Resource not found                       |
| 409  | <duplicate CIN / appointment conflict, if you use it> |
| 500  | Unexpected server error                  |

```json
{ "message": "Validation failed", "errors": [ ... ] }
```

## Backend architecture

```
backend/src/
├── routes/        # URL → middleware → controller wiring
├── controllers/   # HTTP layer (req/res), no business logic
├── services/      # Business logic and SQL queries
├── validators/    # Zod schemas
├── middlewares/   # authenticate, authorize(role), validate, error handler
├── config/        # env, db pool
└── utils/         # asyncHandler, helpers
```

API docs and testing guide: [docs/swagger-testing.md](docs/swagger-testing.md)

Request flow: `route → validate → authenticate/authorize → controller → service → DB`

## Business rule: 30-minute window

A patient cannot have two `confirmed` appointments less than 30 minutes apart.
It is checked <in the service layer when creating an appointment and when moving
one to `confirmed` / and enforced by <constraint/transaction> to avoid race conditions>.
See [`docs/DESIGN.md`](docs/DESIGN.md#business-rule) for details.

## Security

- Passwords hashed with bcrypt
- JWT-based auth, role check via `authorize('admin')` middleware
- All inputs validated with Zod; SQL queries are parameterized
- <CORS configuration, helmet, etc. if applicable>

