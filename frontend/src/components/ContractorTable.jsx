import ContractorLogoCell from "./ContractorLogoCell"

function formatModifiedDate(contractor) {
  const raw = contractor.updated_at || contractor.created_at
  if (!raw) return "—"
  try {
    const d = new Date(raw)
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d)
  } catch {
    return "—"
  }
}

function ContractorTable({ contractors, loading, onEdit, onDelete }) {
  if (loading && (!contractors || contractors.length === 0)) {
    return (
      <div className="mdc-table-wrap">
        <div className="mdc-table-loading">Memuat data kontraktor…</div>
      </div>
    )
  }

  return (
    <div className="mdc-table-wrap">
      <table className="mdc-table">
        <thead>
          <tr>
            <th className="mdc-th mdc-th--logo">Contractor Logo</th>
            <th className="mdc-th">Code</th>
            <th className="mdc-th">Name</th>
            <th className="mdc-th">Type</th>
            <th className="mdc-th">Modified Date</th>
            <th className="mdc-th">Modified By</th>
            <th className="mdc-th mdc-th--status">Status</th>
            {(onEdit || onDelete) && <th className="mdc-th mdc-th--actions">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {contractors.length === 0 ? (
            <tr>
              <td colSpan={onEdit || onDelete ? 8 : 7} className="mdc-td mdc-td--empty">
                Belum ada data kontraktor.
              </td>
            </tr>
          ) : (
            contractors.map((row) => (
              <tr key={row.id} className="mdc-tr">
                <td className="mdc-td mdc-td--logo">
                  <ContractorLogoCell contractor={row} />
                </td>
                <td className="mdc-td mdc-td--mono">{row.code}</td>
                <td className="mdc-td">{row.name}</td>
                <td className="mdc-td">{row.type || "—"}</td>
                <td className="mdc-td mdc-td--muted">{formatModifiedDate(row)}</td>
                <td className="mdc-td mdc-td--muted">—</td>
                <td className="mdc-td">
                  <span className={row.status ? "mdc-badge mdc-badge--on" : "mdc-badge mdc-badge--off"}>
                    {row.status ? "Active" : "Inactive"}
                  </span>
                </td>
                {(onEdit || onDelete) && (
                  <td className="mdc-td mdc-td--actions" style={styles.actionsCell}>
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        style={styles.btnEdit}
                        title="Edit kontraktor"
                      >
                        ✏️ Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(row.id)}
                        style={styles.btnDelete}
                        title="Hapus kontraktor"
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

export default ContractorTable

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
