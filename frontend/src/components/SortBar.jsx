function SortBar({ sortBy, onSortChange }) {
  return (
    <div style={styles.sortContainer}>
      <label htmlFor="sort-select" style={styles.label}>
        📊 Urutkan berdasarkan:
      </label>
      <select
        id="sort-select"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        style={styles.select}
      >
        <option value="terbaru">Terbaru</option>
        <option value="nama">Nama (A-Z)</option>
        <option value="harga">Harga (Rendah ke Tinggi)</option>
      </select>
    </div>
  )
}

const styles = {
  sortContainer: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1.5rem",
    padding: "1rem",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
  },
  label: {
    fontSize: "1rem",
    fontWeight: "500",
    color: "#333",
    margin: 0,
    whiteSpace: "nowrap",
  },
  select: {
    padding: "0.5rem 0.75rem",
    fontSize: "1rem",
    border: "2px solid #ddd",
    borderRadius: "6px",
    backgroundColor: "white",
    cursor: "pointer",
    outline: "none",
    transition: "border-color 0.2s",
  },
}

export default SortBar
