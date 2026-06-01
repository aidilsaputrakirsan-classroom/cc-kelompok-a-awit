import React, { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

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
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={loading || exporting}
        style={{
          padding: "0.55rem 1rem",
          backgroundColor: "white",
          color: "var(--text-primary)",
          border: "1px solid var(--border-color)",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.88rem"
        }}
      >
        <span>📥</span> {exporting ? "Exporting..." : "Export"}
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "100%",
          right: 0,
          marginTop: "0.5rem",
          backgroundColor: "var(--card-bg, white)",
          border: "1px solid var(--border-color)",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          zIndex: 10,
          minWidth: "160px",
          overflow: "hidden"
        }}>
          <button
            type="button"
            onClick={() => handleExport("xlsx")}
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              textAlign: "left",
              backgroundColor: "transparent",
              border: "none",
              borderBottom: "1px solid var(--border-color)",
              cursor: "pointer",
              color: "var(--text-primary)",
              fontSize: "0.88rem"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "rgba(0,0,0,0.05)"}
            onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}
          >
            Export Excel (.xlsx)
          </button>
          <button
            type="button"
            onClick={() => handleExport("pdf")}
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              textAlign: "left",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--text-primary)",
              fontSize: "0.88rem"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "rgba(0,0,0,0.05)"}
            onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}
          >
            Export PDF
          </button>
        </div>
      )}
    </div>
  );
}

export default ExportButton;
