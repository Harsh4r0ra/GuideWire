import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Search, Filter } from 'lucide-react'
import { getWorkerClaims, getErrorMsg } from '../services/api.js'
import BottomNav from '../components/BottomNav.jsx'

const STATUS_META = {
  INITIATED: { label: 'Initiated',   className: 'badge-info',    emoji: '⏳' },
  APPROVED:  { label: 'Approved',    className: 'badge-warning',  emoji: '✅' },
  PAID:      { label: 'Paid',        className: 'badge-success',  emoji: '💸' },
  REJECTED:  { label: 'Rejected',    className: 'badge-danger',   emoji: '❌' },
  FLAGGED:   { label: 'Flagged',     className: 'badge-warning',  emoji: '🚩' },
}

const TRIGGER_EMOJI = {
  HEAVY_RAIN: '🌧️', FLOOD: '🌊', HEATWAVE: '🔥',
  POLLUTION:  '🌫️', CURFEW: '🚧', COMPOSITE_DSI: '⚡',
}

function FraudScore({ score }) {
  const pct   = Math.round((score ?? 0) * 100)
  const color = pct < 30 ? 'var(--success)' : pct < 60 ? 'var(--warning)' : 'var(--danger)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 5, borderRadius: 99, background: 'var(--bg-700)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99 }} />
      </div>
      <span style={{ fontSize: '0.72rem', fontWeight: 700, color, minWidth: 32 }}>{pct}%</span>
    </div>
  )
}

function ClaimCard({ claim }) {
  const [expanded, setExpanded] = useState(false)
  const meta    = STATUS_META[claim.status] ?? STATUS_META['INITIATED']
  const emoji   = TRIGGER_EMOJI[claim.trigger_type] ?? '⚡'
  const dateStr = new Date(claim.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Header row */}
      <button onClick={() => setExpanded(e => !e)} style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--bg-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
          {emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{claim.trigger_type?.replace(/_/g,' ')}</span>
            <span style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1rem', color: claim.status === 'PAID' ? 'var(--success)' : 'var(--text-primary)' }}>
              ₹{Number(claim.claim_amount).toLocaleString()}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={`badge ${meta.className}`}>{meta.emoji} {meta.label}</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{dateStr}</span>
          </div>
        </div>
        <div style={{ flexShrink: 0, color: 'var(--text-muted)', marginLeft: 6 }}>
          {expanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', animation: 'fadeIn 0.25s ease', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Fraud score */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>PADS Fraud Score</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{claim.adjudication_type ?? 'AUTO'}</span>
            </div>
            <FraudScore score={claim.fraud_score} />
          </div>

          {/* Zone + DSI */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ background: 'var(--bg-700)', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 2 }}>Zone</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{claim.zone_name ?? '—'}</div>
            </div>
            <div style={{ background: 'var(--bg-700)', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 2 }}>DSI Score</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--amber)' }}>{Number(claim.dsi_score ?? 0).toFixed(0)}/100</div>
            </div>
          </div>

          {/* Fraud logs */}
          {Array.isArray(claim.fraud_logs) && claim.fraud_logs.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>PADS Check Results</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {claim.fraud_logs.map((log, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: 8, background: 'var(--bg-700)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{log.check_type?.replace(/_/g,' ')}</span>
                    <span className={`badge ${log.result === 'PASS' ? 'badge-success' : log.result === 'FAIL' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                      {log.result}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Claim ID */}
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            ID: {String(claim.id).slice(0, 24)}…
          </div>
        </div>
      )}
    </div>
  )
}

export default function ClaimsHistory() {
  const workerId  = localStorage.getItem('gs_worker_id')
  const [claims, setClaims]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [filter, setFilter]   = useState('ALL')
  const [search, setSearch]   = useState('')

  useEffect(() => {
    getWorkerClaims(workerId)
      .then(res => setClaims(res.data.claims ?? []))
      .catch(err => setError(getErrorMsg(err)))
      .finally(() => setLoading(false))
  }, [])

  const FILTERS = ['ALL', 'PAID', 'APPROVED', 'INITIATED', 'REJECTED', 'FLAGGED']

  const visible = claims.filter(c => {
    if (filter !== 'ALL' && c.status !== filter) return false
    if (search && !c.trigger_type?.toLowerCase().includes(search.toLowerCase()) && !c.zone_name?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ padding: '52px 20px 16px' }}>
        <div style={{ fontFamily: 'Poppins', fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Claims History</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{claims.length} total claims</div>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search trigger or zone…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36, fontSize: '0.88rem' }} />
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px', borderRadius: 99, whiteSpace: 'nowrap', fontSize: '0.78rem', fontWeight: 600,
                background: filter === f ? 'var(--amber)' : 'var(--bg-700)',
                color:      filter === f ? '#fff' : 'var(--text-muted)',
                border:     filter === f ? '1.5px solid var(--amber)' : '1.5px solid var(--border)',
                transition: 'all 0.15s',
              }}>{f}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading && (
          [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 20 }} />)
        )}

        {!loading && visible.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🛡️</div>
            <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>No claims yet</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 6 }}>Claims auto-appear when a weather trigger fires</div>
          </div>
        )}

        {visible.map(c => <ClaimCard key={c.id} claim={c} />)}

        {error && (
          <div style={{ padding: 14, borderRadius: 10, background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.82rem' }}>⚠️ {error}</div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
