
import { api } from './api';
import type { PaginationParams } from './pagination';

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled';

export interface PaginatedAppointments {
  data: Appointment[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Appointment {
    id: string;
    patientId: string;
    patientName: string;
    appointmentDate: string;
    status: AppointmentStatus;
    reason: string;
    notes?: string;
}

export interface AppointmentInput {
    patientId: string;
    appointmentDate: string;
    status?: AppointmentStatus;
    reason: string;
    notes?: string;
}


interface AppointmentFilters extends PaginationParams {
    date?: string;
    status?: 'pending' | 'confirmed' | 'cancelled';
    patientId?: string;
}

function normalizeAppointment(value: unknown): Appointment {
    if (!value || typeof value !== 'object') {
        throw new Error('Invalid appointment returned by the API.');
    }

    const item = value as Record<string, unknown>;
    const patient = item.patient as Record<string, unknown> | undefined;

    const id = item.id;
    const patientId = item.patientId ?? item.patient_id;
    const appointmentDate = item.appointmentDate ?? item.appointment_date;
    const rawStatus = item.status;
    const reason = item.reason;

    if (
        typeof id !== 'string' ||
        typeof patientId !== 'string' ||
        typeof appointmentDate !== 'string' ||
        typeof reason !== 'string' ||
        !['pending', 'confirmed', 'cancelled'].includes(String(rawStatus))
    ) {
        throw new Error('The appointment API response has an unexpected shape.');
    }

    const patientName =
        item.patientName ??
        item.patient_name ??
        item.fullName ??
        item.full_name ??
        patient?.fullName ??
        patient?.full_name ??
        patient?.name;

    return {
        id,
        patientId,
        patientName:
            typeof patientName === 'string' ? patientName : 'Unknown patient',
        appointmentDate,
        status: rawStatus as AppointmentStatus,
        reason,
        notes:
            typeof item.notes === 'string' ? item.notes : undefined,
    };
}

export const appointmentsApi = {
    list: async (
        filters: AppointmentFilters = {}
    ): Promise<PaginatedAppointments> => {
        const { data } = await api.get<unknown>('/appointments', {
            params: filters,
        });

        if (!data || typeof data !== 'object') {
            throw new Error('Unexpected appointments list response from the API.');
        }

        const response = data as Record<string, unknown>;

        if (!Array.isArray(response.data)) {
            throw new Error('Invalid appointments data in API response.');
        }

        const records = response.data.map(normalizeAppointment);

        const page = Number(response.page);
        const limit = Number(response.limit);
        const total = Number(response.total);
        const totalPages = Number(response.totalPages);

        if (
            !Number.isFinite(page) ||
            !Number.isFinite(limit) ||
            !Number.isFinite(total) ||
            !Number.isFinite(totalPages)
        ) {
            throw new Error('Invalid pagination metadata from the API.');
        }

        return {
            data: records,
            page,
            limit,
            total,
            totalPages,
        };
    },

    create: async (input: AppointmentInput): Promise<void> => {
        await api.post('/appointments', input);
    },

    updateStatus: async (
        id: string,
        status: AppointmentStatus,
    ): Promise<void> => {
        await api.patch(`/appointments/${id}/status`, { status });
    },
};
