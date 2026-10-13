
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type FormEvent,
} from 'react';
import {
    patientsApi,
    type Patient,
    type PatientInput,
} from '../lib/patients';
import { errMsg } from '../lib/api';
import PaginationControls from '../componenets/PaginationControls';

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
                aria-labelledby="patient-form-title"
                className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            >
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h2
                            id="patient-form-title"
                            className="text-xl font-semibold text-gray-900"
                        >
                            {patient ? 'Edit patient' : 'Add patient'}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            {patient
                                ? 'Update the patient information below.'
                                : 'Enter the information for the new patient.'}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={saving}
                        aria-label="Close form"
                        className="rounded-lg px-2 py-1 text-xl text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="fullName"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Full name *
                        </label>
                        <input
                            id="fullName"
                            value={fullName}
                            onChange={(event) => setFullName(event.target.value)}
                            required
                            minLength={2}
                            autoFocus
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
                            placeholder="e.g. Salma Tazi"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="cin"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            CIN *
                        </label>
                        <input
                            id="cin"
                            value={cin}
                            onChange={(event) =>
                                setCin(event.target.value.toUpperCase())
                            }
                            required
                            minLength={4}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 uppercase outline-none focus:border-blue-500"
                            placeholder="e.g. AB123456"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="phone"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Phone *
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(event) => setPhone(event.target.value)}
                            required
                            minLength={6}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
                            placeholder="e.g. 0612345678"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="birthDate"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Birth date *
                        </label>
                        <input
                            id="birthDate"
                            type="date"
                            value={birthDate}
                            max={new Date().toISOString().slice(0, 10)}
                            onChange={(event) => setBirthDate(event.target.value)}
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="address"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Address
                        </label>
                        <textarea
                            id="address"
                            value={address}
                            onChange={(event) => setAddress(event.target.value)}
                            rows={2}
                            className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
                            placeholder="Optional address"
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
                            disabled={saving}
                            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving
                                ? 'Saving...'
                                : patient
                                  ? 'Save changes'
                                  : 'Create patient'}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default function Patients() {
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

    const filteredPatients = useMemo(() => patients, [patients]);

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
        } catch (error) {
            throw error;
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(patient: Patient) {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${patient.fullName}"?`,
        );

        if (!confirmed) return;

        setDeletingId(patient.id);
        setError('');
        setNotice('');

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
        }
    }

    return (
        <main className="space-y-6">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Patients
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your clinic&apos;s patient records.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateForm}
                    className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                    + Add patient
                </button>
            </header>

            {notice && (
                <div
                    role="status"
                    className="flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"
                >
                    <span>{notice}</span>
                    <button
                        type="button"
                        onClick={() => setNotice('')}
                        aria-label="Dismiss notification"
                        className="text-green-800 hover:underline"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {error && (
                <div
                    role="alert"
                    className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => void loadPatients()}
                        disabled={loading}
                        className="shrink-0 font-medium underline disabled:opacity-50"
                    >
                        Retry
                    </button>
                </div>
            )}

            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-semibold text-gray-900">
                            All patients
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            {debouncedSearch
                                ? `${total} matching patients`
                                : `${total} patient records`}
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search name, CIN, or phone..."
                            aria-label="Search patients"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 sm:w-72"
                        />

                        <button
                            type="button"
                            onClick={() => void loadPatients()}
                            disabled={loading}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            {loading ? 'Loading...' : 'Refresh'}
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="py-14 text-center">
                        <p className="text-sm text-gray-500">
                            Loading patients...
                        </p>
                    </div>
                ) : filteredPatients.length === 0 ? (
                    <div className="py-14 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                            <span className="text-xl">♙</span>
                        </div>
                        <h3 className="font-medium text-gray-900">
                            {debouncedSearch
                                ? 'No matching patients'
                                : 'No patients found'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {debouncedSearch
                                ? 'Try a different name, CIN, or phone number.'
                                : 'Add your first patient to get started.'}
                        </p>

                        {!debouncedSearch && (
                            <button
                                type="button"
                                onClick={openCreateForm}
                                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                Add patient
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px] text-left text-sm">
                            <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
                                <tr>
                                    <th scope="col" className="px-3 py-3 font-medium">
                                        Patient
                                    </th>
                                    <th scope="col" className="px-3 py-3 font-medium">
                                        CIN
                                    </th>
                                    <th scope="col" className="px-3 py-3 font-medium">
                                        Phone
                                    </th>
                                    <th scope="col" className="px-3 py-3 font-medium">
                                        Birth date
                                    </th>
                                    <th scope="col" className="px-3 py-3 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {filteredPatients.map((patient) => (
                                    <tr
                                        key={patient.id}
                                        className="transition-colors hover:bg-gray-50"
                                    >
                                        <td className="px-3 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                                                    {patient.fullName
                                                        .split(/\s+/)
                                                        .filter(Boolean)
                                                        .slice(0, 2)
                                                        .map((part) => part[0])
                                                        .join('')
                                                        .toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {patient.fullName}
                                                    </p>
                                                    {patient.address && (
                                                        <p className="mt-0.5 max-w-48 truncate text-xs text-gray-500">
                                                            {patient.address}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-3 py-4 text-gray-600">
                                            {patient.cin}
                                        </td>
                                        <td className="px-3 py-4 text-gray-600">
                                            {patient.phone}
                                        </td>
                                        <td className="px-3 py-4 text-gray-600">
                                            {patient.birthDate
                                                ? patient.birthDate.slice(0, 10)
                                                : '—'}
                                        </td>

                                        <td className="px-3 py-4">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditForm(patient)}
                                                    className="font-medium text-blue-600 hover:text-blue-800"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={deletingId === patient.id}
                                                    onClick={() => void handleDelete(patient)}
                                                    className="font-medium text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {deletingId === patient.id
                                                        ? 'Deleting...'
                                                        : 'Delete'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
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
        </main>
    );
}
