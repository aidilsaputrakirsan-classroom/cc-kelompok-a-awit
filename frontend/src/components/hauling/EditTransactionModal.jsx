import React, { useState, useMemo, useEffect, useCallback } from "react";
import TransactionFormFields from "./TransactionFormFields";
import { getToken } from "../../services/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" onClick={handleClose} role="presentation" onKeyDown={handleKeyDown}>
      <div
        className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-hauling-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <h2 id="edit-hauling-modal-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Edit Transaction
          </h2>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
            onClick={handleClose}
            aria-label="Tutup modal"
            disabled={submitting}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {localError && (
            <div className="mb-4 p-4 rounded-md bg-red-50 text-red-700 text-sm border border-red-200">
              {localError}
            </div>
          )}

          {fetching ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
              <svg className="animate-spin h-8 w-8 text-emerald-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <p>Memuat data transaksi...</p>
            </div>
          ) : formData ? (
            <form onSubmit={handleSubmit} className="flex flex-col">
              <TransactionFormFields
                formData={formData}
                onFormChange={setFormData}
                vendors={vendors}
                blocks={blocks}
                submitting={submitting}
                netWeight={netWeight}
              />

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {auditInfo?.updated_at && auditInfo?.updated_by ? (
                    <span>Terakhir diubah: {formatDateString(auditInfo.updated_at)} oleh {auditInfo.updated_by}</span>
                  ) : null}
                </div>
                <div className="flex w-full sm:w-auto justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={submitting}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white border border-transparent rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                  >
                    {submitting ? (
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              Data tidak ditemukan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditTransactionModal;
