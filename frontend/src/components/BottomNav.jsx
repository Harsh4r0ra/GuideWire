import { NavLink, useNavigate } from 'react-router-dom'
import { Home, FileText, LogOut, CloudLightning, Wallet } from 'lucide-react'

export default function BottomNav() {
  const navigate = useNavigate()

  const logout = () => {
    if (confirm('Leave GigShield?')) {
      localStorage.clear()
      sessionStorage.clear()
      navigate('/')
    }
  }

  return (
    <nav className="bottom-nav">
      <NavLink to="/home" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Home size={22} />
        <span>Shield</span>
      </NavLink>

      <NavLink to="/claims" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <FileText size={22} />
        <span>Claims</span>
      </NavLink>

      <NavLink to="/storm" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <CloudLightning size={22} />
        <span>Storm</span>
      </NavLink>

      <NavLink to="/payout" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Wallet size={22} />
        <span>Payout</span>
      </NavLink>

      <button className="bottom-nav-item" onClick={logout} style={{ color: 'var(--text-muted)' }}>
        <LogOut size={22} />
        <span>Exit</span>
      </button>
    </nav>
  )
}
