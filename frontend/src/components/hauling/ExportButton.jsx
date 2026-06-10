import React, { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

function ExportButton({ filters, loading }) {
  const outlet = useOutletContext() || {};
  const { showToast } = outlet;
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = async (format) => {
    setOpen(false);
    setExporting(true);
    
    // Simulate delay for UI feedback
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    showToast?.("Fitur export sedang dalam pengembangan", "info");
    setExporting(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={loading || exporting}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md text-sm font-medium shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
      >
        {exporting ? (
          <svg className="animate-spin h-4 w-4 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        ) : (
          <Download size={16} className="text-emerald-600 dark:text-emerald-500" />
        )}
        {exporting ? "Exporting..." : "Export"}
      </button>

      {open && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 divide-y divide-gray-100 dark:divide-gray-700 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="py-1">
            <button
              type="button"
              onClick={() => handleExport("xlsx")}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-left"
            >
              <FileSpreadsheet size={16} className="text-green-600 dark:text-green-500" />
              Export Excel (.xlsx)
            </button>
            <button
              type="button"
              onClick={() => handleExport("pdf")}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-left"
            >
              <FileText size={16} className="text-red-500 dark:text-red-400" />
              Export PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExportButton;
