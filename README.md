
# ClinicFlow — Patient & Appointment Management

ClinicFlow is a web application designed to help a small clinic manage patients, appointments, users, and daily activity through a dashboard.

## Tech Stack

- **Frontend:** React, TypeScript
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** PostgreSQL
- **Authentication:** JWT, bcrypt
- **Validation:** Zod
- **Infrastructure:** Docker Compose

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

### Authentication and Authorization

- JWT-based authentication.
- Role-based access control with `admin` and `staff` roles.
- Password hashing with bcrypt.
- Protected API endpoints.

### Patient Management

- Create, view, update, and delete patient records.
- Search patients by full name or CIN.
- Paginated patient listings.
- Restrict patient deletion to administrators.

### Appointment Management

- Create and view appointments.
- Filter appointments by date and status.
- Manage appointment statuses: `pending`, `confirmed`, and `cancelled`.
- Prevent conflicting confirmed appointments for the same patient within a 30-minute interval.

### Dashboard

- Total number of patients.
- Today's appointments.
- Appointment statistics grouped by status.

### API and Reliability

- Input validation using Zod.
- Centralized error handling.
- Parameterized SQL queries.
- RESTful API endpoints.
- PostgreSQL-backed data persistence.

## Getting Started

### Prerequisites

Make sure the following tools are installed:

- Git
- Docker Engine
- Docker Compose
- GNU Make (optional)

### Run with Docker Compose

Clone the repository:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd clinicflow
```

Create the environment file:

```bash
cp .env.example .env
```

Configure the required environment variables in `.env`, then start the application:

```bash
docker compose up --build
```

To run the services in the background:

```bash
docker compose up --build -d
```

Check the service status:

```bash
docker compose ps
```

View the logs:

```bash
docker compose logs -f
```

The database schema and initial data are created through the migration and seed processes configured in the project.

## Available Commands

If the project includes a `Makefile`, the following commands can be used:

| Command | Description |
|---|---|
| `make up` | Build and start the application |
| `make start` | Start the application in the background |
| `make down` | Stop and remove containers |
| `make logs` | Display application logs |
| `make ps` | Show container status |
| `make reset` | Reset the database and its persisted data |
| `make help` | Display available Make commands |

You can also manage the application directly with Docker Compose:

```bash
docker compose up --build
docker compose down
docker compose logs -f
docker compose ps
```

To remove the containers and their associated volumes:

```bash
docker compose down -v
```

**Note:** Removing volumes deletes persisted database data.

## Application URLs

The application URLs depend on the port mappings configured in `docker-compose.yml` and the environment files.

| Service | URL |
|---|---|
| Frontend | `http://localhost:<frontend-port>` |
| Backend API | `http://localhost:<backend-port>/api` |
| Health Check | `http://localhost:<backend-port>/api/health` |
| Swagger UI | Use the Swagger path configured by the backend |
| PostgreSQL | `localhost:<database-port>` |

Replace the port placeholders with the actual values configured in your project.

## Demo Accounts

The seed script creates the demo users used to test authentication and role-based access.

| Role | Email |
|---|---|
| Admin | `admin@clinic.com` |
| Staff | `staff1@clinic.com` |
| Staff | `staff2@clinic.com` |

Use the passwords defined in the seed script when logging in.

## Manual Setup (Without Docker)

### Prerequisites

- Node.js
- npm
- PostgreSQL

### 1. Create the database

Create the database in PostgreSQL:

```sql
CREATE DATABASE clinicflow;
```

Configure a PostgreSQL user with the necessary permissions to access the database.

### 2. Configure the backend

Open a terminal and run:

```bash
cd backend
cp .env.example .env
npm install
```

Update `backend/.env` with your local PostgreSQL connection details and JWT configuration.

Run the database migration and seed commands provided by the backend project, then start the development server using the scripts defined in `backend/package.json`.

### 3. Configure the frontend

Open a second terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Configure the frontend API URL to point to the backend server.

### 4. Verify the application

- Confirm that the backend starts successfully.
- Check the health endpoint.
- Verify that the database connection works.
- Log in with a seeded demo account.
- Test patient management, appointment management, and dashboard statistics.

## Environment Variables

The application uses environment variables to configure the database connection, authentication, and frontend-to-backend communication.

The exact variable names are defined in the project's environment files.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string, if used by the backend |
| `JWT_SECRET` | Secret used to sign authentication tokens |
| `JWT_EXPIRES_IN` | JWT expiration duration, if configurable |
| `PORT` | Backend listening port, if configurable |
| `VITE_API_URL` | Frontend API base URL, if used by the frontend |

Example PostgreSQL connection string:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/clinicflow
```

Inside Docker Compose, the database hostname should match the PostgreSQL service name. For local development, it is commonly `localhost`.

Keep environment files containing secrets out of version control.

## Database Design

ClinicFlow uses PostgreSQL to manage three main entities.

### Users

Stores authentication and authorization information, including user credentials and roles.

### Patients

Stores patient information, including identifying details such as CIN.

### Appointments

Stores appointment details, patient relationships, dates, and appointment statuses.

### Initial Data

The development seed dataset contains the following records, as defined by the project seed script:

- 1 administrator.
- 2 staff users.
- 5 patients.
- 10 appointments across the supported statuses.

See [Database Design and ERD](docs/DESIGN.md) for the database schema, entity relationships, constraints, and design decisions.

## API Overview

All API endpoints use the `/api` prefix.

Protected endpoints require a valid JWT in the `Authorization` header:

```http
Authorization: Bearer <token>
```

### Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Authenticate a user |
| POST | `/api/auth/register` | Admin | Register a user |
| GET | `/api/auth/me` | Authenticated | Retrieve the current user |

### Patients

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/patients` | Authenticated | Create a patient |
| GET | `/api/patients` | Authenticated | List patients with pagination and search |
| GET | `/api/patients/:id` | Authenticated | Retrieve patient details |
| PUT | `/api/patients/:id` | Authenticated | Update a patient |
| DELETE | `/api/patients/:id` | Admin | Delete a patient |

Patient listing supports the following query parameters:

```text
/api/patients?search=&page=&limit=
```

### Appointments

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/appointments` | Authenticated | Create an appointment |
| GET | `/api/appointments` | Authenticated | List appointments |
| PATCH | `/api/appointments/:id/status` | Authenticated | Update appointment status |

Appointment listing supports date and status filters:

```text
/api/appointments?date=&status=
```

### Dashboard

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/dashboard/stats` | Authenticated | Retrieve dashboard statistics |

### Health Check

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Check API health |

### Error Handling

The API uses HTTP status codes to indicate the result of a request.

| Status | Meaning |
|---|---|
| `400` | Invalid input or business rule violation |
| `401` | Missing or invalid authentication |
| `403` | Insufficient permissions |
| `404` | Resource not found |
| `409` | Resource conflict, when returned by the API |
| `500` | Unexpected server error |

## Backend Architecture

The backend separates request handling, validation, business logic, and database access.

```text
backend/src/
├── routes/        # API route definitions
├── controllers/   # HTTP request and response handling
├── services/      # Business logic and database operations
├── validators/    # Zod validation schemas
├── middlewares/   # Authentication, authorization and validation
├── config/        # Application and database configuration
└── utils/         # Shared utilities
```

### Request Lifecycle

```text
HTTP Request
    |
    v
Route and Middleware
    |
    v
Validation and Authorization
    |
    v
Controller
    |
    v
Service
    |
    v
PostgreSQL
    |
    v
HTTP Response
```

The middleware sequence depends on the route. Public endpoints, such as login, do not require an authentication token.

## Business Rules

### Appointment Conflict Prevention

A patient cannot have two confirmed appointments within 30 minutes of each other.

The conflict check applies when:

- Creating a confirmed appointment.
- Changing an appointment's status to `confirmed`.

Pending and cancelled appointments do not count as confirmed appointments when checking this rule.

### Access Control

- Authenticated users can manage patient records according to their assigned permissions.
- Only administrators can delete patients.
- Only authorized administrators can register users, according to the API access rules.

## Security

ClinicFlow uses the following security mechanisms:

- JWT-based authentication.
- Password hashing with bcrypt.
- Role-based access control.
- Request validation with Zod.
- Parameterized SQL queries.
- Centralized error handling.

Authentication secrets and database credentials are supplied through environment variables.

## Documentation

Additional project documentation:

- [Database Design and ERD](docs/DESIGN.md)
- [Swagger and API Testing Guide](docs/swagger-testing.md)
- [Backend Testing Guide](docs/testing.md)
