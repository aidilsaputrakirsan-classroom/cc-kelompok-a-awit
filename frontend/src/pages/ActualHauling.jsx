import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import {
  syncTokenFromStorage,
  getToken,
  clearToken,
  fetchVendors,
  fetchBlocks,
} from "../services/api"

import HaulingFilterBar from "../components/hauling/HaulingFilterBar"
import HaulingTable from "../components/hauling/HaulingTable"
import AddTransactionModal from "../components/hauling/AddTransactionModal"
import EditTransactionModal from "../components/hauling/EditTransactionModal"
import DeleteConfirmDialog from "../components/hauling/DeleteConfirmDialog"
import AssignDriverModal from "../components/hauling/AssignDriverModal"
import ExportButton from "../components/hauling/ExportButton"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

function authHeaders(json = true) {
  const headers = {}
  if (json) headers["Content-Type"] = "application/json"
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

async function parseApiError(response) {
  const error = await response.json().catch(() => ({}))
  if (Array.isArray(error.detail)) {
    return error.detail
      .map((err) => (typeof err === "object" && err.msg ? err.msg : String(err)))
      .join("; ")
  }
  if (typeof error.detail === "string") return error.detail
  return `Request gagal (${response.status})`
}

async function handleHaulingResponse(response) {
  if (response.status === 401) {
    clearToken()
    throw new Error("UNAUTHORIZED")
  }
  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }
  if (response.status === 204) return null
  return response.json()
}

async function haulingFetch(path, options = {}) {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...authHeaders(options.body !== undefined),
        ...options.headers,
      },
    })
    return handleHaulingResponse(response)
  } catch (err) {
    if (err.message === "UNAUTHORIZED") throw err
    if (err instanceof TypeError) {
      throw new Error("Gagal terhubung ke server. Periksa koneksi internet Anda.")
    }
    throw err
  }
}

async function fetchHaulingTransactions(paramsObj = {}) {
  const params = new URLSearchParams()
  if (paramsObj.skip !== undefined) params.append("skip", paramsObj.skip)
  if (paramsObj.limit !== undefined) params.append("limit", paramsObj.limit)
  
  if (paramsObj.ticket_no) params.append("ticket_no", paramsObj.ticket_no)
  if (paramsObj.vendor_id) params.append("vendor_id", paramsObj.vendor_id)
  if (paramsObj.block_id) params.append("block_id", paramsObj.block_id)
  if (paramsObj.date_from) params.append("start_date", paramsObj.date_from)
  if (paramsObj.date_to) params.append("end_date", paramsObj.date_to)
  
  if (paramsObj.sort_by) params.append("sort_by", paramsObj.sort_by)
  if (paramsObj.sort_dir) params.append("sort_dir", paramsObj.sort_dir)
  
  return haulingFetch(`/api/hauling-transactions?${params}`)
}

async function createHaulingTransaction(payload) {
  return haulingFetch("/api/hauling-transactions", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

async function updateHaulingTransaction(id, payload) {
  return haulingFetch(`/api/hauling-transactions/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

async function deleteHaulingTransaction(id) {
  return haulingFetch(`/api/hauling-transactions/${id}`, {
    method: "DELETE",
  })
}

function ActualHauling() {
  const navigate = useNavigate()
  const outlet = useOutletContext() || {}
  const { showToast, onUnauthorized } = outlet

  const [transactions, setTransactions] = useState([])
  const [vendors, setVendors] = useState([])
  const [blocks, setBlocks] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [masterLoading, setMasterLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)
  const [deleteError, setDeleteError] = useState(null)

  const [filters, setFilters] = useState({
    ticket_no: "",
    vendor_id: "",
    block_id: "",
    date_from: "",
    date_to: ""
  })
  
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(val => val !== "");
  }, [filters]);

  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    total_pages: 1
  })

  const [sortConfig, setSortConfig] = useState({
    sort_by: "",
    sort_dir: ""
  })

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  
  const [selectedTransactionId, setSelectedTransactionId] = useState(null)
  const [selectedTicketNo, setSelectedTicketNo] = useState("")

  const activeVendors = useMemo(
    () => vendors.filter((v) => v.status === true),
    [vendors],
  )

  const handleUnauthorized = useCallback(() => {
    onUnauthorized?.()
    navigate("/login", { replace: true })
  }, [navigate, onUnauthorized])

  const notifyError = useCallback(
    (message) => {
      const text = message || "Terjadi kesalahan yang tidak diketahui"
      setError(text)
      showToast?.(text, "error")
    },
    [showToast],
  )

  const handleApiError = useCallback(
    (err) => {
      if (err.message === "UNAUTHORIZED") {
        handleUnauthorized()
        return
      }
      notifyError(err.message)
    },
    [handleUnauthorized, notifyError],
  )

  const loadMasterData = useCallback(async () => {
    setMasterLoading(true)
    try {
      const [vendorRes, blockRes] = await Promise.all([
        fetchVendors({ limit: 1000 }),
        fetchBlocks({ limit: 1000 }),
      ])
      setVendors(vendorRes.vendors || [])
      setBlocks(blockRes.blocks || [])
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        handleUnauthorized()
      } else {
        showToast?.("Gagal memuat data master vendor/block", "warning")
      }
    } finally {
      setMasterLoading(false)
    }
  }, [handleUnauthorized, showToast])

  const loadTransactions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const skip = (pagination.page - 1) * pagination.per_page;
      
      const data = await fetchHaulingTransactions({
        ...filters,
        skip,
        limit: pagination.per_page,
        sort_by: sortConfig.sort_by,
        sort_dir: sortConfig.sort_dir
      })
      
      setTransactions(data.transactions || data.data || [])
      
      if (data.total !== undefined) {
        setPagination(prev => ({
          ...prev,
          total: data.total,
          total_pages: Math.ceil(data.total / prev.per_page) || 1
        }))
      } else {
        setPagination(prev => ({
          ...prev,
          total: (data.transactions || data.data || []).length,
          total_pages: 1
        }))
      }
    } catch (err) {
      handleApiError(err)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.page, pagination.per_page, sortConfig, handleApiError])

  useEffect(() => {
    syncTokenFromStorage()
    loadMasterData()
  }, [loadMasterData])

  useEffect(() => {
    syncTokenFromStorage()
    loadTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page, pagination.per_page, sortConfig])

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [filters, sortConfig]);

  const openAddModal = () => {
    setAddModalOpen(true)
  }

  const openEditModal = (row) => {
    setSelectedTransactionId(row.id)
    setEditModalOpen(true)
  }

  const openAssignModal = (row) => {
    setSelectedTransactionId(row.id)
    setAssignModalOpen(true)
  }

  const openDeleteDialog = (row) => {
    setSelectedTransactionId(row.id)
    setSelectedTicketNo(row.ticket_no)
    setDeleteError(null)
    setDeleteDialogOpen(true)
  }

  const handleAddSubmit = async (payload) => {
    setActionLoading(true)
    try {
      await createHaulingTransaction(payload)
      showToast?.("Transaksi berhasil ditambahkan", "success")
      setAddModalOpen(false)
      loadTransactions()
    } catch (err) {
      throw err 
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditSubmit = async (id, payload) => {
    setActionLoading(true)
    try {
      await updateHaulingTransaction(id, payload)
      showToast?.("Transaksi berhasil diperbarui", "success")
      setEditModalOpen(false)
      loadTransactions()
    } catch (err) {
      throw err 
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    setActionLoading(true)
    setDeleteError(null)
    try {
      await deleteHaulingTransaction(selectedTransactionId)
      showToast?.("Transaksi berhasil dihapus", "success")
      setDeleteDialogOpen(false)
      loadTransactions()
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        handleUnauthorized()
        return
      }
      setDeleteError(err.message || "Gagal menghapus transaksi")
    } finally {
      setActionLoading(false)
    }
  }

  const handleAssignSubmit = async (id, payload) => {
    setActionLoading(true)
    try {
      await new Promise(res => setTimeout(res, 500))
      
      showToast?.("Driver berhasil di-assign", "success")
      setAssignModalOpen(false)
    } catch (err) {
      showToast?.("Gagal meng-assign driver", "error")
    } finally {
      setActionLoading(false)
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const handleResetFilters = () => {
    setFilters({ ticket_no: "", vendor_id: "", block_id: "", date_from: "", date_to: "" })
    setSortConfig({ sort_by: "", sort_dir: "" })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleSort = (sort_by, sort_dir) => {
    setSortConfig({ sort_by, sort_dir })
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Actual Hauling</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            PalmTrack Cloud — pencatatan transaksi pengangkutan TBS.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <ExportButton filters={filters} loading={loading} />
          
          <button
            type="button"
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
            onClick={openAddModal}
            disabled={loading || actionLoading}
          >
            + Add Transaction
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <HaulingFilterBar 
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            vendors={vendors}
            blocks={blocks}
            loading={loading}
            masterLoading={masterLoading}
          />
        </div>

        {error && !loading && (
          <div className="m-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm" role="alert">
            {error}
          </div>
        )}

        <HaulingTable
          rows={transactions}
          vendors={vendors}
          blocks={blocks}
          loading={loading}
          onEdit={openEditModal}
          onAssign={openAssignModal}
          onDelete={openDeleteDialog}
          sortConfig={sortConfig}
          onSort={handleSort}
          pagination={pagination}
          onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
          onPerPageChange={(per_page) => setPagination(prev => ({ ...prev, per_page, page: 1 }))}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {/* Modals & Dialogs */}
      <AddTransactionModal
        open={addModalOpen}
        vendors={activeVendors}
        blocks={blocks}
        onSubmit={handleAddSubmit}
        onClose={() => setAddModalOpen(false)}
        submitting={actionLoading}
      />

      <EditTransactionModal
        transactionId={selectedTransactionId}
        open={editModalOpen}
        vendors={activeVendors}
        blocks={blocks}
        onSubmit={handleEditSubmit}
        onClose={() => setEditModalOpen(false)}
      />

      <DeleteConfirmDialog 
        open={deleteDialogOpen}
        ticketNo={selectedTicketNo}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
        loading={actionLoading}
        error={deleteError}
      />

      <AssignDriverModal
        open={assignModalOpen}
        transactionId={selectedTransactionId}
        onClose={() => setAssignModalOpen(false)}
        onSubmit={handleAssignSubmit}
        submitting={actionLoading}
      />
    </div>
  )
}

export default ActualHauling
