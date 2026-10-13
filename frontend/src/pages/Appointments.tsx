
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type FormEvent,
} from 'react';

import {
    appointmentsApi,
    type Appointment,
    type AppointmentInput,
    type AppointmentStatus,
} from '../lib/appointments';
import { patientsApi, type Patient } from '../lib/patients';
import { errMsg } from '../lib/api';
import PaginationControls from '../componenets/PaginationControls';

const PAGE_SIZE = 10;

const statusStyles: Record<AppointmentStatus, string> = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    confirmed: 'bg-green-50 text-green-700 ring-green-600/20',
    cancelled: 'bg-red-50 text-red-700 ring-red-600/20',
};

function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

function formatTime(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '—';

    return new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

type AppointmentFormProps = {
    patients: Patient[];
    saving: boolean;
    onSave: (input: AppointmentInput) => Promise<void>;
    onCancel: () => void;
};

function AppointmentForm({
    patients,
    saving,
    onSave,
    onCancel,
}: AppointmentFormProps) {
    const [patientId, setPatientId] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState<AppointmentStatus>('pending');
    const [formError, setFormError] = useState('');

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError('');

        if (!patientId) {
            setFormError('Please select a patient.');
            return;
        }

        const selectedDate = new Date(appointmentDate);

        if (
            !appointmentDate ||
            Number.isNaN(selectedDate.getTime()) ||
            selectedDate.getTime() <= Date.now()
        ) {
            setFormError('Choose a valid appointment date and time in the future.');
            return;
        }

        if (reason.trim().length < 2) {
            setFormError('The reason must contain at least 2 characters.');
            return;
        }

        try {
            await onSave({
                patientId,
                appointmentDate: selectedDate.toISOString(),
                reason: reason.trim(),
                status,
                ...(notes.trim() ? { notes: notes.trim() } : {}),
            });
        } catch (error) {
            setFormError(errMsg(error));
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !saving) {
                    onCancel();
                }
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="appointment-form-title"
                className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            >
                <div className="mb-6">
                    <h2
                        id="appointment-form-title"
                        className="text-xl font-semibold text-gray-900"
                    >
                        New appointment
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Schedule an appointment for an existing patient.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="appointment-patient"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Patient *
                        </label>

                        <select
                            id="appointment-patient"
                            value={patientId}
                            onChange={(event) => setPatientId(event.target.value)}
                            required
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500"
                        >
                            <option value="">Select a patient</option>
                            {patients.map((patient) => (
                                <option key={patient.id} value={patient.id}>
                                    {patient.fullName} — {patient.cin}
                                </option>
                            ))}
                        </select>

                        {patients.length === 0 && (
                            <p className="mt-1 text-xs text-amber-700">
                                No patients are available. Add a patient first.
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="appointment-date"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Date and time *
                        </label>

                        <input
                            id="appointment-date"
                            type="datetime-local"
                            value={appointmentDate}
                            onChange={(event) => setAppointmentDate(event.target.value)}
                            required
                            min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="appointment-reason"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Reason *
                        </label>

                        <input
                            id="appointment-reason"
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            required
                            minLength={2}
                            placeholder="e.g. General checkup"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="appointment-status"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Initial status
                        </label>

                        <select
                            id="appointment-status"
                            value={status}
                            onChange={(event) =>
                                setStatus(event.target.value as AppointmentStatus)
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500"
                        >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="appointment-notes"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Notes
                        </label>

                        <textarea
                            id="appointment-notes"
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            rows={3}
                            placeholder="Optional notes for the appointment"
                            className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
                        />
                    </div>

                    {formError && (
                        <p
                            role="alert"
                            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                        >
                            {formError}
                        </p>
                    )}

                    <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={saving}
                            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving || patients.length === 0}
                            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? 'Creating...' : 'Create appointment'}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default function Appointments() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);

    const [loading, setLoading] = useState(true);
    const [patientsLoading, setPatientsLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [formOpen, setFormOpen] = useState(false);

    const [dateFilter, setDateFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const loadAppointments = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const response = await appointmentsApi.list({
                page,
                limit: PAGE_SIZE,
                ...(dateFilter ? { date: dateFilter } : {}),
                ...(statusFilter
                    ? { status: statusFilter as AppointmentStatus }
                    : {}),
            });

            // Validate the paginated API response.
            if (!response || !Array.isArray(response.data)) {
                throw new Error(
                    'Invalid appointments API response: expected an array in response.data.',
                );
            }

            const responseTotal = Number(response.total);
            const responseTotalPages = Number(response.totalPages);

            if (
                !Number.isFinite(responseTotal) ||
                !Number.isFinite(responseTotalPages) ||
                responseTotal < 0 ||
                responseTotalPages < 0
            ) {
                throw new Error(
                    'The appointments API returned invalid pagination metadata.',
                );
            }

            // Update the table and pagination.
            setAppointments(response.data);
            setTotal(responseTotal);
            setTotalPages(Math.max(1, responseTotalPages));

            // If filtering reduces the number of pages, return to the last valid page.
            if (page > Math.max(1, responseTotalPages)) {
                setPage(Math.max(1, responseTotalPages));
            }
        } catch (error: unknown) {
            console.error('Failed to load appointments:', error);
            setError(errMsg(error));
            setAppointments([]);
            setTotal(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [page, dateFilter, statusFilter]);

    useEffect(() => {
        void loadAppointments();
    }, [loadAppointments]);

    const loadPatients = useCallback(async () => {
        try {
            setPatientsLoading(true);

            const result = await patientsApi.list({ page: 1, limit: 100 });
            setPatients(Array.isArray(result.data) ? result.data : []);
        } catch (error) {
            setError(errMsg(error));
        } finally {
            setPatientsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadPatients();
    }, [loadPatients]);

    const summary = useMemo(() => ({
        total: appointments.length,
        pending: appointments.filter((item) => item.status === 'pending').length,
        confirmed: appointments.filter((item) => item.status === 'confirmed').length,
        cancelled: appointments.filter((item) => item.status === 'cancelled').length,
    }), [appointments]);

    async function handleCreate(input: AppointmentInput) {
        setSaving(true);
        setError('');
        setNotice('');

        try {
            await appointmentsApi.create(input);
            setFormOpen(false);
            setNotice('Appointment created successfully.');

            if (page === 1) {
                await loadAppointments();
            } else {
                setPage(1);
            }
        } catch (error) {
            setError(errMsg(error));
            throw error;
        } finally {
            setSaving(false);
        }
    }

    async function handleStatusChange(
        appointment: Appointment,
        status: AppointmentStatus,
    ) {
        if (appointment.status === status) return;

        setUpdatingId(appointment.id);
        setError('');
        setNotice('');

        try {
            await appointmentsApi.updateStatus(appointment.id, status);
            setNotice('Appointment status updated successfully.');
            await loadAppointments();
        } catch (error) {
            setError(errMsg(error));
        } finally {
            setUpdatingId(null);
        }
    }

    function handleDateFilterChange(value: string) {
        setDateFilter(value);
        setPage(1);
    }

    function handleStatusFilterChange(value: string) {
        setStatusFilter(value);
        setPage(1);
    }

    function clearFilters() {
        setDateFilter('');
        setStatusFilter('');
        setPage(1);
    }

    return (
        <main className="space-y-6">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Schedule visits and manage appointment statuses.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setError('');
                        setNotice('');
                        setFormOpen(true);
                    }}
                    className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                    + New appointment
                </button>
            </header>

            {notice && (
                <div role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                    {notice}
                </div>
            )}

            {error && (
                <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => {
                            void loadAppointments();
                            void loadPatients();
                        }}
                        className="shrink-0 font-medium underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                    { label: 'On this page', value: summary.total, style: 'text-gray-900' },
                    { label: 'Pending on page', value: summary.pending, style: 'text-amber-700' },
                    { label: 'Confirmed on page', value: summary.confirmed, style: 'text-green-700' },
                    { label: 'Cancelled on page', value: summary.cancelled, style: 'text-red-700' },
                ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <p className="text-sm text-gray-500">{item.label}</p>
                        <p className={`mt-2 text-2xl font-semibold ${item.style}`}>{item.value}</p>
                    </div>
                ))}
            </section>

            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="p-4 sm:p-6">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="font-semibold text-gray-900">Appointment schedule</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Filter and update scheduled appointments.
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                            <div>
                                <label htmlFor="filter-date" className="mb-1 block text-xs font-medium text-gray-500">Date</label>
                                <input
                                    id="filter-date"
                                    type="date"
                                    value={dateFilter}
                                    onChange={(event) => handleDateFilterChange(event.target.value)}
                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="filter-status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
                                <select
                                    id="filter-status"
                                    value={statusFilter}
                                    onChange={(event) => handleStatusFilterChange(event.target.value)}
                                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                                >
                                    <option value="">All statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <button
                                type="button"
                                onClick={clearFilters}
                                disabled={!dateFilter && !statusFilter}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Clear filters
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-12 text-center text-sm text-gray-500" role="status">
                            Loading appointments...
                        </div>
                    ) : appointments.length === 0 ? (
                        <div className="py-12 text-center">
                            <h3 className="font-medium text-gray-900">No appointments found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Try changing your filters or create a new appointment.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[850px] text-left text-sm">
                                <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
                                    <tr>
                                        <th scope="col" className="px-3 py-3 font-medium">Patient</th>
                                        <th scope="col" className="px-3 py-3 font-medium">Date</th>
                                        <th scope="col" className="px-3 py-3 font-medium">Time</th>
                                        <th scope="col" className="px-3 py-3 font-medium">Reason</th>
                                        <th scope="col" className="px-3 py-3 font-medium">Status</th>
                                        <th scope="col" className="px-3 py-3 font-medium">Update status</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {appointments.map((appointment) => (
                                        <tr key={appointment.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-4">
                                                <p className="font-medium text-gray-900">{appointment.patientName}</p>
                                                <p className="mt-0.5 text-xs text-gray-500">
                                                    {appointment.notes || 'No additional notes'}
                                                </p>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-gray-600">
                                                {formatDate(appointment.appointmentDate)}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-gray-600">
                                                {formatTime(appointment.appointmentDate)}
                                            </td>
                                            <td className="px-3 py-4 text-gray-600">{appointment.reason}</td>
                                            <td className="px-3 py-4">
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${statusStyles[appointment.status]}`}>
                                                    {appointment.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-4">
                                                <select
                                                    aria-label={`Update status for ${appointment.patientName}`}
                                                    value={appointment.status}
                                                    disabled={updatingId === appointment.id}
                                                    onChange={(event) => void handleStatusChange(appointment, event.target.value as AppointmentStatus)}
                                                    className="rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm outline-none focus:border-blue-500 disabled:opacity-50"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="confirmed">Confirmed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {!loading && (
                    <PaginationControls
                        page={page}
                        totalPages={totalPages}
                        total={total}
                        limit={PAGE_SIZE}
                        loading={loading}
                        onPageChange={setPage}
                    />
                )}
            </section>

            {formOpen && (
                <AppointmentForm
                    patients={patients}
                    saving={saving}
                    onSave={handleCreate}
                    onCancel={() => {
                        if (!saving) setFormOpen(false);
                    }}
                />
            )}

            {patientsLoading && (
                <span className="sr-only" role="status">
                    Loading patients for the appointment form...
                </span>
            )}
        </main>
    );
}
