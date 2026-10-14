## API Documentation (Swagger / OpenAPI)

Interactive API docs are served by the backend with `swagger-jsdoc` and `swagger-ui-express`.

- **UI:** http://localhost:5000/api-docs
- **Raw spec (JSON):** http://localhost:5000/openapi.json
- **Availability:** disabled when `NODE_ENV=production`. Set `NODE_ENV=development` in `.env` (or in the `backend` service in `docker-compose.yml`) to enable it.

### Trying protected endpoints

1. Call `POST /auth/login` with valid credentials and copy the `token` from the response.
2. Click **Authorize** at the top right and paste the token. Paste only the token, because Swagger adds the `Bearer` prefix itself.
3. Protected endpoints now send the token automatically.

### Where things live

| What | Where |
| --- | --- |
| Spec config, security scheme, shared schemas and responses | `src/config/swagger.ts` |
| Endpoint documentation | `@openapi` comment blocks above each route in `src/routes/*.ts` |

### Documenting a new endpoint

Add an `@openapi` block directly above the route:

```typescript
/**
 * @openapi
 * /patients/{id}:
 *   get:
 *     tags: [Patients]
 *     summary: Get a patient by id
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: The patient
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Patient' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/:id', h(c.getById));
```

Reuse schemas and error responses with `$ref`. New shared ones go under `components` in `src/config/swagger.ts`. Paths are relative to the `/api` prefix (the `servers` entry).
