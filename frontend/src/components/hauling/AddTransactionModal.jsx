import React, { useState, useMemo, useEffect } from "react";
import TransactionFormFields from "./TransactionFormFields";

export const EMPTY_FORM = {
  ticket_no: "",
  vendor_id: "",
  block_id: "",
  vehicle_plate: "",
  weight_in: "",
  weight_out: "",
  transaction_date: new Date().toISOString().split("T")[0],
  notes: "",
};

function AddTransactionModal({ open, vendors, blocks, onSubmit, onClose, submitting }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [localError, setLocalError] = useState("");

  // Reset form when opened
  useEffect(() => {
    if (open) {
      setFormData({ ...EMPTY_FORM, transaction_date: new Date().toISOString().split("T")[0] });
      setLocalError("");
    }
  }, [open]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open && !submitting) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, submitting, formData]); // formData dependency needed for handleClose check

  const netWeight = useMemo(() => {
    const wIn = parseFloat(formData.weight_in);
    const wOut = parseFloat(formData.weight_out);
    if (Number.isNaN(wIn) || Number.isNaN(wOut)) return null;
    return wIn - wOut;
  }, [formData.weight_in, formData.weight_out]);

  if (!open) return null;

  const validate = () => {
    if (!formData.ticket_no?.trim()) return "Ticket No wajib diisi";
    if (formData.ticket_no.length > 100) return "Ticket No maksimal 100 karakter";
    if (!formData.vendor_id) return "Vendor wajib dipilih";
    if (!formData.block_id) return "Block / Area wajib dipilih";
    if (!formData.vehicle_plate?.trim()) return "Vehicle Plate wajib diisi";
    if (formData.vehicle_plate.length > 20) return "Vehicle Plate maksimal 20 karakter";
    if (!formData.transaction_date) return "Tanggal transaksi wajib diisi";

    const weightIn = parseFloat(formData.weight_in);
    const weightOut = parseFloat(formData.weight_out);
    
    if (Number.isNaN(weightIn) || weightIn < 0) return "Weight In wajib diisi (min 0)";
    if (Number.isNaN(weightOut) || weightOut < 0) return "Weight Out wajib diisi (min 0)";
    if (weightOut > weightIn) return "Weight Out tidak boleh melebihi Weight In"; // As per prompt requirement
    
    return "";
  };

  const handleClose = () => {
    if (submitting) return;
    const isModified = Object.keys(EMPTY_FORM).some(
      (key) => key !== "transaction_date" && formData[key] !== EMPTY_FORM[key]
    );
    if (isModified) {
      if (!window.confirm("Batal menambah transaksi? Perubahan akan hilang.")) return;
    }
    onClose();
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    setLocalError("");
    const payload = {
      ticket_no: formData.ticket_no.trim(),
      vendor_id: formData.vendor_id,
      block_id: formData.block_id,
      vehicle_plate: formData.vehicle_plate.trim().toUpperCase(),
      weight_in: parseFloat(formData.weight_in),
      weight_out: parseFloat(formData.weight_out),
      transaction_date: formData.transaction_date,
      notes: formData.notes?.trim() || undefined,
    };
    try {
      await onSubmit(payload);
    } catch (err) {
      setLocalError(err.message || "Gagal menyimpan transaksi");
    }
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className="blk-modal-overlay" onClick={handleClose} role="presentation" onKeyDown={handleKeyDown}>
      <div
        className="blk-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-hauling-modal-title"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "600px", width: "95%" }}
      >
        <div className="blk-modal__header">
          <h2 id="add-hauling-modal-title" className="blk-modal__title">
            Add New Transaction
          </h2>
          <button
            type="button"
            className="blk-modal__close"
            onClick={handleClose}
            aria-label="Tutup modal"
            disabled={submitting}
          >
            ×
          </button>
        </div>

        {localError && (
          <div style={{
            backgroundColor: "#FBE5D6",
            color: "#C00000",
            padding: "0.9rem 1rem",
            borderRadius: "8px",
            fontSize: "0.9rem",
            marginBottom: "1rem",
          }}>
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <TransactionFormFields
            formData={formData}
            onFormChange={setFormData}
            vendors={vendors}
            blocks={blocks}
            submitting={submitting}
            netWeight={netWeight}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              style={{
                padding: "0.75rem 1.35rem",
                backgroundColor: "transparent",
                color: "var(--text-primary, #323232)",
                border: "1px solid var(--border-color, #323232)",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              style={{
                padding: "0.75rem 1.35rem",
                backgroundColor: "#ba352c",
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              {submitting ? "⏳ Menyimpan…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTransactionModal;
