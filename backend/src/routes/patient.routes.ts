import { Router } from 'express';
import { asyncHandler as h } from '../utils/asyncHandler';
import { validate } from '../middlewares/validate.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { createPatientSchema, updatePatientSchema } from '../validators/patient.validator';
import * as c from '../controllers/patient.controller';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /patients:
 *   post:
 *     tags: [Patients]
 *     summary: Create a patient
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PatientInput' }
 *     responses:
 *       201:
 *         description: Patient created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Patient' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.post('/', validate(createPatientSchema), h(c.create));

/**
 * @openapi
 * /patients:
 *   get:
 *     tags: [Patients]
 *     summary: List patients
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of patients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Patient' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get('/', h(c.list));

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
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/:id', h(c.getById));

/**
 * @openapi
 * /patients/{id}:
 *   put:
 *     tags: [Patients]
 *     summary: Update a patient
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PatientInput' }
 *     responses:
 *       200:
 *         description: Updated patient
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Patient' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.put('/:id', validate(updatePatientSchema), h(c.update));

/**
 * @openapi
 * /patients/{id}:
 *   delete:
 *     tags: [Patients]
 *     summary: Delete a patient (admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       204: { description: Deleted }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.delete('/:id', authorize('admin'), h(c.remove));

export default router;