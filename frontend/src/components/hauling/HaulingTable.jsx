import React from "react";

function formatWeight(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }
  return Number(value).toFixed(3); // Updated to 3 decimals as per prompt
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
    <tr key={`skel-${rowIdx}`} className="blk-tr">
      {Array.from({ length: colCount }).map((__, colIdx) => (
        <td key={colIdx} className="blk-td">
          <span
            className="ahl-skeleton"
            style={{ display: "block", width: colIdx === 0 ? "1.5rem" : "80%" }}
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

  const colCount = 10;

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
    if (sortConfig.sort_by !== key) return " ↕";
    return sortConfig.sort_dir === "asc" ? " ↑" : " ↓";
  };

  const startItem = (pagination.page - 1) * pagination.per_page + 1;
  const endItem = Math.min(pagination.page * pagination.per_page, pagination.total);

  return (
    <div style={{ padding: "0 2rem 2rem 2rem" }}>
      <div className="blk-table-wrap" style={{ overflowX: "auto", marginTop: "1rem" }}>
        <table className="blk-table" style={{ minWidth: "1000px" }}>
          <thead>
            <tr>
              <th className="blk-th">No.</th>
              <th className="blk-th" style={{ cursor: "pointer" }} onClick={() => handleSortClick("ticket_no")}>
                Ticket No{renderSortIcon("ticket_no")}
              </th>
              <th className="blk-th">Vehicle Plate</th>
              <th className="blk-th" style={{ cursor: "pointer" }} onClick={() => handleSortClick("vendor_name")}>
                Vendor Name{renderSortIcon("vendor_name")}
              </th>
              <th className="blk-th" style={{ cursor: "pointer" }} onClick={() => handleSortClick("block_code")}>
                Block Code{renderSortIcon("block_code")}
              </th>
              <th className="blk-th blk-td--number" style={{ cursor: "pointer" }} onClick={() => handleSortClick("weight_in")}>
                Weight In (ton){renderSortIcon("weight_in")}
              </th>
              <th className="blk-th blk-td--number" style={{ cursor: "pointer" }} onClick={() => handleSortClick("weight_out")}>
                Weight Out (ton){renderSortIcon("weight_out")}
              </th>
              <th className="blk-th blk-td--number" style={{ cursor: "pointer" }} onClick={() => handleSortClick("net_weight")}>
                Net Weight (ton){renderSortIcon("net_weight")}
              </th>
              <th className="blk-th" style={{ cursor: "pointer" }} onClick={() => handleSortClick("transaction_date")}>
                Date{renderSortIcon("transaction_date")}
              </th>
              <th className="blk-th blk-th--actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows colCount={colCount} />
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="blk-td blk-td--empty">
                  <div style={{ padding: "1.5rem 0", textAlign: "center" }}>
                    <p style={{ margin: "0 0 0.5rem", fontSize: "2rem" }}>🚛</p>
                    <p style={{ margin: 0, fontWeight: 700, color: "var(--text-primary)" }}>
                      {hasActiveFilters ? "Tidak ada transaksi yang sesuai filter" : "Belum ada transaksi hauling"}
                    </p>
                    <p style={{ margin: "0.35rem 0 0", fontSize: "0.88rem", color: "var(--text-secondary)" }}>
                      {hasActiveFilters ? "Coba ubah kriteria pencarian Anda." : "Klik \"Add Transaction\" untuk mencatat pengangkutan perdana."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.id} className="blk-tr">
                  <td className="blk-td">{startItem + index}</td>
                  <td className="blk-td blk-td--mono" style={{ color: "var(--accent-color)", cursor: "pointer" }}>{row.ticket_no}</td>
                  <td className="blk-td blk-td--mono">{row.vehicle_plate}</td>
                  <td className="blk-td">{row.vendor?.name || getVendorName(row.vendor_id)}</td>
                  <td className="blk-td blk-td--mono">{row.block?.code || getBlockCode(row.block_id)}</td>
                  <td className="blk-td blk-td--number">{formatWeight(row.weight_in)}</td>
                  <td className="blk-td blk-td--number">{formatWeight(row.weight_out)}</td>
                  <td className="blk-td blk-td--number">
                    <strong style={{ color: Number(row.net_weight) > 0 ? "green" : "red" }}>
                      {formatWeight(row.net_weight)}
                    </strong>
                  </td>
                  <td className="blk-td">{formatDate(row.transaction_date || row.created_at)}</td>
                  <td className="blk-td blk-td--actions">
                    <button
                      type="button"
                      onClick={() => onEdit(row)}
                      className="blk-btn-edit"
                      title="Edit transaksi"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(row)}
                      className="blk-btn-delete"
                      title="Hapus transaksi"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!loading && rows.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Menampilkan {startItem}–{endItem} dari {pagination.total} transaksi
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Baris per halaman:</span>
              <select
                value={pagination.per_page}
                onChange={(e) => onPerPageChange(Number(e.target.value))}
                style={{ padding: "0.25rem 0.5rem", borderRadius: "4px", border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            
            <div style={{ display: "flex", gap: "0.25rem" }}>
              <button 
                onClick={() => onPageChange(1)} 
                disabled={pagination.page === 1}
                className="blk-page-btn"
                style={{ padding: "0.25rem 0.5rem" }}
              >
                Pertama
              </button>
              <button 
                onClick={() => onPageChange(pagination.page - 1)} 
                disabled={pagination.page === 1}
                className="blk-page-btn"
                style={{ padding: "0.25rem 0.5rem" }}
              >
                Prev
              </button>
              <button className="blk-page-btn" disabled style={{ padding: "0.25rem 0.5rem", background: "var(--accent-color)", color: "white", opacity: 1 }}>
                {pagination.page}
              </button>
              <button 
                onClick={() => onPageChange(pagination.page + 1)} 
                disabled={pagination.page >= pagination.total_pages}
                className="blk-page-btn"
                style={{ padding: "0.25rem 0.5rem" }}
              >
                Next
              </button>
              <button 
                onClick={() => onPageChange(pagination.total_pages)} 
                disabled={pagination.page >= pagination.total_pages}
                className="blk-page-btn"
                style={{ padding: "0.25rem 0.5rem" }}
              >
                Terakhir
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ahl-skeleton {
          height: 0.85rem;
          border-radius: 4px;
          background: linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.06) 75%);
          background-size: 200% 100%;
          animation: ahl-shimmer 1.2s ease-in-out infinite;
        }
        @keyframes ahl-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export default HaulingTable;
