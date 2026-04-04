import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage     from './pages/LandingPage.jsx'
import Onboarding      from './pages/Onboarding.jsx'
import WorkerLogin     from './pages/WorkerLogin.jsx'
import Home            from './pages/Home.jsx'
import StormMode       from './pages/StormMode.jsx'
import PayoutConfirm   from './pages/PayoutConfirm.jsx'
import ClaimsHistory   from './pages/ClaimsHistory.jsx'
import AdminDashboard  from './pages/AdminDashboard.jsx'
import AdminAccess     from './pages/AdminAccess.jsx'

function Guard({ children }) {
  const id = localStorage.getItem('gs_worker_id')
  return id ? children : <Navigate to="/login" replace />
}

function AdminGuard({ children }) {
  const token = sessionStorage.getItem('gs_admin_token')
  return token ? children : <Navigate to="/admin/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<LandingPage />} />
        <Route path="/login"   element={<WorkerLogin />} />
        <Route path="/onboard" element={<Onboarding />} />
        <Route path="/home"    element={<Guard><Home /></Guard>} />
        <Route path="/storm"   element={<Guard><StormMode /></Guard>} />
        <Route path="/payout"  element={<Guard><PayoutConfirm /></Guard>} />
        <Route path="/claims"  element={<Guard><ClaimsHistory /></Guard>} />
        <Route path="/admin/login" element={<AdminAccess />} />
        <Route path="/admin"   element={<AdminGuard><AdminDashboard /></AdminGuard>} />
        <Route path="*"        element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
