import { useState, useEffect, useCallback } from "react"
import { useOutletContext } from "react-router-dom"
import SearchBar from "../components/SearchBar"
import ItemForm from "../components/ItemForm"
import ItemList from "../components/ItemList"
import { useAuth } from "../context/AuthContext"
import { fetchItems, createItem, updateItem, deleteItem } from "../services/api"

function ItemsPage() {
  const { logout } = useAuth()
  const { showToast } = useOutletContext() || {}

  const [items, setItems] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")

  const loadItems = useCallback(async (search = "") => {
    setLoading(true)
    try {
      const data = await fetchItems(search)
      setItems(data.items)
      setTotalItems(data.total)
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        logout()
      } else {
        console.error("Error loading items:", err)
        showToast?.("Gagal memuat data", "error")
      }
    } finally {
      setLoading(false)
    }
  }, [logout, showToast])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const handleSubmit = async (itemData, editId) => {
    setActionLoading(true)
    try {
      if (editId) {
        await updateItem(editId, itemData)
        setEditingItem(null)
        showToast?.("Item berhasil diperbarui", "success")
      } else {
        await createItem(itemData)
        showToast?.("Item berhasil ditambahkan", "success")
      }
      loadItems(searchQuery)
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        logout()
      } else {
        showToast?.(err.message || "Terjadi kesalahan", "error")
        throw err
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id) => {
    const item = items.find((i) => i.id === id)
    if (!window.confirm(`Yakin ingin menghapus "${item?.name}"?`)) return
    setActionLoading(true)
    try {
      await deleteItem(id)
      showToast?.("Item berhasil dihapus", "success")
      loadItems(searchQuery)
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        logout()
      } else {
        showToast?.(err.message || "Gagal menghapus item", "error")
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    loadItems(query)
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <p style={{ marginBottom: "1rem", color: "#555", fontSize: "0.9rem" }}>
        Demo modul items (endpoint <code>/items</code>). Tidak ditampilkan di sidebar.
      </p>
      <ItemForm
        onSubmit={handleSubmit}
        editingItem={editingItem}
        onCancelEdit={() => setEditingItem(null)}
        loading={actionLoading}
      />
      <SearchBar onSearch={handleSearch} />
      <ItemList
        items={items}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading || actionLoading}
      />
    </div>
  )
}

export default ItemsPage
