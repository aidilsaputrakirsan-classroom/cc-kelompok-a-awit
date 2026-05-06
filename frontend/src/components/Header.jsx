import { useTheme } from "../context/ThemeContext"

function Header({ totalItems, isConnected, user, onLogout }) {
  const { isDarkMode, toggleDarkMode } = useTheme()

  return (
    <header style={styles.header(isDarkMode)}>
      <div>
        <h1 style={styles.title}>☁️ Cloud App</h1>
        <p style={styles.subtitle}>Komputasi Awan — SI ITK</p>
      </div>
      <div style={styles.right}>
        <div style={styles.stats}>
          {totalItems != null && (
            <span style={styles.badge(isDarkMode)}>{totalItems} items</span>
          )}
          <span style={{
            ...styles.status,
            backgroundColor: isConnected ? (isDarkMode ? "#2d5a2d" : "#E2EFDA") : (isDarkMode ? "#5a2d2d" : "#FBE5D6"),
            color: isConnected ? (isDarkMode ? "#90EE90" : "#548235") : (isDarkMode ? "#FF6B6B" : "#C00000"),
          }}>
            {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
          </span>
          <button onClick={toggleDarkMode} style={styles.btnToggle(isDarkMode)}>
            {isDarkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
        {user && (
          <div style={styles.user}>
            <span style={styles.userName}>👤 {user.name}</span>
            <button onClick={onLogout} style={styles.btnLogout(isDarkMode)}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

const styles = {
  header: (isDarkMode) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.5rem 2rem",
    backgroundColor: isDarkMode ? "#2a2a2a" : "#1F4E79",
    color: "white",
    borderRadius: "12px",
    marginBottom: "1.5rem",
  }),
  title: { margin: 0, fontSize: "1.8rem" },
  subtitle: { margin: "0.25rem 0 0 0", fontSize: "0.9rem", opacity: 0.8 },
  right: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" },
  stats: { display: "flex", gap: "0.5rem", alignItems: "center" },
  badge: (isDarkMode) => ({
    backgroundColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.2)",
    padding: "0.3rem 0.7rem",
    borderRadius: "20px",
    fontSize: "0.8rem",
  }),
  status: { padding: "0.3rem 0.7rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "bold" },
  btnToggle: (isDarkMode) => ({
    padding: "0.3rem 0.8rem",
    backgroundColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.2)",
    color: "white",
    border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.3)"}`,
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.8rem",
  }),
  user: { display: "flex", gap: "0.5rem", alignItems: "center" },
  userName: { fontSize: "0.85rem", opacity: 0.9 },
  btnLogout: (isDarkMode) => ({
    padding: "0.3rem 0.8rem",
    backgroundColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.2)",
    color: "white",
    border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.3)"}`,
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.8rem",
  }),
}

export default Header