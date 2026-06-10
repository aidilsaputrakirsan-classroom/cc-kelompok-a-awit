import React from "react";
import { Edit2, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

function formatWeight(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }
  return Number(value).toFixed(3);
}

function formatDate(isoString) {
  if (!isoString) return "—";
  try {
    return new Date(isoString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function SkeletonRows({ colCount, rowsCount = 5 }) {
  return Array.from({ length: rowsCount }).map((_, rowIdx) => (
    <tr key={`skel-${rowIdx}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      {Array.from({ length: colCount }).map((__, colIdx) => (
        <td key={colIdx} className="px-6 py-4">
          <span
            className="block h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
            style={{ width: colIdx === 0 ? "1.5rem" : "80%" }}
          />
        </td>
      ))}
    </tr>
  ));
}

function HaulingTable({
  rows,
  vendors,
  blocks,
  loading,
  onEdit,
  onAssign,
  onDelete,
  sortConfig,
  onSort,
  pagination,
  onPageChange,
  onPerPageChange,
  hasActiveFilters,
}) {
  const getVendorName = (vendorId) => {
    if (!vendorId) return "—";
    const vendor = vendors.find((v) => v.id === vendorId);
    return vendor ? vendor.name : "—";
  };

  const getBlockCode = (blockId) => {
    if (!blockId) return "—";
    const block = blocks.find((b) => b.id === blockId);
    return block ? block.block_code : "—";
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
      LOADING: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      ON_THE_WAY: "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
      WEIGHING: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
      COMPLETED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    };
    
    const labelConfig = {
      PENDING: "Menunggu",
      LOADING: "Muat Buah",
      ON_THE_WAY: "Di Jalan",
      WEIGHING: "Timbang",
      COMPLETED: "Selesai",
    };
    
    const confClass = statusConfig[status] || statusConfig.PENDING;
    const label = labelConfig[status] || labelConfig.PENDING;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${confClass} whitespace-nowrap`}>
        {label}
      </span>
    );
  };

  const colCount = 12;

  const handleSortClick = (key) => {
    let direction = "asc";
    if (sortConfig.sort_by === key) {
      if (sortConfig.sort_dir === "asc") direction = "desc";
      else if (sortConfig.sort_dir === "desc") {
        onSort("", ""); // reset
        return;
      }
    }
    onSort(key, direction);
  };

  const renderSortIcon = (key) => {
    if (sortConfig.sort_by !== key) return <ArrowUpDown size={14} className="text-gray-400 inline ml-1" />;
    return sortConfig.sort_dir === "asc" ? <ArrowUp size={14} className="text-emerald-500 inline ml-1" /> : <ArrowDown size={14} className="text-emerald-500 inline ml-1" />;
  };

  const startItem = (pagination.page - 1) * pagination.per_page + 1;
  const endItem = Math.min(pagination.page * pagination.per_page, pagination.total);

  return (
    <div className="w-full">
      <div className="w-full overflow-x-auto min-h-[400px]">
        <table className="w-full text-sm text-left text-gray-600 dark:text-gray-400 min-w-[1200px]">
          <thead className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 uppercase border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 font-semibold">No.</th>
              <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors whitespace-nowrap" onClick={() => handleSortClick("ticket_no")}>
                Ticket No{renderSortIcon("ticket_no")}
              </th>
              <th className="px-6 py-4 font-semibold whitespace-nowrap">Vehicle Plate</th>
              <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors whitespace-nowrap" onClick={() => handleSortClick("vendor_name")}>
                Vendor Name{renderSortIcon("vendor_name")}
              </th>
              <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors whitespace-nowrap" onClick={() => handleSortClick("block_code")}>
                Block Code{renderSortIcon("block_code")}
              </th>
              <th className="px-6 py-4 font-semibold text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors whitespace-nowrap" onClick={() => handleSortClick("weight_in")}>
                Weight In (ton){renderSortIcon("weight_in")}
              </th>
              <th className="px-6 py-4 font-semibold text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors whitespace-nowrap" onClick={() => handleSortClick("weight_out")}>
                Weight Out (ton){renderSortIcon("weight_out")}
              </th>
              <th className="px-6 py-4 font-semibold text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors whitespace-nowrap" onClick={() => handleSortClick("net_weight")}>
                Net Weight (ton){renderSortIcon("net_weight")}
              </th>
              <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors whitespace-nowrap" onClick={() => handleSortClick("transaction_date")}>
                Date{renderSortIcon("transaction_date")}
              </th>
              <th className="px-6 py-4 font-semibold whitespace-nowrap">Driver</th>
              <th className="px-6 py-4 font-semibold text-center whitespace-nowrap">Status</th>
              {(onEdit || onDelete) && <th className="px-6 py-4 font-semibold text-center whitespace-nowrap">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
            {loading ? (
              <SkeletonRows colCount={colCount} />
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-4xl mb-3">🚛</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {hasActiveFilters ? "Tidak ada transaksi yang sesuai filter" : "Belum ada transaksi hauling"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {hasActiveFilters ? "Coba ubah kriteria pencarian Anda." : "Klik \"Add Transaction\" untuk mencatat pengangkutan perdana."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-3">{startItem + index}</td>
                  <td className="px-6 py-3 font-mono text-sm font-medium text-emerald-600 dark:text-emerald-400 cursor-pointer hover:underline">{row.ticket_no}</td>
                  <td className="px-6 py-3 font-mono text-sm">{row.vehicle_plate}</td>
                  <td className="px-6 py-3">{row.vendor?.name || getVendorName(row.vendor_id)}</td>
                  <td className="px-6 py-3 font-mono text-sm">{row.block?.code || getBlockCode(row.block_id)}</td>
                  <td className="px-6 py-3 text-right">{formatWeight(row.weight_in)}</td>
                  <td className="px-6 py-3 text-right">{formatWeight(row.weight_out)}</td>
                  <td className="px-6 py-3 text-right font-medium">
                    <span className={Number(row.net_weight) > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                      {formatWeight(row.net_weight)}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(row.transaction_date || row.created_at)}</td>
                  <td className="px-6 py-3">
                    {row.driver?.name ? (
                      <span className="font-medium text-gray-900 dark:text-gray-100">{row.driver.name}</span>
                    ) : (
                      <button 
                        type="button" 
                        onClick={() => onAssign(row)} 
                        className="text-xs px-2.5 py-1.5 border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-400 hover:text-emerald-600 hover:border-emerald-500 dark:hover:text-emerald-400 dark:hover:border-emerald-500 transition-colors"
                      >
                        + Assign
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-3 text-center">
                    {getStatusBadge(row.trip_status || "PENDING")}
                  </td>
                  {(onEdit || onDelete) && (
                    <td className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {onEdit && (
                          <button
                            type="button"
                            onClick={() => onEdit(row)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                            title="Edit transaksi"
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(row)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                            title="Hapus transaksi"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!loading && rows.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Menampilkan <strong className="font-semibold text-gray-900 dark:text-gray-100">{startItem}</strong>–<strong className="font-semibold text-gray-900 dark:text-gray-100">{endItem}</strong> dari <strong className="font-semibold text-gray-900 dark:text-gray-100">{pagination.total}</strong> transaksi
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Baris per halaman:</span>
              <select
                value={pagination.per_page}
                onChange={(e) => onPerPageChange(Number(e.target.value))}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md py-1 pl-2 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={() => onPageChange(1)} 
                disabled={pagination.page === 1}
                className="px-2.5 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Pertama
              </button>
              <button 
                onClick={() => onPageChange(pagination.page - 1)} 
                disabled={pagination.page === 1}
                className="px-2.5 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>
              <button className="px-3 py-1 text-sm border border-emerald-600 rounded-md bg-emerald-600 text-white font-medium cursor-default">
                {pagination.page}
              </button>
              <button 
                onClick={() => onPageChange(pagination.page + 1)} 
                disabled={pagination.page >= pagination.total_pages}
                className="px-2.5 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
              <button 
                onClick={() => onPageChange(pagination.total_pages)} 
                disabled={pagination.page >= pagination.total_pages}
                className="px-2.5 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Terakhir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HaulingTable;
