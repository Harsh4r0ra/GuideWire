import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader, LogIn } from 'lucide-react'
import { loginWorker, getErrorMsg } from '../services/api.js'

export default function WorkerLogin() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isValid = phone.length === 10

  async function handleSubmit(e) {
    e.preventDefault()
    if (!isValid || loading) return

    setLoading(true)
    setError('')
    try {
      const payload = { phone: `+91${phone}` }
      const res = await loginWorker(payload)

      const worker = res.data?.worker
      const policy = res.data?.policy

      localStorage.setItem('gs_worker_id', worker.id)
      localStorage.setItem('gs_worker_name', worker.name ?? '')
      localStorage.setItem('gs_language', worker.language_pref ?? 'en')
      if (policy?.id) {
        localStorage.setItem('gs_policy_id', policy.id)
      }

      navigate('/home')
    } catch (err) {
      setError(getErrorMsg(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20 }}>
      <div className="card" style={{ width: '100%', maxWidth: 460, padding: 28 }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🛡️</div>
          <h1 style={{ fontFamily: 'Poppins', fontSize: '1.7rem', marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Sign in with your phone number. No re-registration needed.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="input-label" style={{ marginBottom: 8 }}>Phone Number</label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
            <div style={{ padding: '14px 16px', background: 'var(--bg-700)', borderRadius: 12, border: '1.5px solid var(--border)', fontWeight: 700, color: 'var(--amber)' }}>
              +91
            </div>
            <input
              className="input"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="Enter 10-digit number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          {error && (
            <div style={{ marginBottom: 14, padding: 12, borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <button className="btn btn-primary btn-full" disabled={!isValid || loading} type="submit">
            {loading ? <Loader size={16} className="spin" /> : <LogIn size={16} />}
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          New to GIGASHIELD? <Link to="/onboard" style={{ color: 'var(--amber)', fontWeight: 700 }}>Register once</Link>
        </div>
      </div>
    </div>
  )
}
