
# ClinicFlow — Patient & Appointment Management

A web application built with the PERN stack to help a small clinic manage patients, appointments, and users through a simple dashboard.

**Tech stack:** PostgreSQL · Express.js · Node.js · TypeScript · React · Docker Compose

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Available Commands](#available-commands)
- [Application URLs](#application-urls)
- [Demo Accounts](#demo-accounts)
- [Manual Setup](#manual-setup-without-docker)
- [Environment Variables](#environment-variables)
- [Database Design](#database-design)
- [API Overview](#api-overview)
- [Backend Architecture](#backend-architecture)
- [Business Rules](#business-rules)
- [Security](#security)
- [Documentation](#documentation)

## Features

- JWT authentication with two roles: `admin` and `staff`.
- Patient CRUD operations with pagination and search by full name or CIN.
- Admin-only patient deletion.
- Appointment management with status transitions: `pending`, `confirmed`, and `cancelled`.
- Appointment conflict validation: a patient cannot have two confirmed appointments within 30 minutes.
- Dashboard statistics, including total patients, today's appointments, and appointment counts by status.
- Input validation using Zod.
- Password hashing using bcrypt.
- Centralized error handling and parameterized SQL queries.

## Getting Started

### Prerequisites

- Git
- Docker Engine
- Docker Compose
- GNU Make (optional)

### Option A: Using Make

Clone the repository and start the application:

```bash
git clone <repo-url>
cd clinicflow
make up
```

The `make up` target should create the `.env` file from `.env.example` if needed, then build and start the application services.

Database migrations and seed data are initialized automatically if configured in the Docker Compose setup.

### Option B: Using Docker Compose

```bash
git clone <repo-url>
cd clinicflow
cp .env.example .env
docker compose up --build
```

Check the logs to verify that the services have started successfully:

```bash
docker compose logs -f
```

> Replace `<repo-url>` with your actual repository URL.

## Available Commands

| Command | Description |
|---|---|
| `make up` | Build and start services in the foreground |
| `make start` | Build and start services in the background |
| `make down` | Stop and remove containers |
| `make logs` | Follow service logs |
| `make ps` | List running containers |
| `make reset` | Reset the database volume, deleting persisted data |
| `make help` | Display available Make targets |

These commands depend on the targets defined in the project's `Makefile`.

Docker Compose can also be used directly:

```bash
docker compose up --build
docker compose down
docker compose logs -f
docker compose ps
```

To remove containers and their associated Compose-managed volumes:

```bash
docker compose down -v
```

**Warning:** The `-v` option deletes persisted database data. Use it only when you intend to reset the database.

## Application URLs

The following URLs are examples. Use the actual ports configured in `.env` and `docker-compose.yml`.

| Service | URL |
|---|---|
| Frontend | `http://localhost:<FRONT_PORT>` |
| Backend API | `http://localhost:<API_PORT>/api` |
| Health Check | `http://localhost:<API_PORT>/api/health` |
| Swagger UI | `<SWAGGER_URL_IF_CONFIGURED>` |
| PostgreSQL | `localhost:<DB_PORT>` |

The database is initialized automatically only if the Docker configuration includes the required migration and seeding steps.

## Demo Accounts

The following accounts should correspond to the users created by the seed script.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@clinic.com` | `<SEEDED_ADMIN_PASSWORD>` |
| Staff | `staff1@clinic.com` | `<SEEDED_STAFF_PASSWORD>` |
| Staff | `staff2@clinic.com` | `<SEEDED_STAFF_PASSWORD>` |

Use the actual credentials defined in your seed script. Never use production credentials in this section.

## Manual Setup (Without Docker)

### Prerequisites

- Node.js version supported by the project
- npm
- PostgreSQL
- A running PostgreSQL instance and a database user with appropriate permissions

### 1. Create the database

Create the database using your PostgreSQL installation:

```sql
CREATE DATABASE clinicflow;
```

Ensure the PostgreSQL user used by the backend has access to the database.

### 2. Configure and start the backend

```bash
cd backend
cp .env.example .env
npm install
```

Update `backend/.env` with your local database connection string and JWT configuration.

Run the migration and seed commands defined in `backend/package.json`. For example, if your project provides these scripts:

```bash
npm run migrate
npm run seed
npm run dev
```

The migration and seed command names above are examples; use the actual scripts defined by your project.

### 3. Configure and start the frontend

Open a second terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Set the frontend API URL to the backend's accessible API base URL.

## Environment Variables

The following variables are examples. Confirm the actual variable names and defaults in your `.env.example` files and environment configuration.

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@db:5432/clinicflow` |
| `JWT_SECRET` | Secret used to sign JWTs | `<STRONG_RANDOM_SECRET>` |
| `JWT_EXPIRES_IN` | Token expiration duration | `1d` |
| `PORT` | Backend listening port | `4000` |
| `VITE_API_URL` | Frontend API base URL | `http://localhost:4000/api` |

**Important:** Inside Docker Compose, the database hostname is typically the database service name, such as `db`. For local development outside Docker, it is usually `localhost`.

Keep secrets in environment variables. Do not commit `.env` files containing real credentials.

## Database Design

The application uses PostgreSQL to store users, patients, and appointments.

- **Users:** Authentication credentials and role information.
- **Patients:** Patient information, including identifying information such as CIN.
- **Appointments:** Patient references, appointment dates, and statuses.

Database migrations and seed data are managed by the project's database scripts.

The seed dataset is expected to contain:

- 1 administrator
- 2 staff users
- 5 patients
- 10 appointments across the supported statuses

See [`docs/DESIGN.md`](docs/DESIGN.md) for the complete database design, relationships, constraints, and ERD.

## API Overview

All API routes are prefixed with `/api`.

Except for public endpoints, requests require a valid JWT in the `Authorization` header:

```http
Authorization: Bearer <token>
```

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/health` | Public | API and database health check |
| POST | `/api/auth/login` | Public | Authenticate and return a JWT |
| POST | `/api/auth/register` | Admin | Create an admin or staff user |
| GET | `/api/auth/me` | Authenticated | Retrieve the current user |
| POST | `/api/patients` | Authenticated | Create a patient |
| GET | `/api/patients?search=&page=&limit=` | Authenticated | List patients with pagination and search |
| GET | `/api/patients/:id` | Authenticated | Retrieve patient details |
| PUT | `/api/patients/:id` | Authenticated | Update a patient |
| DELETE | `/api/patients/:id` | Admin | Delete a patient |
| POST | `/api/appointments` | Authenticated | Create an appointment |
| GET | `/api/appointments?date=&status=` | Authenticated | List appointments with filters |
| PATCH | `/api/appointments/:id/status` | Authenticated | Update appointment status |
| GET | `/api/dashboard/stats` | Authenticated | Retrieve dashboard statistics |

Access levels and paths must match the actual route definitions and authorization middleware.

### Error Handling

The API uses HTTP status codes to communicate errors.

| Status | Meaning |
|---|---|
| `400` | Invalid input or business rule violation |
| `401` | Missing or invalid authentication token |
| `403` | Insufficient permissions |
| `404` | Resource not found |
| `409` | Resource conflict, when implemented |
| `500` | Unexpected server error |

Example validation error response:

```json
{
  "message": "Validation failed",
  "errors": []
}
```

The response structure above is illustrative. Refer to the centralized error handler for the actual response format.

## Backend Architecture

The backend follows a layered architecture that separates HTTP handling, business logic, validation, and database access.

```text
backend/src/
├── routes/        # Route definitions and middleware wiring
├── controllers/   # HTTP request and response handling
├── services/      # Business logic and database operations
├── validators/    # Zod validation schemas
├── middlewares/   # Authentication, authorization and validation
├── config/        # Environment and database configuration
└── utils/         # Shared helpers and async utilities
```

Request lifecycle:

```text
Request
  → Route
  → Validation
  → Authentication / Authorization
  → Controller
  → Service
  → PostgreSQL
  → Response
```

The exact order of middleware depends on the route configuration. Public routes, such as login, do not require authentication.

## Business Rules

### Appointment Conflict Prevention

A patient cannot have two confirmed appointments within 30 minutes of each other.

The application should validate this rule when:

- Creating an appointment that is confirmed.
- Changing an existing appointment to `confirmed`.

Pending and cancelled appointments should be handled according to the business requirements.

The service layer should perform the conflict check. If concurrent requests are possible, database-level constraints, appropriate locking, or transaction-based protection may also be necessary to prevent race conditions.

See [`docs/DESIGN.md`](docs/DESIGN.md) for the implemented conflict-checking strategy.

## Security

The application includes the following security measures, subject to the actual implementation:

- Password hashing with bcrypt.
- JWT-based authentication.
- Role-based access control for administrative operations.
- Request validation using Zod.
- Parameterized SQL queries to reduce SQL injection risk.
- Centralized error handling.

If configured, Helmet and CORS provide additional HTTP security controls.

Secrets must be provided through environment variables. Use a strong JWT secret and restrict CORS origins appropriately outside local development.

## Documentation

- [Database Design and ERD](docs/DESIGN.md)
- [Swagger and API Testing Guide](docs/swagger-testing.md)
- [Backend Testing Guide](docs/testing.md)

Refer to these documents for database decisions, endpoint testing, and project verification procedures.
