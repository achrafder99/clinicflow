
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errMsg } from '../lib/api';

interface Stats {
  totalPatients: number;
  todayAppointments: number;
  pending: number;
  confirmed: number;
}

const CARDS: {
  key: keyof Stats;
  label: string;
  description: string;
  icon: string;
  iconStyle: string;
  valueStyle: string;
}[] = [
  {
    key: 'totalPatients',
    label: 'Total patients',
    description: 'Active patient records',
    icon: '♙',
    iconStyle: 'bg-blue-50 text-blue-700',
    valueStyle: 'text-gray-900',
  },
  {
    key: 'todayAppointments',
    label: "Today's appointments",
    description: 'Scheduled for today',
    icon: '▦',
    iconStyle: 'bg-violet-50 text-violet-700',
    valueStyle: 'text-gray-900',
  },
  {
    key: 'pending',
    label: 'Pending',
    description: 'Awaiting confirmation',
    icon: '◷',
    iconStyle: 'bg-amber-50 text-amber-700',
    valueStyle: 'text-amber-700',
  },
  {
    key: 'confirmed',
    label: 'Confirmed',
    description: 'Confirmed appointments',
    icon: '✓',
    iconStyle: 'bg-green-50 text-green-700',
    valueStyle: 'text-green-700',
  },
];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadStats = useCallback(async () => {
    setError('');
    setRefreshing(true);

    try {
      const response = await api.get<Stats>('/dashboard/stats');
      const data = response.data;

      if (
        typeof data?.totalPatients !== 'number' ||
        typeof data?.todayAppointments !== 'number' ||
        typeof data?.pending !== 'number' ||
        typeof data?.confirmed !== 'number'
      ) {
        throw new Error('The dashboard API returned an invalid statistics response.');
      }

      setStats(data);
    } catch (error) {
      setError(errMsg(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  return (
    <main className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">
            ClinicFlow / Overview
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            An overview of your clinic's patients and appointments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadStats()}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
        >
          <span aria-hidden="true">{refreshing ? '◌' : '↻'}</span>
          {refreshing ? 'Refreshing...' : 'Refresh statistics'}
        </button>
      </header>

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-semibold">Unable to load dashboard statistics</p>
            <p className="mt-1">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => void loadStats()}
            disabled={refreshing}
            className="self-start rounded-lg border border-red-200 bg-white px-3 py-2 font-medium hover:bg-red-100 disabled:opacity-50 sm:self-auto"
          >
            Try again
          </button>
        </div>
      )}

      <section aria-label="Clinic statistics">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Clinic overview</h2>
          {stats && (
            <span className="text-xs text-gray-500">
              Live data from your database
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {CARDS.map((card) => (
            <article
              key={card.key}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {card.label}
                  </p>
                  {loading && !stats ? (
                    <div className="mt-3 h-9 w-20 animate-pulse rounded-md bg-gray-100" />
                  ) : (
                    <p className={`mt-3 text-3xl font-semibold tracking-tight ${card.valueStyle}`}>
                      {(stats?.[card.key] ?? 0).toLocaleString()}
                    </p>
                  )}
                </div>

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl font-semibold ${card.iconStyle}`}
                  aria-hidden="true"
                >
                  {card.icon}
                </div>
              </div>

              <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
                {card.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-semibold text-gray-900">Quick actions</h2>
          <p className="mt-1 text-sm text-gray-500">
            Go directly to the main clinic management modules.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Link
            to="/patients"
            className="group flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
          >
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">
                Manage patients
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                View, search, add, and update patient records.
              </p>
            </div>
            <span className="text-xl text-gray-400 transition group-hover:translate-x-1 group-hover:text-blue-600">
              →
            </span>
          </Link>

          <Link
            to="/appointments"
            className="group flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
          >
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">
                Manage appointments
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Schedule visits and update appointment statuses.
              </p>
            </div>
            <span className="text-xl text-gray-400 transition group-hover:translate-x-1 group-hover:text-blue-600">
              →
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
