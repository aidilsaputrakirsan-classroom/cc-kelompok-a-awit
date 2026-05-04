import { useCallback, useEffect, useState } from "react"
import { useOutletContext } from "react-router-dom"
import { fetchVendors, createVendor, updateVendor, deleteVendor } from "../services/api"
import ContractorTable from "../components/ContractorTable"
import ContractorPagination from "../components/ContractorPagination"
import ContractorForm from "../components/ContractorForm"
import "./MasterDataContractorPage.css"

/**
 * Master Data Contractor — data dari GET /api/vendors (Contractors).
 */
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
    <div className="mdc-page">
      <div className="mdc-page__toolbar">
        <div className="mdc-page__titles">
          <h1>Master Data Contractor</h1>
          <p>
            PalmTrack Cloud — kelola data kontraktor / vendor transport. Data diambil dari endpoint
            {" "}
            <code style={{ fontSize: "0.8em" }}>/api/vendors</code>.
          </p>
        </div>
        <div className="mdc-page__actions">
          <form onSubmit={handleSearchSubmit}>
            <input
              type="search"
              className="mdc-search"
              placeholder="Cari code / nama…"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              aria-label="Cari kontraktor"
            />
          </form>
          <button
            type="button"
            className="mdc-btn-add"
            onClick={openModal}
            disabled={actionLoading}
          >
            + Add New
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="mdc-modal-overlay">
          <div className="mdc-modal" role="dialog" aria-modal="true">
            <div className="mdc-modal__header">
              <h2 className="mdc-modal__title">
                {editingContractor ? "Edit Contractor" : "Add Contractor"}
              </h2>
              <button
                type="button"
                className="mdc-modal__close"
                onClick={closeModal}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <ContractorForm
              onSubmit={handleSubmit}
              editingContractor={editingContractor}
              onCancel={closeModal}
              loading={actionLoading}
            />
          </div>
        </div>
      )}

      <ContractorTable
        contractors={contractors}
        loading={loading || actionLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ContractorPagination
        total={total}
        skip={skip}
        limit={limit}
        disabled={loading || actionLoading}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />
    </div>
  )
}

export default MasterDataContractorPage
