# Testing the API with Swagger

This guide walks through verifying the backend using the built-in Swagger UI.

## 1. Start the stack

From the project root:

```bash
cp .env.example .env     # first time only
make up                  # or: docker compose up -d --build
```

Wait until the backend is up:

```bash
docker compose logs backend | tail -n 20
```

You should see `ClinicFlow API running on http://localhost:5000`.

> Swagger is disabled when `NODE_ENV=production`. For testing, make sure the backend runs with `NODE_ENV=development`.

## 2. Check that the docs load

1. Open http://localhost:5000/api-docs
2. You should see **ClinicFlow API** with four groups: **Auth**, **Patients**, **Appointments**, **Dashboard**
3. No red error box should appear at the top

Raw spec: http://localhost:5000/openapi.json

## 3. Get an admin account

Login needs an existing user. Create or seed one:

```bash
# <fill in the exact command for your setup, for example:>
docker compose exec backend npm run seed
```

Credentials: `<ADMIN_EMAIL>` / `<ADMIN_PASSWORD>`

## 4. Authenticate in Swagger

1. Expand `POST /auth/login` → **Try it out**
2. Enter the credentials above → **Execute**
3. Expect `200`; copy the `token` from the response body
4. Click **Authorize** (top right), paste **only the token** (Swagger adds `Bearer`), click **Authorize**, then **Close**

## 5. Test script

| # | Endpoint | Steps | Expected |
| --- | --- | --- | --- |
| 1 | `GET /auth/me` | Execute | `200`, the logged-in user |
| 2 | `POST /patients` | Use the example body, set real values | `201`, response includes an `id` (copy it) |
| 3 | `GET /patients` | Execute | `200`, list includes the new patient |
| 4 | `GET /patients/{id}` | Paste the id | `200`, the same patient |
| 5 | `PUT /patients/{id}` | Change a field | `200`, updated values |
| 6 | `POST /appointments` | Use the patient id | `201`, response includes an `id` |
| 7 | `GET /appointments` | Execute | `200`, list includes the appointment |
| 8 | `PATCH /appointments/{id}/status` | Set `completed` | `200`, status updated |
| 9 | `GET /dashboard/stats` | Execute | `200`, stats object |
| 10 | `POST /auth/register` | Create a non-admin user | `201` |
| 11 | `DELETE /patients/{id}` | Paste the id | `204` (admin only) |

## 6. Failure cases

| Check | How | Expected |
| --- | --- | --- |
| No token | Click **Authorize** → **Logout**, then call `GET /patients` | `401` |
| Wrong password | `POST /auth/login` with a bad password | `401` |
| Invalid body | `POST /patients` with required fields empty | `400` |
| Unknown id | `GET /patients/{id}` with a random id | `404` |
| Non-admin forbidden | Log in as the user from step 10, authorize with its token, call `DELETE /patients/{id}` | `403` |

## 7. Command-line check (optional)

```bash
curl -s http://localhost:5000/openapi.json | head -c 300
curl -i http://localhost:5000/api/patients        # expect 401 without a token
```
