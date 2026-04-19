import { useState, useEffect, useRef } from "react"

function ContractorForm({ onSubmit, editingContractor, onCancel, loading }) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "",
    status: "active",
  })
  const [error, setError] = useState("")
  const [fileName, setFileName] = useState("")
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (editingContractor) {
      setFormData({
        code: editingContractor.code || "",
        name: editingContractor.name || "",
        type: editingContractor.type || "",
        status: editingContractor.status ? "active" : "inactive",
      })
      setFileName("")
    } else {
      setFormData({
        code: "",
        name: "",
        type: "",
        status: "active",
      })
      setFileName("")
    }
    setError("")
  }, [editingContractor])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    setFileName(file ? file.name : "")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!formData.code.trim()) {
      setError("Kode kontraktor wajib diisi")
      return
    }
    if (!formData.name.trim()) {
      setError("Nama kontraktor wajib diisi")
      return
    }

    const contractorData = {
      code: formData.code.trim(),
      name: formData.name.trim(),
      type: formData.type.trim() || null,
      status: formData.status === "active",
    }

    try {
      await onSubmit(contractorData, editingContractor?.id)
      setFormData({
        code: "",
        name: "",
        type: "",
        status: "active",
      })
      setFileName("")
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div style={styles.container}>
      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.uploadCard} onClick={() => fileInputRef.current?.click()}>
        <div style={styles.uploadIcon}>+</div>
        <div style={styles.uploadTitle}>Contractor Logo</div>
        <div style={styles.uploadSubtitle}>
          {fileName || "Drag & drop atau klik untuk memilih file"}
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={styles.fileInput}
        />
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>Contractor Code</label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="Contoh: IWA"
            style={styles.input}
            disabled={loading || !!editingContractor}
            maxLength="10"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Contractor Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Contoh: PT. IWACO Jaya Abadi"
            style={styles.input}
            disabled={loading}
            maxLength="100"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Contractor Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            style={styles.select}
            disabled={loading}
          >
            <option value="">Pilih tipe kontraktor</option>
            <option value="Coal Mining">Coal Mining</option>
            <option value="Coal Hauling">Coal Hauling</option>
            <option value="Other">Other</option>
          </select>
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div style={styles.actions}>
          <button type="button" onClick={onCancel} style={styles.btnCancel} disabled={loading}>
            Cancel
          </button>
          <button type="submit" style={styles.btnSubmit} disabled={loading}>
            {loading ? "⏳ Saving..." : editingContractor ? "Save Changes" : "Save"}
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
  uploadCard: {
    border: "2px dashed rgba(50, 50, 50, 0.3)",
    borderRadius: "16px",
    padding: "1.5rem",
    minHeight: "180px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "#323232",
    cursor: "pointer",
    backgroundColor: "#fafafa",
  },
  uploadIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    border: "2px solid rgba(50, 50, 50, 0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    marginBottom: "0.75rem",
    color: "#323232",
  },
  uploadTitle: {
    fontWeight: 700,
    marginBottom: "0.35rem",
    color: "#323232",
  },
  uploadSubtitle: {
    color: "rgba(50, 50, 50, 0.7)",
    fontSize: "0.9rem",
  },
  fileInput: {
    display: "none",
  },
  form: {
    display: "grid",
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
    outline: "none",
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

export default ContractorForm
