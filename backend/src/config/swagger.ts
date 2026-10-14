import swaggerJsdoc from "swagger-jsdoc";
import path from "node:path";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ClinicFlow API",
      version: "1.0.0",
      description:
        "API documentation for managing patients, appointments, users, and dashboard statistics.",
    },
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
      responses: {
        ValidationError: { description: "Request validation failed" },
        Unauthorized: { description: "Missing or invalid token" },
        Forbidden: { description: "Insufficient role" },
        NotFound: { description: "Resource not found" },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["admin", "doctor", "staff"] },
          },
        },
        Patient: {
          type: "object",
          properties: {
            id: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            dateOfBirth: { type: "string", format: "date" },
            phone: { type: "string" },
            email: { type: "string", format: "email" },
          },
        },
        PatientInput: {
          type: "object",
          required: ["firstName", "lastName"],
          properties: {
            firstName: { type: "string" },
            lastName: { type: "string" },
            dateOfBirth: { type: "string", format: "date" },
            phone: { type: "string" },
            email: { type: "string", format: "email" },
          },
        },
        Appointment: {
          type: "object",
          properties: {
            id: { type: "string" },
            patientId: { type: "string" },
            scheduledAt: { type: "string", format: "date-time" },
            reason: { type: "string" },
            status: {
              type: "string",
              enum: ["scheduled", "completed", "cancelled"],
            },
          },
        },
        AppointmentInput: {
          type: "object",
          required: ["patientId", "scheduledAt"],
          properties: {
            patientId: { type: "string" },
            scheduledAt: { type: "string", format: "date-time" },
            reason: { type: "string" },
          },
        },
      },
    },
  },

  apis: [
    path.join(__dirname, "../routes/*.{ts,js}"),
    path.join(__dirname, "../docs/*.{ts,js}"),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
