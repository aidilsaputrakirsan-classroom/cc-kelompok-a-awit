import React, { useState, useEffect } from "react";

function AssignDriverModal({ open, transactionId, onClose, onSubmit, submitting }) {
  const [driverId, setDriverId] = useState("");
  // In a real scenario, this would come from an API /api/users?role=driver
  const [drivers, setDrivers] = useState([
    { id: "d-1", name: "Budi Santoso" },
    { id: "d-2", name: "Ahmad Sujono" },
    { id: "d-3", name: "Supardi" },
  ]);

  useEffect(() => {
    if (open) {
      setDriverId("");
    }
  }, [open]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open && !submitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, submitting, onClose]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!driverId) return;
    onSubmit(transactionId, { driver_id: driverId, trip_status: "PENDING" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} role="presentation">
      <div 
        className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-driver-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <h2 id="assign-driver-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Assign Driver
          </h2>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
            disabled={submitting}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Pilih Driver
            </label>
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-sm shadow-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50"
              disabled={submitting}
            >
              <option value="" disabled>-- Pilih Driver --</option>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Driver yang dipilih akan menerima notifikasi di aplikasi mobile mereka.
            </p>
          </div>
          
          <div className="flex justify-end gap-3 mt-8">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50" 
              disabled={submitting}
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white border border-transparent rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[90px]"
              disabled={submitting || !driverId} 
            >
              {submitting ? (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : "Assign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssignDriverModal;
