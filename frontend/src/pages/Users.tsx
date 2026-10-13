import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { errMsg } from '../lib/api';
import { usersApi, type UserRole } from '../lib/users';

export default function Users() {
    const { user } = useAuth();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('staff');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    if (user?.role !== 'admin') return <Navigate to="/" replace />;

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        setError('');
        setNotice('');

        try {
            const created = await usersApi.register({
                fullName: fullName.trim(),
                email: email.trim(),
                password,
                role,
            });
            setNotice(`User ${created.email} (${created.role}) created successfully.`);
            setFullName('');
            setEmail('');
            setPassword('');
            setRole('staff');
        } catch (err) {
            setError(errMsg(err));
        } finally {
            setSaving(false);
        }
    }

    const inputClass =
        'w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500';
    const labelClass = 'mb-1 block text-sm font-medium text-gray-700';

    return (
        <main className="mx-auto max-w-lg space-y-6">
            <header>
                <h1 className="text-2xl font-semibold text-gray-900">Create user</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Register a new staff member or administrator.
                </p>
            </header>

            {notice && (
                <div role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                    {notice}
                </div>
            )}
            {error && (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
                <div>
                    <label htmlFor="fullName" className={labelClass}>Full name *</label>
                    <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)}
                        required minLength={2} className={inputClass} />
                </div>

                <div>
                    <label htmlFor="email" className={labelClass}>Email *</label>
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        required className={inputClass} />
                </div>

                <div>
                    <label htmlFor="password" className={labelClass}>Password * (min. 8 characters)</label>
                    <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                        required minLength={8} autoComplete="new-password" className={inputClass} />
                </div>

                <div>
                    <label htmlFor="role" className={labelClass}>Role *</label>
                    <select id="role" value={role} onChange={(e) => setRole(e.target.value as UserRole)}
                        className={inputClass}>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <div className="flex justify-end border-t border-gray-100 pt-4">
                    <button type="submit" disabled={saving}
                        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                        {saving ? 'Creating...' : 'Create user'}
                    </button>
                </div>
            </form>
        </main>
    );
}