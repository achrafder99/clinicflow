
import { api } from './api';
import type { PaginatedResponse, PaginationParams } from './pagination';

interface PatientFilters extends PaginationParams {
  search?: string;
}

export interface Patient {
    id: string;
    fullName: string;
    cin: string;
    phone: string;
    birthDate: string;
    address?: string;
}

export interface PatientInput {
    fullName: string;
    cin: string;
    phone: string;
    birthDate: string;
    address?: string;
}

export interface PaginatedPatients {
    data: Patient[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export const patientsApi = {
    async list(
        filters: PatientFilters = {},
    ): Promise<PaginatedResponse<Patient>> {
        const response = await api.get('/patients', {
            params: {
                page: filters.page ?? 1,
                limit: filters.limit ?? 10,
                search: filters.search?.trim() || undefined,
            },
        });

        return response.data;
    },

    getById: async (id: string): Promise<Patient> => {
        const { data } = await api.get<Patient>(`/patients/${id}`);
        return data;
    },

    create: async (input: PatientInput): Promise<Patient> => {
        const { data } = await api.post<Patient>('/patients', input);
        return data;
    },

    update: async (
        id: string,
        input: Partial<PatientInput>,
    ): Promise<Patient> => {
        const { data } = await api.put<Patient>(`/patients/${id}`, input);
        return data;
    },

    remove: async (id: string): Promise<void> => {
        await api.delete(`/patients/${id}`);
    },
};
