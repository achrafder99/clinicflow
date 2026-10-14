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
    iconStyle: 'bg-teal-50 text-teal-700 ring-teal-600/20',
    valueStyle: 'text-slate-800',
  },
  {
    key: 'todayAppointments',
    label: "Today's appointments",
    description: 'Scheduled for today',
    icon: '▦',
    iconStyle: 'bg-sky-50 text-sky-700 ring-sky-600/20',
    valueStyle: 'text-slate-800',
  },
  {
    key: 'pending',
    label: 'Pending',
    description: 'Awaiting confirmation',
    icon: '◷',
    iconStyle: 'bg-amber-50 text-amber-700 ring-amber-600/25',
    valueStyle: 'text-amber-700',
  },
  {
    key: 'confirmed',
    label: 'Confirmed',
    description: 'Confirmed appointments',
    icon: '✓',
    iconStyle: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    valueStyle: 'text-emerald-700',
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
      <header className="flex flex-col gap-5 rounded-2xl bg-teal-800 px-6 py-6 shadow-sm ring-1 ring-inset ring-teal-900/40 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-7">
        <div>
          <p className="text-xs font-medium text-teal-200">
            ClinicFlow / Overview
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Dashboard
          </h1>
          <p className="mt-1.5 max-w-md text-[13px] leading-5 text-teal-100/90">
            An overview of your clinic's patients and appointments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadStats()}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-white/10 px-3.5 py-2 text-[13px] font-medium text-white ring-1 ring-inset ring-white/25 transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
        >
          <span
            aria-hidden="true"
            className={refreshing ? 'inline-block motion-safe:animate-spin' : 'inline-block'}
          >
            {refreshing ? '◌' : '↻'}
          </span>
          {refreshing ? 'Refreshing...' : 'Refresh statistics'}
        </button>
      </header>

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl bg-rose-50 p-4 text-[13px] text-rose-800 ring-1 ring-inset ring-rose-200 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-semibold text-rose-900">Unable to load dashboard statistics</p>
            <p className="mt-1 leading-5">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => void loadStats()}
            disabled={refreshing}
            className="self-start rounded-lg bg-white px-3 py-1.5 font-medium text-rose-700 ring-1 ring-inset ring-rose-200 transition hover:bg-rose-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 disabled:opacity-50 sm:self-auto"
          >
            Try again
          </button>
        </div>
      )}

      <section aria-label="Clinic statistics">
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <h2 className="text-sm font-semibold text-slate-800">Clinic overview</h2>
          {stats && (
            <span className="text-xs text-slate-500">
              Live data from your database
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          {CARDS.map((card) => (
            <article
              key={card.key}
              className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    {card.label}
                  </p>
                  {loading && !stats ? (
                    <div className="mt-2.5 h-8 w-20 animate-pulse rounded-md bg-slate-100" />
                  ) : (
                    <p className={`mt-2 text-3xl font-semibold tabular-nums tracking-tight ${card.valueStyle}`}>
                      {(stats?.[card.key] ?? 0).toLocaleString()}
                    </p>
                  )}
                </div>

                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base font-semibold ring-1 ring-inset ${card.iconStyle}`}
                  aria-hidden="true"
                >
                  {card.icon}
                </div>
              </div>

              <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
                {card.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Quick actions</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Go directly to the main clinic management modules.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
          <Link
            to="/patients"
            className="group flex items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 transition hover:bg-teal-50/40 hover:shadow-md hover:ring-teal-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            <div>
              <h3 className="text-sm font-semibold text-slate-800 transition-colors group-hover:text-teal-800">
                Manage patients
              </h3>
              <p className="mt-0.5 text-[13px] leading-5 text-slate-500">
                View, search, add, and update patient records.
              </p>
            </div>
            <span className="text-lg text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-teal-600">
              →
            </span>
          </Link>

          <Link
            to="/appointments"
            className="group flex items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 transition hover:bg-teal-50/40 hover:shadow-md hover:ring-teal-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            <div>
              <h3 className="text-sm font-semibold text-slate-800 transition-colors group-hover:text-teal-800">
                Manage appointments
              </h3>
              <p className="mt-0.5 text-[13px] leading-5 text-slate-500">
                Schedule visits and update appointment statuses.
              </p>
            </div>
            <span className="text-lg text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-teal-600">
              →
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}