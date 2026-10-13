export interface User { id: string; email: string; fullName: string; role: 'admin' | 'staff'; }

export interface Patient {
  id: string; fullName: string; cin: string; phone: string;
  birthDate: string; address: string | null; createdAt: string;
}

export type Status = 'pending' | 'confirmed' | 'cancelled';

export interface Appointment {
  id: string; patientId: string; patientName: string; appointmentDate: string;
  status: Status; reason: string; notes: string | null;
}

export interface Paginated<T> { data: T[]; page: number; limit: number; total: number; totalPages: number; }