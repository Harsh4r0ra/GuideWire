import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api.js'
import { getErrorMsg } from '../services/api.js'

export default function AdminAccess() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const verifyAndEnter = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Enter username and password')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/admin/login', {
        username: username.trim(),
        password,
      })
      sessionStorage.setItem('gs_admin_token', res.data.token)
      navigate('/admin', { replace: true })
    } catch (err) {
      sessionStorage.removeItem('gs_admin_token')
      setError(getErrorMsg(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card" style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ fontFamily: 'Poppins', fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Admin Access</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 18 }}>
          Sign in with admin credentials to open the dashboard.
        </div>

        <div className="input-group" style={{ marginBottom: 14 }}>
          <label className="input-label">Username</label>
          <input
            className="input"
            type="text"
            placeholder="Enter admin username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="input-group" style={{ marginBottom: 14 }}>
          <label className="input-label">Password</label>
          <input
            className="input"
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <div style={{ marginBottom: 12, padding: 10, borderRadius: 8, background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <button className="btn btn-primary btn-full" onClick={verifyAndEnter} disabled={loading}>
          {loading ? 'Verifying...' : 'Open Admin Panel'}
        </button>

        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <Link to="/home" style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Back to Worker App</Link>
        </div>
      </div>
    </div>
  )
}
