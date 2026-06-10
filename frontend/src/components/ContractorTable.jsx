import { Edit2, Trash2 } from "lucide-react"
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
      <div className="w-full overflow-x-auto min-h-[300px] flex items-center justify-center">
        <div className="text-sm text-gray-500 animate-pulse flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Memuat data kontraktor…
        </div>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-600 dark:text-gray-400 min-w-[800px]">
        <thead className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 uppercase border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th className="px-6 py-4 font-semibold text-center w-24">Logo</th>
            <th className="px-6 py-4 font-semibold">Code</th>
            <th className="px-6 py-4 font-semibold">Name</th>
            <th className="px-6 py-4 font-semibold">Type</th>
            <th className="px-6 py-4 font-semibold">Modified Date</th>
            <th className="px-6 py-4 font-semibold">Modified By</th>
            <th className="px-6 py-4 font-semibold text-center">Status</th>
            {(onEdit || onDelete) && <th className="px-6 py-4 font-semibold text-center">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
          {contractors.length === 0 ? (
            <tr>
              <td colSpan={onEdit || onDelete ? 8 : 7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50">
                Belum ada data kontraktor.
              </td>
            </tr>
          ) : (
            contractors.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-3">
                  <ContractorLogoCell contractor={row} />
                </td>
                <td className="px-6 py-3 font-mono text-sm">{row.code}</td>
                <td className="px-6 py-3 font-medium text-gray-900 dark:text-gray-100">{row.name}</td>
                <td className="px-6 py-3">{row.type || "—"}</td>
                <td className="px-6 py-3 text-gray-500 dark:text-gray-400">{formatModifiedDate(row)}</td>
                <td className="px-6 py-3 text-gray-500 dark:text-gray-400">—</td>
                <td className="px-6 py-3 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${row.status ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"}`}>
                    {row.status ? "Active" : "Inactive"}
                  </span>
                </td>
                {(onEdit || onDelete) && (
                  <td className="px-6 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(row)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                          title="Edit kontraktor"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(row.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                          title="Hapus kontraktor"
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
  )
}

export default ContractorTable
