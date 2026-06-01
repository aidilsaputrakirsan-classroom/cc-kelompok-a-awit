import React from "react";

function TransactionFormFields({ formData, onFormChange, vendors, blocks, submitting, netWeight }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "vehicle_plate") {
      onFormChange({ ...formData, [name]: value.toUpperCase() });
      return;
    }
    onFormChange({ ...formData, [name]: value });
  };

  const isNetWeightWarning = netWeight !== null && netWeight <= 0;

  return (
    <div style={styles.form}>
      <div style={styles.field}>
        <label style={styles.label}>Ticket No *</label>
        <input
          type="text"
          name="ticket_no"
          value={formData.ticket_no || ""}
          onChange={handleChange}
          placeholder="e.g. TKT-YYYYMMDD-001"
          style={styles.input}
          disabled={submitting}
          maxLength={100}
        />
        <span style={styles.hint}>Maksimal 100 karakter</span>
      </div>

      <div style={styles.row}>
        <div style={styles.field}>
          <label style={styles.label}>Vendor *</label>
          <select
            name="vendor_id"
            value={formData.vendor_id || ""}
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
            value={formData.block_id || ""}
            onChange={handleChange}
            style={styles.select}
            disabled={submitting}
          >
            <option value="">Pilih blok…</option>
            {blocks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.block_code}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.field}>
          <label style={styles.label}>Vehicle Plate *</label>
          <input
            type="text"
            name="vehicle_plate"
            value={formData.vehicle_plate || ""}
            onChange={handleChange}
            placeholder="Contoh: KT 1234 AB"
            style={{ ...styles.input, textTransform: "uppercase" }}
            disabled={submitting}
            maxLength={20}
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Tanggal Transaksi *</label>
          <input
            type="date"
            name="transaction_date"
            value={formData.transaction_date || ""}
            onChange={handleChange}
            style={styles.input}
            disabled={submitting}
            max={new Date().toISOString().split("T")[0]} // Tidak boleh masa depan
          />
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.field}>
          <label style={styles.label}>Weight In (ton) *</label>
          <input
            type="number"
            name="weight_in"
            value={formData.weight_in !== undefined ? formData.weight_in : ""}
            onChange={handleChange}
            style={styles.input}
            disabled={submitting}
            min={0}
            max={9999.999}
            step={0.001}
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Weight Out (ton) *</label>
          <input
            type="number"
            name="weight_out"
            value={formData.weight_out !== undefined ? formData.weight_out : ""}
            onChange={handleChange}
            style={styles.input}
            disabled={submitting}
            min={0}
            max={9999.999}
            step={0.001}
          />
        </div>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Net Weight (ton)</label>
        <div
          style={{
            ...styles.netWeight,
            background: isNetWeightWarning ? "#fff3cd" : "rgba(186, 53, 44, 0.06)",
            color: isNetWeightWarning ? "#856404" : "var(--accent-color, #ba352c)",
            borderColor: isNetWeightWarning ? "#ffeeba" : "var(--border-color, rgba(50, 50, 50, 0.25))",
          }}
        >
          {netWeight === null ? "—" : netWeight.toFixed(3)}
        </div>
        {isNetWeightWarning && (
          <span style={{ fontSize: "0.8rem", color: "#856404", marginTop: "4px" }}>
            ⚠️ Periksa kembali berat timbang
          </span>
        )}
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Catatan</label>
        <textarea
          name="notes"
          value={formData.notes || ""}
          onChange={handleChange}
          style={{ ...styles.input, minHeight: "80px", resize: "vertical" }}
          disabled={submitting}
          maxLength={500}
          placeholder="Catatan opsional..."
        />
      </div>
    </div>
  );
}

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
  },
};

export default TransactionFormFields;
