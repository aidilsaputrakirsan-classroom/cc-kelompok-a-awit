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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" onClick={handleClose} role="presentation" onKeyDown={handleKeyDown}>
      <div
        className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-hauling-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <h2 id="add-hauling-modal-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Add New Transaction
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

          <form onSubmit={handleSubmit} className="flex flex-col">
            <TransactionFormFields
              formData={formData}
              onFormChange={setFormData}
              vendors={vendors}
              blocks={blocks}
              submitting={submitting}
              netWeight={netWeight}
            />

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
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
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white border border-transparent rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[100px]"
              >
                {submitting ? (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddTransactionModal;
