import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import {
  syncTokenFromStorage,
  getToken,
  clearToken,
  fetchVendors,
  fetchBlocks,
} from "../services/api"
import HaulingTable from "../components/HaulingTable"
import HaulingModal from "../components/HaulingModal"
import "./BlocksPage.css"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

const INITIAL_FORM = {
  ticket_no: "",
  vendor_id: "",
  block_id: "",
  vehicle_plate: "",
  weight_in: "",
  weight_out: "",
}

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
      throw new Error("NETWORK_ERROR")
    }
    throw err
  }
}

async function fetchHaulingTransactions({ vendor_id, block_id } = {}) {
  const params = new URLSearchParams()
  params.append("skip", "0")
  params.append("limit", "1000")
  if (vendor_id) params.append("vendor_id", vendor_id)
  if (block_id) params.append("block_id", block_id)
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
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState("add")
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [filters, setFilters] = useState({ search: "", vendor_id: "", block_id: "" })
  const [submitting, setSubmitting] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

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
      const text = message || "Terjadi kesalahan"
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
      if (err.message === "NETWORK_ERROR") {
        notifyError("Gagal terhubung ke server")
        return
      }
      notifyError(err.message)
    },
    [handleUnauthorized, notifyError],
  )

  const loadMasterData = useCallback(async () => {
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
      } else if (err instanceof TypeError) {
        notifyError("Gagal terhubung ke server")
      } else {
        notifyError(err.message || "Gagal memuat data master")
      }
    }
  }, [handleUnauthorized, notifyError])

  const loadTransactions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchHaulingTransactions({
        vendor_id: filters.vendor_id || undefined,
        block_id: filters.block_id || undefined,
      })
      setTransactions(data.transactions || [])
    } catch (err) {
      handleApiError(err)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [filters.vendor_id, filters.block_id, handleApiError])

  useEffect(() => {
    syncTokenFromStorage()
    loadMasterData()
  }, [loadMasterData])

  useEffect(() => {
    syncTokenFromStorage()
    loadTransactions()
  }, [loadTransactions])

  const filteredRows = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    if (!q) return transactions
    return transactions.filter((t) =>
      (t.ticket_no || "").toLowerCase().includes(q),
    )
  }, [transactions, filters.search])

  const openAddModal = () => {
    setModalMode("add")
    setSelectedTransaction(null)
    setFormData(INITIAL_FORM)
    setModalOpen(true)
  }

  const openEditModal = (row) => {
    setModalMode("edit")
    setSelectedTransaction(row)
    setFormData({
      ticket_no: row.ticket_no || "",
      vendor_id: row.vendor_id || "",
      block_id: row.block_id || "",
      vehicle_plate: row.vehicle_plate || "",
      weight_in: row.weight_in != null ? String(row.weight_in) : "",
      weight_out: row.weight_out != null ? String(row.weight_out) : "",
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    if (submitting) return
    setModalOpen(false)
    setSelectedTransaction(null)
    setFormData(INITIAL_FORM)
  }

  const handleSubmit = async (payload) => {
    setSubmitting(true)
    try {
      if (modalMode === "edit" && selectedTransaction?.id) {
        await updateHaulingTransaction(selectedTransaction.id, payload)
        showToast?.("Transaksi berhasil diperbarui", "success")
      } else {
        await createHaulingTransaction(payload)
        showToast?.("Transaksi berhasil ditambahkan", "success")
      }
      setModalOpen(false)
      setSelectedTransaction(null)
      setFormData(INITIAL_FORM)
      await loadTransactions()
    } catch (err) {
      handleApiError(err)
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (row) => {
    if (
      !window.confirm(
        `Hapus transaksi "${row.ticket_no}"? Tindakan ini tidak dapat dibatalkan.`,
      )
    ) {
      return
    }
    setActionLoading(true)
    try {
      await deleteHaulingTransaction(row.id)
      showToast?.("Transaksi berhasil dihapus", "success")
      await loadTransactions()
    } catch (err) {
      handleApiError(err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const handleResetFilters = async () => {
    setFilters({ search: "", vendor_id: "", block_id: "" })
    setLoading(true)
    setError(null)
    try {
      const data = await fetchHaulingTransactions({})
      setTransactions(data.transactions || [])
    } catch (err) {
      handleApiError(err)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="blk-page">
      <div className="blk-page__toolbar">
        <div className="blk-page__titles">
          <h1>Actual Hauling</h1>
          <p>
            PalmTrack Cloud — pencatatan transaksi pengangkutan TBS. Data dari{" "}
            <code style={{ fontSize: "0.8em" }}>/api/hauling-transactions</code>.
          </p>
        </div>
        <div className="blk-page__actions">
          <button
            type="button"
            className="blk-btn-add"
            onClick={openAddModal}
            disabled={loading || actionLoading || submitting}
          >
            Add Transaction
          </button>
        </div>
      </div>

      <div
        className="ahl-filters"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          padding: "1rem 2rem",
          borderBottom: "1px solid var(--border-color)",
          alignItems: "flex-end",
          background: "var(--card-bg)",
        }}
      >
        <div style={{ flex: "1 1 180px", minWidth: 160 }}>
          <label
            htmlFor="ahl-search"
            style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, marginBottom: 4 }}
          >
            Cari Ticket No
          </label>
          <input
            id="ahl-search"
            type="search"
            className="blk-search"
            style={{ width: "100%" }}
            placeholder="Ticket no…"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>
        <div style={{ flex: "1 1 160px", minWidth: 140 }}>
          <label
            htmlFor="ahl-vendor"
            style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, marginBottom: 4 }}
          >
            Filter Vendor
          </label>
          <select
            id="ahl-vendor"
            className="blk-search"
            style={{ width: "100%" }}
            value={filters.vendor_id}
            onChange={(e) => handleFilterChange("vendor_id", e.target.value)}
          >
            <option value="">Semua vendor</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ flex: "1 1 160px", minWidth: 140 }}>
          <label
            htmlFor="ahl-block"
            style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, marginBottom: 4 }}
          >
            Filter Block
          </label>
          <select
            id="ahl-block"
            className="blk-search"
            style={{ width: "100%" }}
            value={filters.block_id}
            onChange={(e) => handleFilterChange("block_id", e.target.value)}
          >
            <option value="">Semua blok</option>
            {blocks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.block_code}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="blk-page-btn"
          onClick={handleResetFilters}
          disabled={loading}
        >
          Reset Filters
        </button>
      </div>

      {error && !loading && (
        <div
          role="alert"
          style={{
            margin: "0 2rem",
            padding: "0.75rem 1rem",
            background: "#f8d7da",
            color: "#721c24",
            borderRadius: 8,
            border: "1px solid #f5c6cb",
            fontSize: "0.88rem",
          }}
        >
          {error}
        </div>
      )}

      <HaulingTable
        rows={filteredRows}
        vendors={vendors}
        blocks={blocks}
        loading={loading || actionLoading}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <HaulingModal
        open={modalOpen}
        mode={modalMode}
        formData={formData}
        onFormChange={setFormData}
        vendors={activeVendors}
        blocks={blocks}
        onSubmit={handleSubmit}
        onClose={closeModal}
        submitting={submitting}
      />
    </div>
  )
}

export default ActualHauling
