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

function ContractorTable({ contractors, loading }) {
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
          </tr>
        </thead>
        <tbody>
          {contractors.length === 0 ? (
            <tr>
              <td colSpan={7} className="mdc-td mdc-td--empty">
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
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default ContractorTable
