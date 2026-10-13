
interface PaginationControlsProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({
  page,
  totalPages,
  total,
  limit,
  loading = false,
  onPageChange,
}: PaginationControlsProps) {
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Showing{' '}
        <span className="font-medium text-slate-700">
          {start}–{end}
        </span>{' '}
        of{' '}
        <span className="font-medium text-slate-700">
          {total}
        </span>{' '}
        records
      </p>

      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500">
          Page {page} of {totalPages}
        </span>

        <button
          type="button"
          disabled={loading || page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        <button
          type="button"
          disabled={loading || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
