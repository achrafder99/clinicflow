import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type FormEvent,
    type SVGProps,
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

/* ---------- Icons (inline, no extra dependency) ---------- */

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...props}
        >
            {children}
        </svg>
    );
}

const PlusIcon = (props: IconProps) => (
    <Icon {...props}>
        <path d="M12 5v14M5 12h14" />
    </Icon>
);

const XIcon = (props: IconProps) => (
    <Icon {...props}>
        <path d="M6 6l12 12M18 6 6 18" />
    </Icon>
);

const RefreshIcon = (props: IconProps) => (
    <Icon {...props}>
        <path d="M20 11a8 8 0 0 0-14.3-4.5L4 8.5" />
        <path d="M4 4v4.5h4.5" />
        <path d="M4 13a8 8 0 0 0 14.3 4.5l1.7-2" />
        <path d="M20 20v-4.5h-4.5" />
    </Icon>
);

const CalendarIcon = (props: IconProps) => (
    <Icon {...props}>
        <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
        <path d="M3.5 10h17" />
        <path d="M8 3v4M16 3v4" />
    </Icon>
);

const ChevronDownIcon = (props: IconProps) => (
    <Icon {...props}>
        <path d="m6 9 6 6 6-6" />
    </Icon>
);

/* ---------- Shared class names ---------- */

const inputBox =
    'w-full rounded-md border border-zinc-300 bg-white text-xs text-zinc-900 shadow-sm outline-none transition-colors placeholder:text-zinc-400 hover:border-zinc-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/25 disabled:cursor-not-allowed disabled:opacity-50';

const inputBase = `${inputBox} px-3`;

// Native select with the browser arrow removed; pair it with <SelectChevron />.
// text-ellipsis keeps long labels from being hard-clipped.
const selectBase = `${inputBox} appearance-none cursor-pointer truncate pl-2.5 pr-7`;

const iconButtonBase =
    'inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40';

function SelectChevron() {
    return (
        <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
    );
}

/* ---------- Status styles ---------- */

const statusStyles: Record<AppointmentStatus, string> = {
    pending: 'bg-amber-50 text-amber-800 ring-amber-600/20',
    confirmed: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
    cancelled: 'bg-red-50 text-red-800 ring-red-600/20',
};

const statusDots: Record<AppointmentStatus, string> = {
    pending: 'bg-amber-500',
    confirmed: 'bg-emerald-500',
    cancelled: 'bg-red-500',
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

/* ---------- Form ---------- */

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
            className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-900/30 p-0 backdrop-blur-md backdrop-saturate-150 sm:items-center sm:p-4"
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
                className="max-h-[92vh] w-full max-w-[480px] overflow-y-auto rounded-t-2xl bg-white shadow-2xl shadow-zinc-950/20 ring-1 ring-zinc-950/5 sm:rounded-2xl"
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-6 pb-4 pt-5">
                    <div className="flex items-start gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-700/10">
                            <CalendarIcon className="size-[18px]" />
                        </div>
                        <div>
                            <h2
                                id="appointment-form-title"
                                className="text-sm font-semibold leading-tight text-zinc-900"
                            >
                                New appointment
                            </h2>
                            <p className="mt-1 text-xs leading-snug text-zinc-500">
                                Schedule an appointment for an existing patient.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={saving}
                        aria-label="Close form"
                        className={`${iconButtonBase} -mr-2 -mt-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700`}
                    >
                        <XIcon className="size-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Fields */}
                    <div className="space-y-4 px-6 py-5">
                        <div>
                            <label
                                htmlFor="appointment-patient"
                                className="mb-1.5 block text-xs font-medium text-zinc-700"
                            >
                                Patient <span className="text-zinc-400">*</span>
                            </label>

                            <div className="relative">
                                <select
                                    id="appointment-patient"
                                    value={patientId}
                                    onChange={(event) => setPatientId(event.target.value)}
                                    required
                                    className={`${selectBase} h-9`}
                                >
                                    <option value="">Select a patient</option>
                                    {patients.map((patient) => (
                                        <option key={patient.id} value={patient.id}>
                                            {patient.fullName} — {patient.cin}
                                        </option>
                                    ))}
                                </select>
                                <SelectChevron />
                            </div>

                            {patients.length === 0 && (
                                <p className="mt-1.5 text-[11px] text-amber-700">
                                    No patients are available. Add a patient first.
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="appointment-date"
                                className="mb-1.5 block text-xs font-medium text-zinc-700"
                            >
                                Date and time <span className="text-zinc-400">*</span>
                            </label>

                            <input
                                id="appointment-date"
                                type="datetime-local"
                                value={appointmentDate}
                                onChange={(event) => setAppointmentDate(event.target.value)}
                                required
                                min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)}
                                className={`${inputBase} h-9 min-w-0 cursor-pointer tabular-nums [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="appointment-status"
                                className="mb-1.5 block text-xs font-medium text-zinc-700"
                            >
                                Initial status
                            </label>

                            <div className="relative">
                                <select
                                    id="appointment-status"
                                    value={status}
                                    onChange={(event) =>
                                        setStatus(event.target.value as AppointmentStatus)
                                    }
                                    className={`${selectBase} h-9`}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <SelectChevron />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="appointment-reason"
                                className="mb-1.5 block text-xs font-medium text-zinc-700"
                            >
                                Reason <span className="text-zinc-400">*</span>
                            </label>

                            <input
                                id="appointment-reason"
                                value={reason}
                                onChange={(event) => setReason(event.target.value)}
                                required
                                minLength={2}
                                placeholder="e.g. General checkup"
                                className={`${inputBase} h-9`}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="appointment-notes"
                                className="mb-1.5 flex items-baseline justify-between text-xs font-medium text-zinc-700"
                            >
                                Notes
                                <span className="text-[11px] font-normal text-zinc-400">
                                    Optional
                                </span>
                            </label>

                            <textarea
                                id="appointment-notes"
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                                rows={3}
                                placeholder="Anything the clinic should know beforehand"
                                className={`${inputBase} resize-y py-2`}
                            />
                        </div>

                        {formError && (
                            <p
                                role="alert"
                                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
                            >
                                {formError}
                            </p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between gap-3 border-t border-zinc-100 bg-zinc-50/80 px-6 py-3.5">
                        <p className="hidden text-[11px] text-zinc-400 sm:block">
                            * Required
                        </p>

                        <div className="ml-auto flex gap-2">
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={saving}
                                className="h-8 cursor-pointer rounded-md border border-zinc-300 bg-white px-3 text-xs font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 active:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving || patients.length === 0}
                                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md bg-teal-700 px-3.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-teal-800 active:bg-teal-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving && (
                                    <RefreshIcon className="size-3.5 animate-spin" />
                                )}
                                {saving ? 'Creating...' : 'Create appointment'}
                            </button>
                        </div>
                    </div>
                </form>
            </section>
        </div>
    );
}

/* ---------- Page ---------- */

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

    const hasFilters = Boolean(dateFilter || statusFilter);

    return (
        <main className="space-y-4">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-lg font-semibold tracking-tight text-zinc-900">
                        Appointments
                    </h1>
                    <p className="mt-1 text-xs text-zinc-500">
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
                    className="inline-flex h-8 cursor-pointer items-center gap-1.5 self-start rounded-md bg-teal-700 pl-2.5 pr-3.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-teal-800 active:bg-teal-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 sm:self-auto"
                >
                    <PlusIcon className="size-4" />
                    New appointment
                </button>
            </header>

            {notice && (
                <div
                    role="status"
                    className="flex items-center justify-between gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800"
                >
                    <span>{notice}</span>
                    <button
                        type="button"
                        onClick={() => setNotice('')}
                        aria-label="Dismiss notification"
                        className="shrink-0 cursor-pointer rounded text-[11px] font-medium text-emerald-700 transition-colors hover:text-emerald-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {error && (
                <div
                    role="alert"
                    className="flex items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800"
                >
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => {
                            void loadAppointments();
                            void loadPatients();
                        }}
                        className="shrink-0 cursor-pointer rounded text-[11px] font-medium underline underline-offset-2 transition-colors hover:text-red-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Summary */}
            <section
                aria-label="Appointment summary"
                className="grid grid-cols-2 gap-3 lg:grid-cols-4"
            >
                {[
                    { label: 'On this page', value: summary.total, dot: 'bg-zinc-400' },
                    { label: 'Pending', value: summary.pending, dot: statusDots.pending },
                    { label: 'Confirmed', value: summary.confirmed, dot: statusDots.confirmed },
                    { label: 'Cancelled', value: summary.cancelled, dot: statusDots.cancelled },
                ].map((item) => (
                    <div
                        key={item.label}
                        className="rounded-lg border border-zinc-200 bg-white px-4 py-3"
                    >
                        <div className="flex items-center gap-2">
                            <span className={`size-1.5 rounded-full ${item.dot}`} />
                            <p className="text-[11px] font-medium text-zinc-500">
                                {item.label}
                            </p>
                        </div>
                        <p className="mt-1.5 text-xl font-semibold tabular-nums tracking-tight text-zinc-900">
                            {item.value}
                        </p>
                    </div>
                ))}
            </section>

            {/* Schedule */}
            <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
                <div className="flex flex-col gap-3 border-b border-zinc-200 px-4 py-3 lg:flex-row lg:items-end lg:justify-between">
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-xs font-semibold text-zinc-900">
                            Appointment schedule
                        </h2>
                        <p className="text-[11px] tabular-nums text-zinc-500">
                            {hasFilters
                                ? `${total} matching appointments`
                                : `${total} appointments`}
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                        <div>
                            <label
                                htmlFor="filter-date"
                                className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-500"
                            >
                                Date
                            </label>
                            <input
                                id="filter-date"
                                type="date"
                                value={dateFilter}
                                onChange={(event) =>
                                    handleDateFilterChange(event.target.value)
                                }
                                className={`${inputBase} h-8 cursor-pointer tabular-nums shadow-none sm:w-40`}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="filter-status"
                                className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-500"
                            >
                                Status
                            </label>
                            <div className="relative">
                                <select
                                    id="filter-status"
                                    value={statusFilter}
                                    onChange={(event) =>
                                        handleStatusFilterChange(event.target.value)
                                    }
                                    className={`${selectBase} h-8 shadow-none sm:w-44`}
                                >
                                    <option value="">All statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <SelectChevron />
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={clearFilters}
                            disabled={!hasFilters}
                            className="inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 active:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <XIcon className="size-3.5" />
                            Clear
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div
                        className="divide-y divide-zinc-100"
                        role="status"
                        aria-label="Loading appointments"
                    >
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 px-4 py-3"
                            >
                                <div className="size-8 animate-pulse rounded-md bg-zinc-100" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-3 w-40 animate-pulse rounded bg-zinc-100" />
                                    <div className="h-2.5 w-24 animate-pulse rounded bg-zinc-100" />
                                </div>
                                <div className="hidden h-3 w-20 animate-pulse rounded bg-zinc-100 sm:block" />
                                <div className="hidden h-5 w-20 animate-pulse rounded-full bg-zinc-100 sm:block" />
                            </div>
                        ))}
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="px-4 py-16 text-center">
                        <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-400">
                            <CalendarIcon className="size-5" />
                        </div>
                        <h3 className="text-xs font-medium text-zinc-900">
                            No appointments found
                        </h3>
                        <p className="mx-auto mt-1 max-w-xs text-xs text-zinc-500">
                            Try changing your filters or create a new appointment.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[880px] text-left text-xs">
                            <thead className="border-b border-zinc-200 bg-zinc-50/70 text-[10px] uppercase tracking-wider text-zinc-500">
                                <tr>
                                    <th scope="col" className="px-4 py-2 font-medium">Patient</th>
                                    <th scope="col" className="px-4 py-2 font-medium">Date</th>
                                    <th scope="col" className="px-4 py-2 font-medium">Time</th>
                                    <th scope="col" className="px-4 py-2 font-medium">Reason</th>
                                    <th scope="col" className="px-4 py-2 font-medium">Status</th>
                                    <th scope="col" className="w-44 px-4 py-2 font-medium">
                                        Update status
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-zinc-100">
                                {appointments.map((appointment) => (
                                    <tr
                                        key={appointment.id}
                                        className="transition-colors hover:bg-zinc-50/80"
                                    >
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-teal-50 text-[10px] font-semibold tracking-wide text-teal-800 ring-1 ring-inset ring-teal-700/10">
                                                    {String(appointment.patientName ?? '')
                                                        .split(/\s+/)
                                                        .filter(Boolean)
                                                        .slice(0, 2)
                                                        .map((part) => part[0])
                                                        .join('')
                                                        .toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-zinc-900">
                                                        {appointment.patientName}
                                                    </p>
                                                    <p className="max-w-56 truncate text-[11px] text-zinc-500">
                                                        {appointment.notes || 'No additional notes'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-2.5 tabular-nums text-zinc-600">
                                            {formatDate(appointment.appointmentDate)}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-2.5 tabular-nums text-zinc-600">
                                            {formatTime(appointment.appointmentDate)}
                                        </td>
                                        <td className="px-4 py-2.5 text-zinc-700">
                                            {appointment.reason}
                                        </td>

                                        <td className="px-4 py-2.5">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ring-1 ring-inset ${statusStyles[appointment.status]}`}
                                            >
                                                <span
                                                    className={`size-1.5 rounded-full ${statusDots[appointment.status]}`}
                                                />
                                                {appointment.status}
                                            </span>
                                        </td>

                                        <td className="px-4 py-2.5">
                                            <div className="relative w-36">
                                                <select
                                                    aria-label={`Update status for ${appointment.patientName}`}
                                                    value={appointment.status}
                                                    disabled={updatingId === appointment.id}
                                                    onChange={(event) =>
                                                        void handleStatusChange(
                                                            appointment,
                                                            event.target.value as AppointmentStatus,
                                                        )
                                                    }
                                                    className={`${selectBase} h-8 shadow-none`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="confirmed">Confirmed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                                <SelectChevron />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && (
                    <div className="border-t border-zinc-200 px-4 py-3">
                        <PaginationControls
                            page={page}
                            totalPages={totalPages}
                            total={total}
                            limit={PAGE_SIZE}
                            loading={loading}
                            onPageChange={setPage}
                        />
                    </div>
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