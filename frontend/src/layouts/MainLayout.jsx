import { useCallback, useMemo, useState, useEffect } from "react"
import { Menu } from "lucide-react"
import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"

function MainLayout() {
  const { user, logout, showToast } = useAuth()
  const { isDarkMode } = useTheme()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    document.body.className = isDarkMode ? "dark" : "light"
  }, [isDarkMode])

  const outletContext = useMemo(
    () => ({
      onUnauthorized: logout,
      showToast,
    }),
    [logout, showToast],
  )

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((c) => !c)
  }, [])

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((o) => !o)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 w-full transition-colors duration-300">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 z-40 md:hidden backdrop-blur-sm transition-opacity" 
          onClick={toggleMobileMenu} 
          aria-label="Tutup menu"
        />
      )}
      
      {/* Sidebar Component */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={toggleSidebar} 
        mobileOpen={mobileMenuOpen} 
        setMobileOpen={setMobileMenuOpen}
      />

      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden transition-all duration-300">
        <header className="flex items-center justify-between px-4 md:px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shrink-0 z-10 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              className="p-2 -ml-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 md:hidden transition-colors" 
              onClick={toggleMobileMenu}
              aria-label="Buka menu navigasi"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight hidden sm:block">
              Command Center
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300 hidden sm:block">
                {user.name}
              </span>
            )}
            <button 
              type="button" 
              className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-md transition-colors" 
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <div className="max-w-7xl mx-auto w-full h-full">
            <Outlet context={outletContext} />
          </div>
        </main>
      </div>
    </div>
  )
}

export default MainLayout
