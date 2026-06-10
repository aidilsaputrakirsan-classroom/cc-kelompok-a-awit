import { useState } from "react"
import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Building2,
  MapPinned,
  Map,
  Truck,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react"
import DarkModeToggle from "./DarkModeToggle"

function Sidebar({ collapsed, onToggleCollapse, mobileOpen, setMobileOpen }) {
  const [masterOpen, setMasterOpen] = useState(true)
  const [txOpen, setTxOpen] = useState(true)

  const navCls = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
      isActive
        ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200"
    }`

  const iconCls = "shrink-0 opacity-80"

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 
    transition-all duration-300 ease-in-out md:relative md:z-auto
    ${mobileOpen ? "translate-x-0 shadow-2xl md:shadow-none" : "-translate-x-full md:translate-x-0"}
    ${collapsed ? "md:w-16" : "md:w-64"}
    w-64
  `

  if (collapsed) {
    return (
      <aside className={sidebarClasses}>
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <button
            type="button"
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            onClick={onToggleCollapse}
            aria-label="Perluas sidebar"
          >
            <PanelLeft size={20} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-1 items-center" aria-label="Menu utama">
          <NavLink to="/dashboard" className="p-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400" title="Dashboard">
            <LayoutDashboard size={20} aria-hidden />
          </NavLink>
          <NavLink to="/master-data/contractors" className="p-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400" title="Contractor / Vendor">
            <Building2 size={20} aria-hidden />
          </NavLink>
          <NavLink to="/master-data/blocks" className="p-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400" title="Block / Area">
            <MapPinned size={20} aria-hidden />
          </NavLink>
          <NavLink to="/master-data/mapping" className="p-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400" title="Mapping">
            <Map size={20} aria-hidden />
          </NavLink>
          <NavLink to="/transactions/hauling" className="p-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400" title="Actual Hauling">
            <Truck size={20} aria-hidden />
          </NavLink>
        </nav>
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 flex justify-center shrink-0">
          <DarkModeToggle />
        </div>
      </aside>
    )
  }

  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setMobileOpen(false)
    }
  }

  return (
    <aside className={sidebarClasses}>
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 dark:text-gray-100 leading-none tracking-tight">PalmTrack Cloud</span>
          <span className="text-[10px] font-semibold tracking-widest text-gray-500 dark:text-gray-400 uppercase mt-1">Palmchain</span>
        </div>
        <button
          type="button"
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors hidden md:block"
          onClick={onToggleCollapse}
          aria-label="Ciutkan sidebar"
        >
          <PanelLeftClose size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1" aria-label="Menu utama">
        <NavLink to="/dashboard" className={navCls} end onClick={handleNavClick}>
          <LayoutDashboard size={18} className={iconCls} aria-hidden />
          <span>Dashboard</span>
        </NavLink>

        <div className="mt-4 mb-1">
          <button
            type="button"
            className="flex items-center w-full px-2 py-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            onClick={() => setMasterOpen((v) => !v)}
            aria-expanded={masterOpen}
          >
            <span className="mr-1 opacity-70">
              {masterOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
            <span>Master Data</span>
          </button>
          {masterOpen && (
            <div className="mt-1 flex flex-col gap-0.5 ml-1 border-l border-gray-100 dark:border-gray-800 pl-2">
              <NavLink to="/master-data/contractors" className={navCls} onClick={handleNavClick}>
                <Building2 size={16} className={iconCls} aria-hidden />
                <span>Contractor / Vendor</span>
              </NavLink>
              <NavLink to="/master-data/blocks" className={navCls} onClick={handleNavClick}>
                <MapPinned size={16} className={iconCls} aria-hidden />
                <span>Block / Area</span>
              </NavLink>
              <NavLink to="/master-data/mapping" className={navCls} onClick={handleNavClick}>
                <Map size={16} className={iconCls} aria-hidden />
                <span>Mapping</span>
              </NavLink>
            </div>
          )}
        </div>

        <div className="mt-4 mb-1">
          <button
            type="button"
            className="flex items-center w-full px-2 py-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            onClick={() => setTxOpen((v) => !v)}
            aria-expanded={txOpen}
          >
            <span className="mr-1 opacity-70">
              {txOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
            <span>Transactions</span>
          </button>
          {txOpen && (
            <div className="mt-1 flex flex-col gap-0.5 ml-1 border-l border-gray-100 dark:border-gray-800 pl-2">
              <NavLink to="/transactions/hauling" className={navCls} onClick={handleNavClick}>
                <Truck size={16} className={iconCls} aria-hidden />
                <span>Actual Hauling</span>
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 shrink-0">
        <DarkModeToggle />
      </div>
    </aside>
  )
}

export default Sidebar
