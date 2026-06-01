import { useState, useEffect, useCallback } from "react";

function HaulingFilterBar({
  filters,
  onChange,
  onReset,
  vendors,
  blocks,
  loading,
  masterLoading,
}) {
  const [localSearch, setLocalSearch] = useState(filters.ticket_no || "");

  // Update localSearch when filters.ticket_no changes externally (like on reset)
  useEffect(() => {
    setLocalSearch(filters.ticket_no || "");
  }, [filters.ticket_no]);

  // Debounce logic for search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (filters.ticket_no || "")) {
        onChange("ticket_no", localSearch);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, onChange, filters.ticket_no]);

  return (
    <div
      className="ahl-filters"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem",
        padding: "1rem 2rem",
        borderBottom: "1px solid var(--border-color)",
        alignItems: "flex-end",
        background: "var(--card-bg)",
      }}
    >
      <div style={{ flex: "1 1 180px", minWidth: 160, position: "relative" }}>
        <label
          htmlFor="ahl-search"
          style={{
            display: "block",
            fontSize: "0.78rem",
            fontWeight: 700,
            marginBottom: 4,
          }}
        >
          Cari Ticket No
        </label>
        <div style={{ position: "relative" }}>
          <input
            id="ahl-search"
            type="search"
            className="blk-search"
            style={{ width: "100%", paddingRight: "45px" }}
            placeholder="Ticket no…"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            maxLength={100}
          />
          <div
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "0.7rem",
              color: "var(--text-muted, #999)",
              pointerEvents: "none",
            }}
          >
            {localSearch.length}/100
          </div>
        </div>
      </div>
      
      <div style={{ flex: "1 1 160px", minWidth: 140 }}>
        <label
          htmlFor="ahl-vendor"
          style={{
            display: "block",
            fontSize: "0.78rem",
            fontWeight: 700,
            marginBottom: 4,
          }}
        >
          Filter Vendor
        </label>
        <select
          id="ahl-vendor"
          className="blk-search"
          style={{ width: "100%" }}
          value={filters.vendor_id || ""}
          onChange={(e) => onChange("vendor_id", e.target.value)}
          disabled={masterLoading}
        >
          {masterLoading ? (
            <option value="">Memuat vendor...</option>
          ) : (
            <>
              <option value="">Semua vendor</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </>
          )}
        </select>
      </div>

      <div style={{ flex: "1 1 160px", minWidth: 140 }}>
        <label
          htmlFor="ahl-block"
          style={{
            display: "block",
            fontSize: "0.78rem",
            fontWeight: 700,
            marginBottom: 4,
          }}
        >
          Filter Block
        </label>
        <select
          id="ahl-block"
          className="blk-search"
          style={{ width: "100%" }}
          value={filters.block_id || ""}
          onChange={(e) => onChange("block_id", e.target.value)}
          disabled={masterLoading}
        >
          {masterLoading ? (
            <option value="">Memuat blok...</option>
          ) : (
            <>
              <option value="">Semua blok</option>
              {blocks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.block_code}
                </option>
              ))}
            </>
          )}
        </select>
      </div>

      <div style={{ flex: "1 1 130px", minWidth: 130 }}>
        <label
          htmlFor="ahl-date-from"
          style={{
            display: "block",
            fontSize: "0.78rem",
            fontWeight: 700,
            marginBottom: 4,
          }}
        >
          Dari Tanggal
        </label>
        <input
          id="ahl-date-from"
          type="date"
          className="blk-search"
          style={{ width: "100%" }}
          value={filters.date_from || ""}
          onChange={(e) => onChange("date_from", e.target.value)}
        />
      </div>

      <div style={{ flex: "1 1 130px", minWidth: 130 }}>
        <label
          htmlFor="ahl-date-to"
          style={{
            display: "block",
            fontSize: "0.78rem",
            fontWeight: 700,
            marginBottom: 4,
          }}
        >
          Sampai Tanggal
        </label>
        <input
          id="ahl-date-to"
          type="date"
          className="blk-search"
          style={{ width: "100%" }}
          value={filters.date_to || ""}
          onChange={(e) => onChange("date_to", e.target.value)}
          min={filters.date_from || ""}
        />
      </div>

      <button
        type="button"
        className="blk-page-btn"
        onClick={onReset}
        disabled={loading}
      >
        Reset Filters
      </button>
    </div>
  );
}

export default HaulingFilterBar;
