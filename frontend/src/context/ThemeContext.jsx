import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("palmchain_theme")
    return saved ? JSON.parse(saved) : false
  })

  useEffect(() => {
    localStorage.setItem("palmchain_theme", JSON.stringify(isDarkMode))
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode))
    document.body.className = isDarkMode ? "dark" : "light"
  }, [isDarkMode])

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev)
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useDarkMode() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useDarkMode must be used within a ThemeProvider")
  }
  return context.isDarkMode
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}