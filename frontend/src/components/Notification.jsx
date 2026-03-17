import { useEffect } from "react"

function Notification({ message, type, onClose }) {
  useEffect(() => {
    if (!message) return

    // Auto-dismiss setelah 3 detik
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [message, onClose])

  if (!message) return null

  const getBgColor = () => {
    if (type === "success") return "#d4edda"
    if (type === "error") return "#f8d7da"
    if (type === "info") return "#d1ecf1"
    return "#e7e7e7"
  }

  const getBorderColor = () => {
    if (type === "success") return "#c3e6cb"
    if (type === "error") return "#f5c6cb"
    if (type === "info") return "#bee5eb"
    return "#bbb"
  }

  const getTextColor = () => {
    if (type === "success") return "#155724"
    if (type === "error") return "#721c24"
    if (type === "info") return "#0c5460"
    return "#333"
  }

  const getIcon = () => {
    if (type === "success") return "✅"
    if (type === "error") return "❌"
    if (type === "info") return "ℹ️"
    return "📢"
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "1.5rem",
        right: "1.5rem",
        backgroundColor: getBgColor(),
        color: getTextColor(),
        border: `2px solid ${getBorderColor()}`,
        borderRadius: "8px",
        padding: "1rem 1.5rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        maxWidth: "400px",
        fontWeight: "500",
        zIndex: 9999,
        animation: "slideIn 0.3s ease-out",
      }}
    >
      <span style={{ fontSize: "1.2rem" }}>{getIcon()}</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "inherit",
          fontSize: "1.2rem",
          cursor: "pointer",
          padding: "0",
          marginLeft: "0.5rem",
        }}
      >
        ✕
      </button>
    </div>
  )
}

export default Notification
