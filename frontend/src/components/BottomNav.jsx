import { NavLink, useNavigate } from 'react-router-dom'
import { Home, FileText, LogOut, CloudLightning, Wallet } from 'lucide-react'
import { getStoredLanguage } from '../services/language.js'

const COPY = {
  en: {
    leavePrompt: 'Leave GigShield?',
    shield: 'Shield',
    claims: 'Claims',
    storm: 'Storm',
    payout: 'Payout',
    exit: 'Exit',
  },
  hi: {
    leavePrompt: 'GigShield छोड़ें?',
    shield: 'कवच',
    claims: 'दावे',
    storm: 'तूफान',
    payout: 'भुगतान',
    exit: 'बाहर',
  },
}

export default function BottomNav() {
  const navigate = useNavigate()
  const language = getStoredLanguage()
  const copy = COPY[language] ?? COPY.en

  const logout = () => {
    if (confirm(copy.leavePrompt)) {
      localStorage.clear()
      sessionStorage.clear()
      navigate('/')
    }
  }

  return (
    <nav className="bottom-nav">
      <NavLink to="/home" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Home size={22} />
        <span>{copy.shield}</span>
      </NavLink>

      <NavLink to="/claims" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <FileText size={22} />
        <span>{copy.claims}</span>
      </NavLink>

      <NavLink to="/storm" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <CloudLightning size={22} />
        <span>{copy.storm}</span>
      </NavLink>

      <NavLink to="/payout" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Wallet size={22} />
        <span>{copy.payout}</span>
      </NavLink>

      <button className="bottom-nav-item" onClick={logout} style={{ color: 'var(--text-muted)' }}>
        <LogOut size={22} />
        <span>{copy.exit}</span>
      </button>
    </nav>
  )
}
