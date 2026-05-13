import { useTheme } from "../context/ThemeContext"
import "./DarkModeToggle.css"

export default function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useTheme()

  return (
    <div className="dark-mode-toggle" onClick={toggleDarkMode} role="switch" aria-checked={isDarkMode} tabIndex="0" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { toggleDarkMode() } }}>
      <div className={`toggle-pill ${isDarkMode ? 'active' : ''}`}>
        <div className="toggle-thumb" />
      </div>
      <span className="toggle-label">{isDarkMode ? 'Dark' : 'Light'}</span>
    </div>
  )
}
