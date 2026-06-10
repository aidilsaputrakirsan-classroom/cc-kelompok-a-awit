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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" onClick={onCancel} role="presentation">
      <div
        className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-center p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-5xl mb-4">⚠️</div>
        
        <h2 id="delete-dialog-title" className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Konfirmasi Hapus
        </h2>
        
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          Hapus transaksi tiket <strong className="font-semibold text-gray-900 dark:text-gray-100">{ticketNo}</strong>? Tindakan ini tidak dapat dibatalkan.
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-md bg-red-50 text-red-700 text-sm border border-red-200 text-left">
            {error}
          </div>
        )}

        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50 min-w-[100px]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white border border-transparent rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[120px]"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmDialog;
