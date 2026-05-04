import { useState, useEffect } from "react"
import { fetchVendors } from "../services/api"

function BlockForm({ onSubmit, editingBlock, onCancel, loading }) {
  const [formData, setFormData] = useState({
    block_code: "",
    division: "",
    hectarage: "",
    status: "active",
    vendor_id: "",
  })
  const [error, setError] = useState("")
  const [vendors, setVendors] = useState([])
  const [loadingVendors, setLoadingVendors] = useState(false)

  // Fetch vendors filtered by type === "Palm Oil Harvester"
  useEffect(() => {
    const fetchFilteredVendors = async () => {
      setLoadingVendors(true)
      try {
        const data = await fetchVendors({ limit: 1000 })
        const filtered = (data.vendors || []).filter(
          (v) => v.type === "Palm Oil Harvester"
        )
        setVendors(filtered)
      } catch (err) {
        console.error("Failed to fetch vendors:", err)
        setVendors([])
      } finally {
        setLoadingVendors(false)
      }
    }
    fetchFilteredVendors()
  }, [])

  useEffect(() => {
    if (editingBlock) {
      setFormData({
        block_code: editingBlock.block_code || "",
        division: editingBlock.division || "",
        hectarage: editingBlock.hectarage ? String(editingBlock.hectarage) : "",
        status: editingBlock.status ? "active" : "inactive",
        vendor_id: editingBlock.vendor_id || "",
      })
    } else {
      setFormData({
        block_code: "",
        division: "",
        hectarage: "",
        status: "active",
        vendor_id: "",
      })
    }
    setError("")
  }, [editingBlock])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!formData.block_code.trim()) {
      setError("Block Code wajib diisi")
      return
    }
    if (!formData.division.trim()) {
      setError("Division wajib diisi")
      return
    }
    if (!formData.hectarage || parseFloat(formData.hectarage) <= 0) {
      setError("Area Size harus lebih dari 0")
      return
    }

    const blockData = {
      block_code: formData.block_code.trim(),
      division: formData.division.trim(),
      hectarage: parseFloat(formData.hectarage),
      status: formData.status === "active",
      vendor_id: formData.vendor_id || null,
    }

    try {
      await onSubmit(blockData, editingBlock?.id)
      setFormData({
        block_code: "",
        division: "",
        hectarage: "",
        status: "active",
        vendor_id: "",
      })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div style={styles.container}>
      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Block Code *</label>
            <input
              type="text"
              name="block_code"
              value={formData.block_code}
              onChange={handleChange}
              placeholder="Contoh: BLK-A1"
              style={styles.input}
              disabled={loading || !!editingBlock}
              maxLength="10"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Division / Area Name *</label>
            <input
              type="text"
              name="division"
              value={formData.division}
              onChange={handleChange}
              placeholder="Contoh: Afdeling 1"
              style={styles.input}
              disabled={loading}
            />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Area Size (Ha) *</label>
            <input
              type="number"
              name="hectarage"
              value={formData.hectarage}
              onChange={handleChange}
              placeholder="Contoh: 50.25"
              style={styles.input}
              disabled={loading}
              step="0.01"
              min="0"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Responsible Contractor</label>
            <select
              name="vendor_id"
              value={formData.vendor_id}
              onChange={handleChange}
              style={styles.select}
              disabled={loading || loadingVendors}
            >
              <option value="">Select Contractor...</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={styles.select}
            disabled={loading}
          >
            <option value="active" style={styles.option}>
              Active
            </option>
            <option value="inactive" style={styles.option}>
              Inactive
            </option>
          </select>
        </div>

        <div style={styles.actions}>
          <button type="button" onClick={onCancel} style={styles.btnCancel} disabled={loading}>
            Cancel
          </button>
          <button type="submit" style={styles.btnSubmit} disabled={loading}>
            {loading ? "⏳ Saving..." : editingBlock ? "Save Changes" : "Save"}
          </button>
        </div>
      </form>
    </div>
  )
}

const styles = {
  container: {
    display: "grid",
    gap: "1rem",
  },
  form: {
    display: "grid",
    gap: "1rem",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },
  field: {
    display: "grid",
    gap: "0.35rem",
  },
  label: {
    color: "#323232",
    fontWeight: 700,
    fontSize: "0.9rem",
  },
  input: {
    width: "100%",
    padding: "0.9rem 1rem",
    borderRadius: "10px",
    border: "1px solid rgba(50, 50, 50, 0.18)",
    fontSize: "0.95rem",
    outline: "none",
  },
  select: {
    width: "100%",
    padding: "0.9rem 1rem",
    borderRadius: "10px",
    border: "1px solid rgba(50, 50, 50, 0.18)",
    fontSize: "0.95rem",
    backgroundColor: "white",
    color: "#323232",
    outline: "none",
  },
  option: {
    color: "#323232",
    backgroundColor: "white",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    marginTop: "0.25rem",
  },
  btnSubmit: {
    padding: "0.75rem 1.35rem",
    backgroundColor: "#ba352c",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 700,
  },
  btnCancel: {
    padding: "0.75rem 1.35rem",
    backgroundColor: "transparent",
    color: "#323232",
    border: "1px solid #323232",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 700,
  },
  error: {
    backgroundColor: "#FBE5D6",
    color: "#C00000",
    padding: "0.9rem 1rem",
    borderRadius: "8px",
    fontSize: "0.9rem",
  },
}

export default BlockForm
