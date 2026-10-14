import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type FormEvent,
    type SVGProps,
} from 'react';
import {
    patientsApi,
    type Patient,
    type PatientInput,
} from '../lib/patients';
import { errMsg } from '../lib/api';
import PaginationControls from '../componenets/PaginationControls';
import ConfirmDialog from '../componenets/ConfirmDialog';

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

const PencilIcon = (props: IconProps) => (
    <Icon {...props}>
        <path d="M16.9 3.6a2.1 2.1 0 0 1 3 3L8 18.5 3.5 20 5 15.5 16.9 3.6Z" />
        <path d="m14.5 6 3.5 3.5" />
    </Icon>
);

const TrashIcon = (props: IconProps) => (
    <Icon {...props}>
        <path d="M4 7h16" />
        <path d="M10 11v6M14 11v6" />
        <path d="M6 7l1 12.1a2 2 0 0 0 2 1.9h6a2 2 0 0 0 2-1.9L18 7" />
        <path d="M9 7V4.5A.5.5 0 0 1 9.5 4h5a.5.5 0 0 1 .5.5V7" />
    </Icon>
);

const XIcon = (props: IconProps) => (
    <Icon {...props}>
        <path d="M6 6l12 12M18 6 6 18" />
    </Icon>
);

const PlusIcon = (props: IconProps) => (
    <Icon {...props}>
        <path d="M12 5v14M5 12h14" />
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

const UsersIcon = (props: IconProps) => (
    <Icon {...props}>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
        <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8" />
        <path d="M18 14.2a6.5 6.5 0 0 1 3.5 5.8" />
    </Icon>
);

const LockIcon = (props: IconProps) => (
    <Icon {...props}>
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </Icon>
);

/* ---------- Shared class names ---------- */

// No horizontal padding here, so each usage sets its own and nothing conflicts.
const inputBox =
    'w-full rounded-md border border-zinc-300 bg-white text-[13px] text-zinc-900 shadow-sm outline-none transition-colors placeholder:text-zinc-400 hover:border-zinc-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/25';

const inputBase = `${inputBox} px-3`;

const iconButtonBase =
    'inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40';

/* ---------- Form ---------- */

type PatientFormProps = {
    patient: Patient | null;
    saving: boolean;
    onSave: (input: PatientInput) => Promise<void>;
    onCancel: () => void;
};

function PatientForm({
    patient,
    saving,
    onSave,
    onCancel,
}: PatientFormProps) {
    const [fullName, setFullName] = useState(patient?.fullName ?? '');
    const [cin, setCin] = useState(patient?.cin ?? '');
    const [phone, setPhone] = useState(patient?.phone ?? '');
    const [birthDate, setBirthDate] = useState(
        patient?.birthDate?.slice(0, 10) ?? '',
    );
    const [address, setAddress] = useState(patient?.address ?? '');
    const [formError, setFormError] = useState('');

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError('');

        try {
            await onSave({
                fullName: fullName.trim(),
                cin: cin.trim().toUpperCase(),
                phone: phone.trim(),
                birthDate,
                ...(address.trim() ? { address: address.trim() } : {}),
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
                aria-labelledby="patient-form-title"
                className="max-h-[92vh] w-full max-w-[480px] overflow-y-auto rounded-t-2xl bg-white shadow-2xl shadow-zinc-950/20 ring-1 ring-zinc-950/5 sm:rounded-2xl"
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-6 pb-4 pt-5">
                    <div className="flex items-start gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-700/10">
                            {patient ? (
                                <PencilIcon className="size-[18px]" />
                            ) : (
                                <PlusIcon className="size-[18px]" />
                            )}
                        </div>
                        <div>
                            <h2
                                id="patient-form-title"
                                className="text-[15px] font-semibold leading-tight text-zinc-900"
                            >
                                {patient ? 'Edit patient' : 'Add patient'}
                            </h2>
                            <p className="mt-1 text-[13px] leading-snug text-zinc-500">
                                {patient
                                    ? 'Update the patient information below.'
                                    : 'Enter the information for the new patient.'}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={saving}
                        aria-label="Close form"
                        className={`${iconButtonBase} -mr-2 -mt-1 size-8 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700`}
                    >
                        <XIcon className="size-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Fields */}
                    <div className="space-y-4 px-6 py-5">
                        <div>
                            <label
                                htmlFor="fullName"
                                className="mb-1.5 block text-[13px] font-medium text-zinc-700"
                            >
                                Full name <span className="text-zinc-400">*</span>
                            </label>
                            <input
                                id="fullName"
                                value={fullName}
                                onChange={(event) => setFullName(event.target.value)}
                                required
                                minLength={2}
                                autoFocus
                                className={`${inputBase} h-9`}
                                placeholder="e.g. Salma Tazi"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="cin"
                                    className="mb-1.5 block text-[13px] font-medium text-zinc-700"
                                >
                                    CIN <span className="text-zinc-400">*</span>
                                </label>
                                <input
                                    id="cin"
                                    value={cin}
                                    onChange={(event) =>
                                        setCin(event.target.value.toUpperCase())
                                    }
                                    required
                                    minLength={4}
                                    className={`${inputBase} h-9 font-mono uppercase tracking-wide placeholder:font-sans placeholder:normal-case placeholder:tracking-normal`}
                                    placeholder="e.g. AB123456"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="phone"
                                    className="mb-1.5 block text-[13px] font-medium text-zinc-700"
                                >
                                    Phone <span className="text-zinc-400">*</span>
                                </label>
                                <input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(event) => setPhone(event.target.value)}
                                    required
                                    minLength={6}
                                    className={`${inputBase} h-9 tabular-nums`}
                                    placeholder="e.g. 0612345678"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="birthDate"
                                className="mb-1.5 block text-[13px] font-medium text-zinc-700"
                            >
                                Birth date <span className="text-zinc-400">*</span>
                            </label>
                            <input
                                id="birthDate"
                                type="date"
                                value={birthDate}
                                max={new Date().toISOString().slice(0, 10)}
                                onChange={(event) => setBirthDate(event.target.value)}
                                required
                                className={`${inputBase} h-9 cursor-pointer tabular-nums`}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="address"
                                className="mb-1.5 flex items-baseline justify-between text-[13px] font-medium text-zinc-700"
                            >
                                Address
                                <span className="text-xs font-normal text-zinc-400">
                                    Optional
                                </span>
                            </label>
                            <textarea
                                id="address"
                                value={address}
                                onChange={(event) => setAddress(event.target.value)}
                                rows={2}
                                className={`${inputBase} resize-y py-2`}
                                placeholder="Street, city"
                            />
                        </div>

                        {formError && (
                            <p
                                role="alert"
                                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700"
                            >
                                {formError}
                            </p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between gap-3 border-t border-zinc-100 bg-zinc-50/80 px-6 py-3.5">
                        <p className="hidden text-xs text-zinc-400 sm:block">
                            <span className="text-zinc-400">*</span> Required
                        </p>

                        <div className="ml-auto flex gap-2">
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={saving}
                                className="h-8 cursor-pointer rounded-md border border-zinc-300 bg-white px-3 text-[13px] font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 active:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md bg-teal-700 px-3.5 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-teal-800 active:bg-teal-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving && (
                                    <RefreshIcon className="size-3.5 animate-spin" />
                                )}
                                {saving
                                    ? 'Saving...'
                                    : patient
                                      ? 'Save changes'
                                      : 'Create patient'}
                            </button>
                        </div>
                    </div>
                </form>
            </section>
        </div>
    );
}

/* ---------- Page ---------- */

type PatientsProps = {
    // Staff accounts are read/edit only. Wire this to your auth state.
    role?: 'admin' | 'staff' | (string & {});
};

export default function Patients({ role }: PatientsProps) {
    const canDelete = role !== 'staff';

    const [patients, setPatients] = useState<Patient[]>([]);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    // Prevent an outdated request from overwriting newer search results.
    const requestIdRef = useRef(0);

    // Debounce search by 300 ms.
    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setDebouncedSearch(search.trim());
            setPage(1);
        }, 300);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [search]);

    const loadPatients = useCallback(async () => {
        const requestId = ++requestIdRef.current;

        setLoading(true);
        setError('');

        try {
            const result = await patientsApi.list({
                page,
                limit,
                search: debouncedSearch,
            });

            // Ignore results from an older request.
            if (requestId !== requestIdRef.current) {
                return;
            }

            setPatients(result.data);
            setTotal(result.total);
            setTotalPages(Math.max(1, result.totalPages));

            // If the current page no longer exists, move to a valid page.
            if (page > Math.max(1, result.totalPages)) {
                setPage(Math.max(1, result.totalPages));
            }
        } catch (error: unknown) {
            if (requestId !== requestIdRef.current) {
                return;
            }

            console.error('Failed to load patients:', error);
            setError(errMsg(error));
            setPatients([]);
            setTotal(0);
            setTotalPages(1);
        } finally {
            if (requestId === requestIdRef.current) {
                setLoading(false);
            }
        }
    }, [page, limit, debouncedSearch]);

    useEffect(() => {
        void loadPatients();

        return () => {
            // Invalidate pending requests when dependencies change or unmount.
            requestIdRef.current += 1;
        };
    }, [loadPatients]);

    function openCreateForm() {
        setEditingPatient(null);
        setError('');
        setNotice('');
        setFormOpen(true);
    }

    function openEditForm(patient: Patient) {
        setEditingPatient(patient);
        setError('');
        setNotice('');
        setFormOpen(true);
    }

    async function handleSave(input: PatientInput) {
        setSaving(true);
        setError('');
        setNotice('');

        try {
            if (editingPatient) {
                await patientsApi.update(editingPatient.id, input);
                setNotice('Patient updated successfully.');
            } else {
                await patientsApi.create(input);
                setNotice('Patient created successfully.');
                setPage(1);
            }

            setFormOpen(false);
            setEditingPatient(null);

            // Refresh using the latest search and page.
            await loadPatients();
        } finally {
            setSaving(false);
        }
    }

    function askDelete(patient: Patient) {
        // Defensive guard: the button is disabled for staff,
        // but never rely on the UI alone.
        if (!canDelete) return;

        setError('');
        setNotice('');
        setPatientToDelete(patient);
    }

    async function confirmDelete() {
        if (!patientToDelete || !canDelete) return;

        const patient = patientToDelete;
        setDeletingId(patient.id);

        try {
            await patientsApi.remove(patient.id);
            setNotice('Patient deleted successfully.');

            // Reload to keep pagination totals and page contents accurate.
            if (patients.length === 1 && page > 1) {
                setPage((current) => current - 1);
            } else {
                await loadPatients();
            }
        } catch (error) {
            setError(errMsg(error));
        } finally {
            setDeletingId(null);
            setPatientToDelete(null);
        }
    }

    return (
        <main className="space-y-4">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
                        Patients
                    </h1>
                    <p className="mt-1 text-[13px] text-zinc-500">
                        Manage your clinic&apos;s patient records.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateForm}
                    className="inline-flex h-8 cursor-pointer items-center gap-1.5 self-start rounded-md bg-teal-700 pl-2.5 pr-3.5 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-teal-800 active:bg-teal-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 sm:self-auto"
                >
                    <PlusIcon className="size-4" />
                    Add patient
                </button>
            </header>

            {notice && (
                <div
                    role="status"
                    className="flex items-center justify-between gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-800"
                >
                    <span>{notice}</span>
                    <button
                        type="button"
                        onClick={() => setNotice('')}
                        aria-label="Dismiss notification"
                        className="shrink-0 cursor-pointer rounded text-xs font-medium text-emerald-700 transition-colors hover:text-emerald-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {error && (
                <div
                    role="alert"
                    className="flex items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-800"
                >
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => void loadPatients()}
                        disabled={loading}
                        className="shrink-0 cursor-pointer rounded text-xs font-medium underline underline-offset-2 transition-colors hover:text-red-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Retry
                    </button>
                </div>
            )}

            <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
                <div className="flex flex-col gap-3 border-b border-zinc-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-[13px] font-semibold text-zinc-900">
                            All patients
                        </h2>
                        <p className="text-xs tabular-nums text-zinc-500">
                            {debouncedSearch
                                ? `${total} matching patients`
                                : `${total} patient records`}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 sm:flex-none">
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search name, CIN, or phone..."
                                aria-label="Search patients"
                                className={`${inputBox} h-8 pl-9 pr-3 shadow-none sm:w-72`}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => void loadPatients()}
                            disabled={loading}
                            aria-label="Refresh list"
                            title="Refresh"
                            className={`${iconButtonBase} border border-zinc-300 bg-white hover:bg-zinc-50 hover:text-zinc-800 active:bg-zinc-100`}
                        >
                            <RefreshIcon
                                className={`size-4 ${loading ? 'animate-spin' : ''}`}
                            />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div
                        className="divide-y divide-zinc-100"
                        role="status"
                        aria-label="Loading patients"
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
                                <div className="hidden h-3 w-24 animate-pulse rounded bg-zinc-100 sm:block" />
                            </div>
                        ))}
                    </div>
                ) : patients.length === 0 ? (
                    <div className="px-4 py-16 text-center">
                        <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-400">
                            <UsersIcon className="size-5" />
                        </div>
                        <h3 className="text-[13px] font-medium text-zinc-900">
                            {debouncedSearch
                                ? 'No matching patients'
                                : 'No patients found'}
                        </h3>
                        <p className="mx-auto mt-1 max-w-xs text-[13px] text-zinc-500">
                            {debouncedSearch
                                ? 'Try a different name, CIN, or phone number.'
                                : 'Add your first patient to get started.'}
                        </p>

                        {!debouncedSearch && (
                            <button
                                type="button"
                                onClick={openCreateForm}
                                className="mt-4 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md bg-teal-700 pl-2.5 pr-3.5 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-teal-800 active:bg-teal-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
                            >
                                <PlusIcon className="size-4" />
                                Add patient
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto [&>:last-child]:border-t [&>:last-child]:border-zinc-200 [&>:last-child]:px-4 [&>:last-child]:py-3">
                        <table className="w-full min-w-[680px] text-left text-[13px]">
                            <thead className="border-b border-zinc-200 bg-zinc-50/70 text-[11px] uppercase tracking-wider text-zinc-500">
                                <tr>
                                    <th scope="col" className="px-4 py-2 font-medium">
                                        Patient
                                    </th>
                                    <th scope="col" className="px-4 py-2 font-medium">
                                        CIN
                                    </th>
                                    <th scope="col" className="px-4 py-2 font-medium">
                                        Phone
                                    </th>
                                    <th scope="col" className="px-4 py-2 font-medium">
                                        Birth date
                                    </th>
                                    <th
                                        scope="col"
                                        className="w-24 px-4 py-2 text-right font-medium"
                                    >
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-zinc-100">
                                {patients.map((patient) => {
                                    const isDeleting = deletingId === patient.id;

                                    return (
                                        <tr
                                            key={patient.id}
                                            className="transition-colors hover:bg-zinc-50/80"
                                        >
                                            <td className="px-4 py-2.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-teal-50 text-[11px] font-semibold tracking-wide text-teal-800 ring-1 ring-inset ring-teal-700/10">
                                                        {patient.fullName
                                                            .split(/\s+/)
                                                            .filter(Boolean)
                                                            .slice(0, 2)
                                                            .map((part) => part[0])
                                                            .join('')
                                                            .toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-zinc-900">
                                                            {patient.fullName}
                                                        </p>
                                                        {patient.address && (
                                                            <p className="max-w-56 truncate text-xs text-zinc-500">
                                                                {patient.address}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-2.5">
                                                <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs tracking-wide text-zinc-700">
                                                    {patient.cin}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5 tabular-nums text-zinc-600">
                                                {patient.phone}
                                            </td>
                                            <td className="px-4 py-2.5 tabular-nums text-zinc-600">
                                                {patient.birthDate
                                                    ? patient.birthDate.slice(0, 10)
                                                    : '—'}
                                            </td>

                                            <td className="px-4 py-2.5">
                                                <div className="flex justify-end gap-0.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditForm(patient)}
                                                        aria-label={`Edit ${patient.fullName}`}
                                                        title="Edit"
                                                        className={`${iconButtonBase} hover:bg-teal-50 hover:text-teal-700`}
                                                    >
                                                        <PencilIcon className="size-4" />
                                                    </button>

                                                    <span
                                                        title={
                                                            canDelete
                                                                ? 'Delete'
                                                                : 'Staff accounts cannot delete patients'
                                                        }
                                                        className="inline-flex"
                                                    >
                                                        <button
                                                            type="button"
                                                            disabled={!canDelete || isDeleting}
                                                            onClick={() => askDelete(patient)}
                                                            aria-label={
                                                                canDelete
                                                                    ? `Delete ${patient.fullName}`
                                                                    : `Delete ${patient.fullName} (not allowed for staff)`
                                                            }
                                                            className={`${iconButtonBase} hover:bg-red-50 hover:text-red-600 focus-visible:ring-red-600`}
                                                        >
                                                            {isDeleting ? (
                                                                <RefreshIcon className="size-4 animate-spin" />
                                                            ) : canDelete ? (
                                                                <TrashIcon className="size-4" />
                                                            ) : (
                                                                <LockIcon className="size-4" />
                                                            )}
                                                        </button>
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <PaginationControls
                            page={page}
                            totalPages={totalPages}
                            total={total}
                            limit={limit}
                            loading={loading}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </section>

            {formOpen && (
                <PatientForm
                    key={editingPatient?.id ?? 'new-patient'}
                    patient={editingPatient}
                    saving={saving}
                    onSave={handleSave}
                    onCancel={() => {
                        if (!saving) {
                            setFormOpen(false);
                            setEditingPatient(null);
                        }
                    }}
                />
            )}

            {patientToDelete && (
                <ConfirmDialog
                    title="Delete patient"
                    message={`Are you sure you want to delete "${patientToDelete.fullName}"? This action cannot be undone.`}
                    confirmLabel="Delete"
                    loading={deletingId === patientToDelete.id}
                    onConfirm={() => void confirmDelete()}
                    onCancel={() => setPatientToDelete(null)}
                />
            )}
        </main>
    );
}