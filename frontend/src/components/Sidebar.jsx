import { useState } from "react"
import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Building2,
  MapPinned,
  Truck,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react"

const navCls = ({ isActive }) =>
  `pt-sidebar__link${isActive ? " pt-sidebar__link--active" : ""}`

function Sidebar({ collapsed, onToggleCollapse }) {
  const [masterOpen, setMasterOpen] = useState(true)
  const [txOpen, setTxOpen] = useState(true)

  if (collapsed) {
    return (
      <aside className="pt-sidebar pt-sidebar--collapsed">
        <div className="pt-sidebar__brand pt-sidebar__brand--collapsed">
          <button
            type="button"
            className="pt-sidebar__collapse"
            onClick={onToggleCollapse}
            aria-label="Perluas sidebar"
          >
            <PanelLeft size={20} />
          </button>
        </div>
        <nav className="pt-sidebar__nav pt-sidebar__nav--icons" aria-label="Menu utama">
          <NavLink to="/dashboard" className={navCls} end title="Dashboard">
            <LayoutDashboard size={22} className="pt-sidebar__icon" aria-hidden />
          </NavLink>
          <NavLink to="/master-data/contractors" className={navCls} title="Contractor / Vendor">
            <Building2 size={22} className="pt-sidebar__icon" aria-hidden />
          </NavLink>
          <NavLink to="/master-data/blocks" className={navCls} title="Block / Area">
            <MapPinned size={22} className="pt-sidebar__icon" aria-hidden />
          </NavLink>
          <NavLink to="/transactions/hauling" className={navCls} title="Actual Hauling">
            <Truck size={22} className="pt-sidebar__icon" aria-hidden />
          </NavLink>
        </nav>
      </aside>
    )
  }

  return (
    <aside className="pt-sidebar">
      <div className="pt-sidebar__brand">
        <div className="pt-sidebar__brand-text">
          <span className="pt-sidebar__brand-name">PalmTrack Cloud</span>
          <span className="pt-sidebar__brand-sub">Palmchain</span>
        </div>
        <button
          type="button"
          className="pt-sidebar__collapse"
          onClick={onToggleCollapse}
          aria-label="Ciutkan sidebar"
        >
          <PanelLeftClose size={20} />
        </button>
      </div>

      <nav className="pt-sidebar__nav" aria-label="Menu utama">
        <NavLink to="/dashboard" className={navCls} end>
          <LayoutDashboard size={20} className="pt-sidebar__icon" aria-hidden />
          <span>Dashboard</span>
        </NavLink>

        <div className="pt-sidebar__group">
          <button
            type="button"
            className="pt-sidebar__group-head"
            onClick={() => setMasterOpen((v) => !v)}
            aria-expanded={masterOpen}
          >
            {masterOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            <span>Master Data</span>
          </button>
          {masterOpen && (
            <div className="pt-sidebar__sub">
              <NavLink to="/master-data/contractors" className={navCls}>
                <Building2 size={18} className="pt-sidebar__icon" aria-hidden />
                <span>Contractor / Vendor</span>
              </NavLink>
              <NavLink to="/master-data/blocks" className={navCls}>
                <MapPinned size={18} className="pt-sidebar__icon" aria-hidden />
                <span>Block / Area</span>
              </NavLink>
            </div>
          )}
        </div>

        <div className="pt-sidebar__group">
          <button
            type="button"
            className="pt-sidebar__group-head"
            onClick={() => setTxOpen((v) => !v)}
            aria-expanded={txOpen}
          >
            {txOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            <span>Transactions</span>
          </button>
          {txOpen && (
            <div className="pt-sidebar__sub">
              <NavLink to="/transactions/hauling" className={navCls}>
                <Truck size={18} className="pt-sidebar__icon" aria-hidden />
                <span>Actual Hauling</span>
              </NavLink>
            </div>
          )}
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar
