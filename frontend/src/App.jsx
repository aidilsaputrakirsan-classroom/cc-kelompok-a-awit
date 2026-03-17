import { useState, useEffect, useCallback } from "react"
import Header from "./components/Header"
import SearchBar from "./components/SearchBar"
import SortBar from "./components/SortBar"
import ItemForm from "./components/ItemForm"
import ItemList from "./components/ItemList"
import Notification from "./components/Notification"
import { fetchItems, createItem, updateItem, deleteItem, checkHealth } from "./services/api"

function App() {
  // ==================== STATE ====================
  const [items, setItems] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("terbaru")
  const [notification, setNotification] = useState({ message: "", type: "" })

  // ==================== LOAD DATA ====================
  const loadItems = useCallback(async (search = "") => {
    setLoading(true)
    try {
      const data = await fetchItems(search)
      setItems(data.items)
      setTotalItems(data.total)
    } catch (err) {
      console.error("Error loading items:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  // ==================== ON MOUNT ====================
  useEffect(() => {
    // Cek koneksi API
    checkHealth().then(setIsConnected)
    // Load items
    loadItems()
  }, [loadItems])

  // ==================== HANDLERS ====================

  const handleSubmit = async (itemData, editId) => {
    try {
      if (editId) {
        // Mode edit
        await updateItem(editId, itemData)
        setEditingItem(null)
        setNotification({
          message: `Item "${itemData.name}" berhasil diupdate!`,
          type: "success",
        })
      } else {
        // Mode create
        await createItem(itemData)
        setNotification({
          message: `Item "${itemData.name}" berhasil ditambahkan!`,
          type: "success",
        })
      }
      // Reload daftar items
      loadItems(searchQuery)
    } catch (err) {
      setNotification({
        message: err.message,
        type: "error",
      })
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    // Scroll ke atas ke form
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id) => {
    const item = items.find((i) => i.id === id)
    if (!window.confirm(`Yakin ingin menghapus "${item?.name}"?`)) return

    try {
      await deleteItem(id)
      setNotification({
        message: `Item "${item?.name}" berhasil dihapus!`,
        type: "success",
      })
      loadItems(searchQuery)
    } catch (err) {
      setNotification({
        message: err.message,
        type: "error",
      })
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    loadItems(query)
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
  }

  const handleSortChange = (newSort) => {
    setSortBy(newSort)
  }

  // ==================== SORT ITEMS ====================
  const getSortedItems = () => {
    const sortedItems = [...items]

    if (sortBy === "nama") {
      sortedItems.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === "harga") {
      sortedItems.sort((a, b) => a.price - b.price)
    } else if (sortBy === "terbaru") {
      sortedItems.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )
    }

    return sortedItems
  }

  // ==================== RENDER ====================
  return (
    <div style={styles.app}>
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "" })}
      />
      <div style={styles.container}>
        <Header totalItems={totalItems} isConnected={isConnected} />
        <ItemForm
          onSubmit={handleSubmit}
          editingItem={editingItem}
          onCancelEdit={handleCancelEdit}
        />
        <SearchBar onSearch={handleSearch} />
        <SortBar sortBy={sortBy} onSortChange={handleSortChange} />
        <ItemList
          items={getSortedItems()}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>
    </div>
  )
}

const styles = {
  app: {
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    padding: "2rem",
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
}

export default App