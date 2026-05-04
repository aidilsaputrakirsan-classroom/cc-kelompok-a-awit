import { useCallback, useEffect, useState } from "react"
import { useOutletContext } from "react-router-dom"
import { fetchBlocks, createBlock, updateBlock, deleteBlock, fetchVendors } from "../services/api"
import BlockTable from "../components/BlockTable"
import BlockForm from "../components/BlockForm"
import "./BlocksPage.css"

function BlocksPage() {
  const outlet = useOutletContext() || {}
  const { showToast } = outlet

  const [blocks, setBlocks] = useState([])
  const [vendors, setVendors] = useState([])
  const [total, setTotal] = useState(0)
  const [skip, setSkip] = useState(0)
  const [limit, setLimit] = useState(20)
  const [search, setSearch] = useState("")
  const [searchDraft, setSearchDraft] = useState("")
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [editingBlock, setEditingBlock] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Load blocks data
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchBlocks({ skip, limit, search: search.trim() || undefined })
      setBlocks(data.blocks || [])
      setTotal(typeof data.total === "number" ? data.total : 0)
    } catch (err) {
      showToast?.(err.message || "Failed to load blocks", "error")
      setBlocks([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [skip, limit, search, showToast])

  // Load vendors data
  const loadVendors = useCallback(async () => {
    try {
      const data = await fetchVendors({ limit: 1000 })
      setVendors(data.vendors || [])
    } catch (err) {
      console.error("Failed to load vendors:", err)
      setVendors([])
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    loadVendors()
  }, [loadVendors])

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

  const handleSubmit = async (blockData, editId) => {
    setActionLoading(true)
    try {
      if (editId) {
        await updateBlock(editId, blockData)
        setEditingBlock(null)
        showToast?.("Block updated successfully", "success")
      } else {
        await createBlock(blockData)
        showToast?.("Block created successfully", "success")
      }
      setIsModalOpen(false)
      load()
    } catch (err) {
      showToast?.(err.message || "Error saving block", "error")
      throw err
    } finally {
      setActionLoading(false)
    }
  }

  const handleEdit = (block) => {
    setEditingBlock(block)
    setIsModalOpen(true)
  }

  const openModal = () => {
    setEditingBlock(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setEditingBlock(null)
    setIsModalOpen(false)
  }

  const handleDelete = async (id) => {
    const block = blocks.find((b) => b.id === id)
    if (!window.confirm(`Delete block "${block?.block_code}"?`)) return
    setActionLoading(true)
    try {
      await deleteBlock(id)
      showToast?.("Block deleted successfully", "success")
      load()
    } catch (err) {
      showToast?.(err.message || "Failed to delete block", "error")
    } finally {
      setActionLoading(false)
    }
  }

  // Pagination component
  const renderPagination = () => {
    if (total === 0) return null
    const currentPage = Math.floor(skip / limit) + 1
    const maxPage = Math.ceil(total / limit)

    return (
      <div className="blk-pagination">
        <div className="blk-pagination__info">
          <span className="blk-pagination__label">
            Showing <strong>{skip + 1}</strong> to <strong>{Math.min(skip + limit, total)}</strong> of{" "}
            <strong>{total}</strong> blocks
          </span>
        </div>
        <div className="blk-pagination__controls">
          <button
            type="button"
            className="blk-page-btn"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1 || loading || actionLoading}
          >
            First
          </button>
          <button
            type="button"
            className="blk-page-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading || actionLoading}
          >
            Previous
          </button>
          <span className="blk-pagination__page">
            Page <strong>{currentPage}</strong> of <strong>{maxPage}</strong>
          </span>
          <button
            type="button"
            className="blk-page-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === maxPage || loading || actionLoading}
          >
            Next
          </button>
          <button
            type="button"
            className="blk-page-btn"
            onClick={() => handlePageChange(maxPage)}
            disabled={currentPage === maxPage || loading || actionLoading}
          >
            Last
          </button>
        </div>
        <div className="blk-pagination__limit">
          <label>Per Page:</label>
          <select
            value={limit}
            onChange={(e) => handleLimitChange(parseInt(e.target.value))}
            className="blk-pagination__select"
            disabled={loading || actionLoading}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    )
  }

  return (
    <div className="blk-page">
      <div className="blk-page__toolbar">
        <div className="blk-page__titles">
          <h1>Block / Area Master Data</h1>
          <p>
            Manage palm oil plantation blocks and areas. Data retrieved from{" "}
            <code style={{ fontSize: "0.8em" }}>/api/blocks</code>.
          </p>
        </div>
        <div className="blk-page__actions">
          <form onSubmit={handleSearchSubmit}>
            <input
              type="search"
              className="blk-search"
              placeholder="Search block code or division…"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              aria-label="Search blocks"
            />
          </form>
          <button
            type="button"
            className="blk-btn-add"
            onClick={openModal}
            disabled={actionLoading}
          >
            + Add New
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="blk-modal-overlay">
          <div className="blk-modal" role="dialog" aria-modal="true">
            <div className="blk-modal__header">
              <h2 className="blk-modal__title">
                {editingBlock ? "Edit Block" : "Add Block"}
              </h2>
              <button
                type="button"
                className="blk-modal__close"
                onClick={closeModal}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <BlockForm
              onSubmit={handleSubmit}
              editingBlock={editingBlock}
              onCancel={closeModal}
              loading={actionLoading}
            />
          </div>
        </div>
      )}

      <BlockTable
        blocks={blocks}
        vendors={vendors}
        loading={loading || actionLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {renderPagination()}
    </div>
  )
}

export default BlocksPage
