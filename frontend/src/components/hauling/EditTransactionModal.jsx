import React, { useState, useMemo, useEffect, useCallback } from "react";
import TransactionFormFields from "./TransactionFormFields";
import { getToken, API_URL } from "../../services/api";

function EditTransactionModal({ transactionId, open, vendors, blocks, onSubmit, onClose }) {
  const [formData, setFormData] = useState(null);
  const [localError, setLocalError] = useState("");
  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [auditInfo, setAuditInfo] = useState(null);
  
  // Track initial state to detect modifications
  const [initialData, setInitialData] = useState(null);

  const fetchTransaction = useCallback(async (id) => {
    setFetching(true);
    setLocalError("");
    try {
      const response = await fetch(`${API_URL}/api/hauling-transactions/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        }
      });
      if (!response.ok) {
        throw new Error("Gagal mengambil data transaksi");
      }
      const data = await response.json();
      const transaction = data.data || data; // handle unwrapped or wrapped response
      
      const parsedData = {
        ticket_no: transaction.ticket_no || "",
        vendor_id: transaction.vendor?.id || transaction.vendor_id || "",
        block_id: transaction.block?.id || transaction.block_id || "",
        vehicle_plate: transaction.vehicle_plate || "",
        weight_in: transaction.weight_in !== undefined && transaction.weight_in !== null ? String(transaction.weight_in) : "",
        weight_out: transaction.weight_out !== undefined && transaction.weight_out !== null ? String(transaction.weight_out) : "",
        transaction_date: transaction.transaction_date ? transaction.transaction_date.split("T")[0] : "",
        notes: transaction.notes || "",
      };
      
      setFormData(parsedData);
      setInitialData(parsedData);
      
      setAuditInfo({
        updated_at: transaction.updated_at,
        updated_by: transaction.updated_by,
      });
      
    } catch (err) {
      setLocalError(err.message || "Network Error");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (open && transactionId) {
      fetchTransaction(transactionId);
    } else if (!open) {
      setFormData(null);
      setInitialData(null);
      setAuditInfo(null);
      setLocalError("");
    }
  }, [open, transactionId, fetchTransaction]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open && !submitting) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, submitting, formData, initialData]);

  const netWeight = useMemo(() => {
    if (!formData) return null;
    const wIn = parseFloat(formData.weight_in);
    const wOut = parseFloat(formData.weight_out);
    if (Number.isNaN(wIn) || Number.isNaN(wOut)) return null;
    return wIn - wOut;
  }, [formData]);

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
    if (weightOut > weightIn) return "Weight Out tidak boleh melebihi Weight In";
    
    return "";
  };

  const handleClose = () => {
    if (submitting) return;
    if (formData && initialData) {
      const isModified = Object.keys(initialData).some(
        (key) => formData[key] !== initialData[key]
      );
      if (isModified) {
        if (!window.confirm("Batal mengedit transaksi? Perubahan akan hilang.")) return;
      }
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
    setSubmitting(true);
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
      await onSubmit(transactionId, payload);
    } catch (err) {
      setLocalError(err.message || "Gagal menyimpan transaksi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === "Enter") {
      handleSubmit(e);
    }
  };

  const formatDateString = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  };

  return (
    <div className="blk-modal-overlay" onClick={handleClose} role="presentation" onKeyDown={handleKeyDown}>
      <div
        className="blk-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-hauling-modal-title"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "600px", width: "95%" }}
      >
        <div className="blk-modal__header">
          <h2 id="edit-hauling-modal-title" className="blk-modal__title">
            Edit Transaction
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

        {fetching ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
            <div className="spinner" style={{ margin: "0 auto", borderColor: "rgba(50,50,50,0.1)", borderTopColor: "#ba352c" }}></div>
            <p style={{ marginTop: "1rem" }}>Memuat data transaksi...</p>
          </div>
        ) : formData ? (
          <form onSubmit={handleSubmit}>
            <TransactionFormFields
              formData={formData}
              onFormChange={setFormData}
              vendors={vendors}
              blocks={blocks}
              submitting={submitting}
              netWeight={netWeight}
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "1.5rem" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {auditInfo?.updated_at && auditInfo?.updated_by ? (
                  <span>Terakhir diubah: {formatDateString(auditInfo.updated_at)} oleh {auditInfo.updated_by}</span>
                ) : null}
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
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
                  {submitting ? "⏳ Menyimpan…" : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
            Data tidak ditemukan.
          </div>
        )}
      </div>
    </div>
  );
}

export default EditTransactionModal;
