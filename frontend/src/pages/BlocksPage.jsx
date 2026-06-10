import { useCallback, useEffect, useState } from "react"
import { useOutletContext } from "react-router-dom"
import { fetchBlocks, createBlock, updateBlock, deleteBlock, fetchVendors } from "../services/api"
import BlockTable from "../components/BlockTable"
import BlockForm from "../components/BlockForm"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>
            Showing <strong className="font-semibold text-gray-900 dark:text-gray-100">{skip + 1}</strong> to <strong className="font-semibold text-gray-900 dark:text-gray-100">{Math.min(skip + limit, total)}</strong> of{" "}
            <strong className="font-semibold text-gray-900 dark:text-gray-100">{total}</strong> blocks
          </span>
          <label className="flex items-center gap-2">
            <span>Per Page:</span>
            <select
              value={limit}
              onChange={(e) => handleLimitChange(parseInt(e.target.value))}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md py-1 pl-2 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
              disabled={loading || actionLoading}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page <strong className="font-semibold text-gray-900 dark:text-gray-100">{currentPage}</strong> of <strong className="font-semibold text-gray-900 dark:text-gray-100">{maxPage}</strong>
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || loading || actionLoading}
              title="First Page"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              type="button"
              className="p-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading || actionLoading}
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="p-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === maxPage || loading || actionLoading}
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              className="p-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={() => handlePageChange(maxPage)}
              disabled={currentPage === maxPage || loading || actionLoading}
              title="Last Page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Block / Area Master Data</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage palm oil plantation blocks and areas.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <form onSubmit={handleSearchSubmit} className="flex-1 sm:flex-none">
            <input
              type="search"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder="Search block code or division…"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              aria-label="Search blocks"
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
                {editingBlock ? "Edit Block" : "Add Block"}
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
              <BlockForm
                onSubmit={handleSubmit}
                editingBlock={editingBlock}
                onCancel={closeModal}
                loading={actionLoading}
              />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        <BlockTable
          blocks={blocks}
          vendors={vendors}
          loading={loading || actionLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        {renderPagination()}
      </div>
    </div>
  )
}

export default BlocksPage
