function formatWeight(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—"
  }
  return Number(value).toFixed(2)
}

function formatDate(isoString) {
  if (!isoString) return "—"
  try {
    return new Date(isoString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return "—"
  }
}

function SkeletonRows({ colCount }) {
  return Array.from({ length: 5 }).map((_, rowIdx) => (
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
  ))
}

function HaulingTable({
  rows,
  vendors,
  blocks,
  loading,
  onEdit,
  onDelete,
}) {
  const getVendorName = (vendorId) => {
    if (!vendorId) return "—"
    const vendor = vendors.find((v) => v.id === vendorId)
    return vendor ? vendor.name : "—"
  }

  const getBlockCode = (blockId) => {
    if (!blockId) return "—"
    const block = blocks.find((b) => b.id === blockId)
    return block ? block.block_code : "—"
  }

  const colCount = 10

  if (loading && (!rows || rows.length === 0)) {
    return (
      <div className="blk-table-wrap">
        <table className="blk-table">
          <thead>
            <tr>
              <th className="blk-th">No.</th>
              <th className="blk-th">Ticket No</th>
              <th className="blk-th">Vehicle Plate</th>
              <th className="blk-th">Vendor Name</th>
              <th className="blk-th">Block Code</th>
              <th className="blk-th blk-td--number">Weight In (ton)</th>
              <th className="blk-th blk-td--number">Weight Out (ton)</th>
              <th className="blk-th blk-td--number">Net Weight (ton)</th>
              <th className="blk-th">Date</th>
              <th className="blk-th blk-th--actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <SkeletonRows colCount={colCount} />
          </tbody>
        </table>
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
    )
  }

  return (
    <div className="blk-table-wrap">
      <table className="blk-table">
        <thead>
          <tr>
            <th className="blk-th">No.</th>
            <th className="blk-th">Ticket No</th>
            <th className="blk-th">Vehicle Plate</th>
            <th className="blk-th">Vendor Name</th>
            <th className="blk-th">Block Code</th>
            <th className="blk-th blk-td--number">Weight In (ton)</th>
            <th className="blk-th blk-td--number">Weight Out (ton)</th>
            <th className="blk-th blk-td--number">Net Weight (ton)</th>
            <th className="blk-th">Date</th>
            <th className="blk-th blk-th--actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={colCount} className="blk-td blk-td--empty">
                <div style={{ padding: "1.5rem 0" }}>
                  <p style={{ margin: "0 0 0.5rem", fontSize: "2rem" }}>🚛</p>
                  <p style={{ margin: 0, fontWeight: 700, color: "var(--text-primary)" }}>
                    Belum ada transaksi hauling
                  </p>
                  <p style={{ margin: "0.35rem 0 0", fontSize: "0.88rem" }}>
                    Klik &quot;Add Transaction&quot; untuk mencatat pengangkutan TBS pertama Anda.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={row.id} className="blk-tr">
                <td className="blk-td">{index + 1}</td>
                <td className="blk-td blk-td--mono">{row.ticket_no}</td>
                <td className="blk-td blk-td--mono">{row.vehicle_plate}</td>
                <td className="blk-td">{getVendorName(row.vendor_id)}</td>
                <td className="blk-td blk-td--mono">{getBlockCode(row.block_id)}</td>
                <td className="blk-td blk-td--number">{formatWeight(row.weight_in)}</td>
                <td className="blk-td blk-td--number">{formatWeight(row.weight_out)}</td>
                <td className="blk-td blk-td--number">
                  <strong>{formatWeight(row.net_weight)}</strong>
                </td>
                <td className="blk-td">{formatDate(row.created_at)}</td>
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
  )
}

export default HaulingTable
