import React, { useEffect } from "react";

function DeleteConfirmDialog({ open, ticketNo, onConfirm, onCancel, loading, error }) {
  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open && !loading) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div className="blk-modal-overlay" onClick={onCancel} role="presentation">
      <div
        className="blk-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "450px", width: "95%", textAlign: "center", padding: "2rem" }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
        
        <h2 id="delete-dialog-title" style={{ marginTop: 0, marginBottom: "1rem", color: "var(--text-primary)" }}>
          Konfirmasi Hapus
        </h2>
        
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", lineHeight: 1.5 }}>
          Hapus transaksi tiket <strong>{ticketNo}</strong>? Tindakan ini tidak dapat dibatalkan.
        </p>

        {error && (
          <div style={{
            backgroundColor: "#FBE5D6",
            color: "#C00000",
            padding: "0.9rem 1rem",
            borderRadius: "8px",
            fontSize: "0.9rem",
            marginBottom: "1.5rem",
            textAlign: "left"
          }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "transparent",
              color: "var(--text-primary, #323232)",
              border: "1px solid var(--border-color, #323232)",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#ba352c",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            {loading ? "⏳ Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmDialog;
