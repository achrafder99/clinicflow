import { api } from './api';

export type UserRole = 'admin' | 'staff';

export type NewUserInput = {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
};

export const usersApi = {
    async register(input: NewUserInput) {
        const { data } = await api.post('/auth/register', input);
        return data.user as { id: string; email: string; fullName: string; role: UserRole };
    },
};