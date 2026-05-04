import { useCallback, useMemo, useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import { useAuth } from "../context/AuthContext"
import "./MainLayout.css"

function MainLayout() {
  const { user, logout, showToast } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

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

  return (
    <div className={`pt-shell${sidebarCollapsed ? " pt-shell--collapsed" : ""}`}>
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} />
      <div className="pt-shell__content">
        <header className="pt-topbar">
          <h1 className="pt-topbar__title">Command Center</h1>
          <div className="pt-topbar__right">
            {user && (
              <span className="pt-topbar__user">{user.name}</span>
            )}
            <button type="button" className="pt-topbar__logout" onClick={logout}>
              Logout
            </button>
          </div>
        </header>
        <main className="pt-main">
          <Outlet context={outletContext} />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
