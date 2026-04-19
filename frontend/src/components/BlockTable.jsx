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
            <th className="blk-th">Area Size (Ha)</th>
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
                  <td className="blk-td blk-td--actions" style={styles.actionsCell}>
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        style={styles.btnEdit}
                        title="Edit block"
                      >
                        ✏️ Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(row.id)}
                        style={styles.btnDelete}
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

const styles = {
  actionsCell: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
  },
  btnEdit: {
    padding: "0.4rem 0.8rem",
    backgroundColor: "#4472C4",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "bold",
  },
  btnDelete: {
    padding: "0.4rem 0.8rem",
    backgroundColor: "#C00000",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "bold",
  },
}

export default BlockTable
