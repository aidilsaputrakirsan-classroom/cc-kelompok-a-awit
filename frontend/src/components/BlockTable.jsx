function BlockTable({ blocks, vendors, loading, onEdit, onDelete }) {
  // Helper function to find vendor name by id
  const getVendorName = (vendorId) => {
    if (!vendorId) return "—"
    const vendor = vendors.find((v) => v.id === vendorId)
    return vendor ? vendor.name : "—"
  }

  if (loading && (!blocks || blocks.length === 0)) {
    return (
      <div className="blk-table-wrap">
        <div className="blk-table-loading">Loading block data…</div>
      </div>
    )
  }

  return (
    <div className="blk-table-wrap">
      <table className="blk-table">
        <thead>
          <tr>
            <th className="blk-th">Block Code</th>
            <th className="blk-th">Division / Area</th>
            <th className="blk-th">Responsible Contractor</th>
            <th className="blk-th blk-th--number">Area Size (Ha)</th>
            <th className="blk-th blk-th--status">Status</th>
            {(onEdit || onDelete) && <th className="blk-th blk-th--actions">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {blocks.length === 0 ? (
            <tr>
              <td colSpan={onEdit || onDelete ? 6 : 5} className="blk-td blk-td--empty">
                No block data available.
              </td>
            </tr>
          ) : (
            blocks.map((row) => (
              <tr key={row.id} className="blk-tr">
                <td className="blk-td blk-td--mono">{row.block_code}</td>
                <td className="blk-td">{row.division || "—"}</td>
                <td className="blk-td">{getVendorName(row.vendor_id)}</td>
                <td className="blk-td blk-td--number">{row.hectarage ? `${row.hectarage} Ha` : "—"}</td>
                <td className="blk-td">
                  <span className={row.status ? "blk-badge blk-badge--on" : "blk-badge blk-badge--off"}>
                    {row.status ? "Active" : "Inactive"}
                  </span>
                </td>
                {(onEdit || onDelete) && (
                  <td className="blk-td blk-td--actions">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        className="blk-btn-edit"
                        title="Edit block"
                      >
                        ✏️ Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(row.id)}
                        className="blk-btn-delete"
                        title="Delete block"
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default BlockTable
