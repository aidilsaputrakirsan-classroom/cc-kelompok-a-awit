import { useCallback, useEffect, useState } from "react"
import { useOutletContext } from "react-router-dom"
import { fetchVendors, createVendor, updateVendor, deleteVendor } from "../services/api"
import ContractorTable from "../components/ContractorTable"
import ContractorPagination from "../components/ContractorPagination"
import ContractorForm from "../components/ContractorForm"

function MasterDataContractorPage({ onUnauthorized: onUnauthorizedProp, onNotify: onNotifyProp }) {
  const outlet = useOutletContext()
  const onUnauthorized = onUnauthorizedProp ?? outlet?.onUnauthorized
  const onNotify = onNotifyProp ?? outlet?.showToast
  const [contractors, setContractors] = useState([])
  const [total, setTotal] = useState(0)
  const [skip, setSkip] = useState(0)
  const [limit, setLimit] = useState(20)
  const [search, setSearch] = useState("")
  const [searchDraft, setSearchDraft] = useState("")
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [editingContractor, setEditingContractor] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchVendors({ skip, limit, search: search.trim() || undefined })
      setContractors(data.vendors || [])
      setTotal(typeof data.total === "number" ? data.total : 0)
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        onUnauthorized?.()
      } else {
        onNotify?.(err.message || "Gagal memuat kontraktor", "error")
        setContractors([])
        setTotal(0)
      }
    } finally {
      setLoading(false)
    }
  }, [skip, limit, search, onUnauthorized, onNotify])

  useEffect(() => {
    load()
  }, [load])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setSkip(0)
    setSearch(searchDraft)
  }

  const handlePageChange = (page) => {
    if (page < 1) return
    if (total === 0) return
    const maxPage = Math.max(1, Math.ceil(total / limit))
    if (page > maxPage) return
    setSkip((page - 1) * limit)
  }

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit)
    setSkip(0)
  }

  const handleSubmit = async (contractorData, editId) => {
    setActionLoading(true)
    try {
      if (editId) {
        await updateVendor(editId, contractorData)
        setEditingContractor(null)
        onNotify?.("Kontraktor berhasil diperbarui", "success")
      } else {
        await createVendor(contractorData)
        onNotify?.("Kontraktor berhasil ditambahkan", "success")
      }
      setIsModalOpen(false)
      load()
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        onUnauthorized?.()
      } else {
        onNotify?.(err.message || "Terjadi kesalahan", "error")
        throw err
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleEdit = (contractor) => {
    setEditingContractor(contractor)
    setIsModalOpen(true)
  }

  const openModal = () => {
    setEditingContractor(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setEditingContractor(null)
    setIsModalOpen(false)
  }

  const handleDelete = async (id) => {
    const contractor = contractors.find((c) => c.id === id)
    if (!window.confirm(`Yakin ingin menghapus kontraktor "${contractor?.name}"?`)) return
    setActionLoading(true)
    try {
      await deleteVendor(id)
      onNotify?.("Kontraktor berhasil dihapus", "success")
      load()
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        onUnauthorized?.()
      } else {
        onNotify?.(err.message || "Gagal menghapus kontraktor", "error")
      }
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Master Data Contractor</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            PalmTrack Cloud — kelola data kontraktor / vendor transport.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <form onSubmit={handleSearchSubmit} className="flex-1 sm:flex-none">
            <input
              type="search"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder="Cari code / nama…"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              aria-label="Cari kontraktor"
            />
          </form>
          <button
            type="button"
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
            onClick={openModal}
            disabled={actionLoading}
          >
            + Add New
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" role="dialog" aria-modal="true">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {editingContractor ? "Edit Contractor" : "Add Contractor"}
              </h2>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                onClick={closeModal}
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">
              <ContractorForm
                onSubmit={handleSubmit}
                editingContractor={editingContractor}
                onCancel={closeModal}
                loading={actionLoading}
              />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        <ContractorTable
          contractors={contractors}
          loading={loading || actionLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50">
          <ContractorPagination
            total={total}
            skip={skip}
            limit={limit}
            disabled={loading || actionLoading}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </div>
      </div>
    </div>
  )
}

export default MasterDataContractorPage
