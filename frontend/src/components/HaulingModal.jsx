import { useEffect, useMemo, useState } from "react"

const EMPTY_FORM = {
  ticket_no: "",
  vendor_id: "",
  block_id: "",
  vehicle_plate: "",
  weight_in: "",
  weight_out: "",
}

function HaulingModal({
  open,
  mode,
  formData,
  onFormChange,
  vendors,
  blocks,
  onSubmit,
  onClose,
  submitting,
}) {
  const [localError, setLocalError] = useState("")

  useEffect(() => {
    if (open) setLocalError("")
  }, [open, mode, formData])

  const netWeight = useMemo(() => {
    const wIn = parseFloat(formData.weight_in)
    const wOut = parseFloat(formData.weight_out)
    if (Number.isNaN(wIn) || Number.isNaN(wOut)) return null
    return wIn - wOut
  }, [formData.weight_in, formData.weight_out])

  if (!open) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "vehicle_plate") {
      onFormChange({ ...formData, [name]: value.toUpperCase() })
      return
    }
    onFormChange({ ...formData, [name]: value })
  }

  const validate = () => {
    if (!formData.ticket_no.trim()) {
      return "Ticket No wajib diisi"
    }
    if (!formData.vendor_id) {
      return "Vendor wajib dipilih"
    }
    if (!formData.block_id) {
      return "Block / Area wajib dipilih"
    }
    if (!formData.vehicle_plate.trim()) {
      return "Vehicle Plate wajib diisi"
    }
    if (formData.vehicle_plate.length > 15) {
      return "Vehicle Plate maksimal 15 karakter"
    }
    const weightIn = parseFloat(formData.weight_in)
    const weightOut = parseFloat(formData.weight_out)
    if (Number.isNaN(weightIn) || weightIn < 0) {
      return "Weight In wajib diisi (min 0)"
    }
    if (Number.isNaN(weightOut) || weightOut < 0) {
      return "Weight Out wajib diisi (min 0)"
    }
    if (weightOut >= weightIn) {
      return "Weight Out harus lebih kecil dari Weight In"
    }
    return ""
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setLocalError(validationError)
      return
    }
    setLocalError("")
    const payload = {
      ticket_no: formData.ticket_no.trim(),
      vendor_id: formData.vendor_id,
      block_id: formData.block_id,
      vehicle_plate: formData.vehicle_plate.trim().toUpperCase(),
      weight_in: parseFloat(formData.weight_in),
      weight_out: parseFloat(formData.weight_out),
    }
    try {
      await onSubmit(payload)
    } catch (err) {
      setLocalError(err.message || "Gagal menyimpan transaksi")
    }
  }

  const title = mode === "edit" ? "Edit Transaction" : "Add New Transaction"

  return (
    <div className="blk-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="blk-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hauling-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="blk-modal__header">
          <h2 id="hauling-modal-title" className="blk-modal__title">
            {title}
          </h2>
          <button
            type="button"
            className="blk-modal__close"
            onClick={onClose}
            aria-label="Tutup modal"
            disabled={submitting}
          >
            ×
          </button>
        </div>

        {localError && <div style={styles.error}>{localError}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Ticket No *</label>
            <input
              type="text"
              name="ticket_no"
              value={formData.ticket_no}
              onChange={handleChange}
              placeholder="e.g. TKT-YYYYMMDD-001"
              style={styles.input}
              disabled={submitting}
              maxLength={20}
            />
            <span style={styles.hint}>Contoh format: TKT-YYYYMMDD-001</span>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Vendor *</label>
              <select
                name="vendor_id"
                value={formData.vendor_id}
                onChange={handleChange}
                style={styles.select}
                disabled={submitting}
              >
                <option value="">Pilih vendor…</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.code})
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Block / Area *</label>
              <select
                name="block_id"
                value={formData.block_id}
                onChange={handleChange}
                style={styles.select}
                disabled={submitting}
              >
                <option value="">Pilih blok…</option>
                {blocks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.block_code} — {b.division}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Vehicle Plate *</label>
            <input
              type="text"
              name="vehicle_plate"
              value={formData.vehicle_plate}
              onChange={handleChange}
              placeholder="Contoh: B1234XYZ"
              style={{ ...styles.input, textTransform: "uppercase" }}
              disabled={submitting}
              maxLength={15}
            />
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Weight In (ton) *</label>
              <input
                type="number"
                name="weight_in"
                value={formData.weight_in}
                onChange={handleChange}
                style={styles.input}
                disabled={submitting}
                min={0}
                step={0.01}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Weight Out (ton) *</label>
              <input
                type="number"
                name="weight_out"
                value={formData.weight_out}
                onChange={handleChange}
                style={styles.input}
                disabled={submitting}
                min={0}
                step={0.01}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Net Weight (ton)</label>
            <div style={styles.netWeight}>
              {netWeight === null ? "—" : netWeight.toFixed(2)}
            </div>
          </div>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              style={styles.btnCancel}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" style={styles.btnSubmit} disabled={submitting}>
              {submitting ? "⏳ Menyimpan…" : mode === "edit" ? "Save Changes" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

HaulingModal.EMPTY_FORM = EMPTY_FORM

const styles = {
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
    color: "var(--text-primary, #323232)",
    fontWeight: 700,
    fontSize: "0.9rem",
  },
  hint: {
    fontSize: "0.78rem",
    color: "var(--text-secondary, #666)",
  },
  input: {
    width: "100%",
    padding: "0.9rem 1rem",
    borderRadius: "10px",
    border: "1px solid var(--border-color, rgba(50, 50, 50, 0.18))",
    fontSize: "0.95rem",
    outline: "none",
    background: "var(--bg-secondary, #fff)",
    color: "var(--text-primary, #323232)",
  },
  select: {
    width: "100%",
    padding: "0.9rem 1rem",
    borderRadius: "10px",
    border: "1px solid var(--border-color, rgba(50, 50, 50, 0.18))",
    fontSize: "0.95rem",
    backgroundColor: "var(--bg-secondary, white)",
    color: "var(--text-primary, #323232)",
    outline: "none",
  },
  netWeight: {
    padding: "0.9rem 1rem",
    borderRadius: "10px",
    border: "1px dashed var(--border-color, rgba(50, 50, 50, 0.25))",
    fontSize: "1.1rem",
    fontWeight: 800,
    color: "var(--accent-color, #ba352c)",
    background: "rgba(186, 53, 44, 0.06)",
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
    color: "var(--text-primary, #323232)",
    border: "1px solid var(--border-color, #323232)",
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
    marginBottom: "0.5rem",
  },
}

export default HaulingModal
