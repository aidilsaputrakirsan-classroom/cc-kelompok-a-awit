import { useState, useEffect } from "react";
import { Search, RotateCcw } from "lucide-react";

function HaulingFilterBar({
  filters,
  onChange,
  onReset,
  vendors,
  blocks,
  loading,
  masterLoading,
}) {
  const [localSearch, setLocalSearch] = useState(filters.ticket_no || "");

  useEffect(() => {
    setLocalSearch(filters.ticket_no || "");
  }, [filters.ticket_no]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (filters.ticket_no || "")) {
        onChange("ticket_no", localSearch);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, onChange, filters.ticket_no]);

  return (
    <div className="flex flex-wrap items-end gap-3 p-4 bg-gray-50/50 dark:bg-gray-800/50">
      <div className="flex-1 min-w-[160px] relative">
        <label
          htmlFor="ahl-search"
          className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
        >
          Cari Ticket No
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={14} className="text-gray-400" />
          </div>
          <input
            id="ahl-search"
            type="search"
            className="w-full pl-9 pr-12 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            placeholder="Ticket no…"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            maxLength={100}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 pointer-events-none font-mono">
            {localSearch.length}/100
          </div>
        </div>
      </div>
      
      <div className="flex-1 min-w-[140px]">
        <label
          htmlFor="ahl-vendor"
          className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
        >
          Filter Vendor
        </label>
        <select
          id="ahl-vendor"
          className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-sm shadow-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:bg-gray-50"
          value={filters.vendor_id || ""}
          onChange={(e) => onChange("vendor_id", e.target.value)}
          disabled={masterLoading}
        >
          {masterLoading ? (
            <option value="">Memuat vendor...</option>
          ) : (
            <>
              <option value="">Semua vendor</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </>
          )}
        </select>
      </div>

      <div className="flex-1 min-w-[140px]">
        <label
          htmlFor="ahl-block"
          className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
        >
          Filter Block
        </label>
        <select
          id="ahl-block"
          className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-sm shadow-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:bg-gray-50"
          value={filters.block_id || ""}
          onChange={(e) => onChange("block_id", e.target.value)}
          disabled={masterLoading}
        >
          {masterLoading ? (
            <option value="">Memuat blok...</option>
          ) : (
            <>
              <option value="">Semua blok</option>
              {blocks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.block_code}
                </option>
              ))}
            </>
          )}
        </select>
      </div>

      <div className="flex-1 min-w-[130px]">
        <label
          htmlFor="ahl-date-from"
          className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
        >
          Dari Tanggal
        </label>
        <input
          id="ahl-date-from"
          type="date"
          className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-sm shadow-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50"
          value={filters.date_from || ""}
          onChange={(e) => onChange("date_from", e.target.value)}
        />
      </div>

      <div className="flex-1 min-w-[130px]">
        <label
          htmlFor="ahl-date-to"
          className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
        >
          Sampai Tanggal
        </label>
        <input
          id="ahl-date-to"
          type="date"
          className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-sm shadow-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50"
          value={filters.date_to || ""}
          onChange={(e) => onChange("date_to", e.target.value)}
          min={filters.date_from || ""}
        />
      </div>

      <button
        type="button"
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[120px] whitespace-nowrap h-[38px]"
        onClick={onReset}
        disabled={loading}
      >
        <RotateCcw size={14} />
        Reset Filters
      </button>
    </div>
  );
}

export default HaulingFilterBar;
