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
    <div className="mdc-pagination">
      <div className="mdc-pagination__info">
        <span className="mdc-pagination__label">
          Showing <strong>{from}</strong>–<strong>{to}</strong> of <strong>{safeTotal}</strong>
        </span>
        <label className="mdc-pagination__per">
          <span>Per page</span>
          <select
            value={String(safeLimit)}
            disabled={disabled}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="mdc-pagination__select"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mdc-pagination__nav">
        <button
          type="button"
          className="mdc-page-btn"
          disabled={disabled || currentPage <= 1 || safeTotal === 0}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Prev
        </button>
        <span className="mdc-pagination__page">
          Page <strong>{currentPage}</strong> / <strong>{totalPages}</strong>
        </span>
        <button
          type="button"
          className="mdc-page-btn"
          disabled={disabled || currentPage >= totalPages || safeTotal === 0}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default ContractorPagination
