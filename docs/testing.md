# Backend Testing

The backend is tested with [Jest](https://jestjs.io/) and [supertest](https://github.com/ladjs/supertest). Tests call the real Express `app` over HTTP in memory, with the database mocked, so **no Postgres or Docker is needed to run them**.

## Run the tests

From the project root:

```bash
make test
```

Or from `backend/`:

```bash
npm install          # first time only
npm test             # run once
npm run test:watch   # re-run on file changes
npm run test:coverage  # coverage report in backend/coverage
```

Expected result: all suites pass, for example `Tests: 9 passed, 9 total`.

> Tests are not run inside the Docker image. Run them locally (or in CI) before building the image.

## What is in place

| File | Purpose |
| --- | --- |
| `backend/jest.config.js` | Jest configuration. Uses `@swc/jest` to compile TypeScript, loads `src/tests/setup-env.ts`, finds `src/**/*.test.ts`. |
| `backend/src/tests/setup-env.ts` | Sets safe environment variables (`NODE_ENV=test`, a fake `DATABASE_URL`, a `JWT_SECRET` of 16+ characters, and so on) before `config/env.ts` validates them. Tests never read your real `.env` values. |
| `backend/src/tests/app.test.ts` | API tests that run against the real app. |
| `backend/tsconfig.json` | Excludes `src/tests` and `*.test.ts` from `npm run build`, so tests are never compiled into `dist/`. |

Dev dependencies: `jest`, `@types/jest`, `@swc/jest`, `@swc/core`, `supertest`, `@types/supertest`.

> `@swc/jest` is used instead of `ts-jest` because the project is on TypeScript 7.

## What is covered today

| Area | Checks |
| --- | --- |
| Health | `GET /api/health` returns `200` with the database mocked |
| Not found | Unknown routes return `404` with `success: false` |
| Auth guard | Patients, appointments, dashboard, `/auth/me` and `DELETE /patients/:id` return `401` without a token |
| Validation | `POST /api/auth/login` with an empty body returns `400` |
| Swagger | `/openapi.json` is served and documents every route group and the `Patient` schema |

Not covered yet: login with real credentials, role checks (`403` for non-admins), and create, update and delete flows for patients and appointments.

## How the tests work

- **The database is mocked.** `app.test.ts` replaces `src/config/db` with a fake `query` function. If a service imports other exports from `db` (for example a pool), add them to the mock.
- **Environment is fixed.** `setup-env.ts` runs before every test file. If you add a variable to `src/config/env.ts`, add a test value to `setup-env.ts` too, otherwise validation fails and the run exits.
- **The app is imported without starting a server.** Tests import `src/app.ts` (not `server.ts`), so no port is opened.

## Writing a new test

1. Create `backend/src/tests/<name>.test.ts`.
2. Mock the database before importing the app.
3. Call the endpoint with `supertest`.

```typescript
import request from 'supertest';

jest.mock('../config/db', () => ({
  query: jest.fn(),
}));

import app from '../app';
import { query } from '../config/db';

const mockedQuery = query as jest.Mock;

describe('GET /api/example', () => {
  it('returns data from the database', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id: '1' }] });

    const res = await request(app).get('/api/example');

    expect(res.status).toBe(200);
  });
});
```

For protected routes, sign a token with the test secret and send it in the header:

```typescript
import jwt from 'jsonwebtoken';

const token = jwt.sign({ id: '1', role: 'admin' }, process.env.JWT_SECRET!);

await request(app).get('/api/patients').set('Authorization', `Bearer ${token}`);
```

Adjust the token payload to match what `auth.middleware.ts` expects.

## Conventions

- One `describe` per route or feature; test names state the expected behavior.
- Test failure cases (`400`, `401`, `403`, `404`) as well as the happy path.
- Keep tests independent. `clearMocks` is on, so mock calls reset between tests.
- Never point tests at a real database.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `Invalid environment variables` and the run exits | A variable in `src/config/env.ts` is missing from `src/tests/setup-env.ts`, or `JWT_SECRET` is under 16 characters. |
| Jest hangs or reports open handles | Something opened a real connection. Make sure `config/db` is mocked before `../app` is imported. |
| `Cannot find module` for a path | Check the relative path in `jest.mock(...)`. It is relative to the test file. |
| TypeScript errors about `describe` or `it` in the build | `src/tests` and `*.test.ts` must be listed under `exclude` in `tsconfig.json`. |
| A status code does not match | Check what the middleware really returns and update the test expectation. |