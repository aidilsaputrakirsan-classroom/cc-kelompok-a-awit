import { ChevronLeft, ChevronRight } from "lucide-react"

const PAGE_SIZE_OPTIONS = [10, 20, 50]

function ContractorPagination({
  total,
  skip,
  limit,
  onPageChange,
  onLimitChange,
  disabled,
}) {
  const safeTotal = Math.max(0, total)
  const safeLimit = Math.max(1, limit)
  const currentPage = safeTotal === 0 ? 0 : Math.floor(skip / safeLimit) + 1
  const totalPages = safeTotal === 0 ? 0 : Math.max(1, Math.ceil(safeTotal / safeLimit))
  const from = safeTotal === 0 ? 0 : skip + 1
  const to = safeTotal === 0 ? 0 : Math.min(skip + safeLimit, safeTotal)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
      <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <span>
          Showing <strong className="font-semibold text-gray-900 dark:text-gray-100">{from}</strong>–<strong className="font-semibold text-gray-900 dark:text-gray-100">{to}</strong> of <strong className="font-semibold text-gray-900 dark:text-gray-100">{safeTotal}</strong>
        </span>
        <label className="flex items-center gap-2">
          <span>Per page</span>
          <select
            value={String(safeLimit)}
            disabled={disabled}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md py-1 pl-2 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Page <strong className="font-semibold text-gray-900 dark:text-gray-100">{currentPage}</strong> / <strong className="font-semibold text-gray-900 dark:text-gray-100">{totalPages}</strong>
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="p-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={disabled || currentPage <= 1 || safeTotal === 0}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="p-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={disabled || currentPage >= totalPages || safeTotal === 0}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ContractorPagination
