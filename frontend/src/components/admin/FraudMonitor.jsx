/**
 * Fraud Monitor — live scrolling feed from backend fraud_logs.
 */
import { useCallback, useEffect, useState } from 'react'
import { Shield, AlertTriangle, XCircle, CheckCircle } from 'lucide-react'
import api from '../../services/api.js'

const RESULT_META = {
  PASS:    { color: 'var(--success)', bg: 'rgba(16,185,129,0.1)',  Icon: CheckCircle, label: 'PASS' },
  FAIL:    { color: 'var(--danger)',  bg: 'rgba(239,68,68,0.1)',   Icon: XCircle,     label: 'FAIL' },
  WARN:    { color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)',  Icon: AlertTriangle, label: 'WARN' },
  REVIEW:  { color: 'var(--info)',    bg: 'rgba(59,130,246,0.1)',  Icon: Shield,       label: 'REVIEW' },
}

export default function FraudMonitor({ liveEvents }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchLogs = useCallback(async () => {
    try {
      const res = await api.get('/admin/fraud/logs', { params: { limit: 20 } })
      const nextLogs = res.data?.logs ?? []
      setLogs(Array.isArray(nextLogs) ? nextLogs : [])
      setError('')
    } catch {
      setError('Unable to sync fraud logs from backend.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLogs()
    const id = setInterval(fetchLogs, 8000)
    return () => clearInterval(id)
  }, [fetchLogs])

  // Pull fresh data immediately when new live events arrive.
  useEffect(() => {
    if (!liveEvents?.length) return
    const lastType = liveEvents[0]?.type
    if (lastType === 'CLAIM_STATUS_UPDATE' || lastType === 'TRIGGER_FIRED') {
      fetchLogs()
    }
  }, [liveEvents, fetchLogs])

  const isNew = (checked_at) => Date.now() - new Date(checked_at).getTime() < 60_000

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          PADS Fraud Monitor
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '0.68rem', color: 'var(--success)' }}>Live</span>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 10, padding: '8px 10px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5', fontSize: '0.74rem' }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {loading && logs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            Loading fraud checks...
          </div>
        )}

        {!loading && logs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            No fraud checks yet.
          </div>
        )}

        {logs.map((log, i) => {
          const meta  = RESULT_META[log.result] ?? RESULT_META.PASS
          const Icon  = meta.Icon
          const fresh = isNew(log.checked_at)
          return (
            <div key={log.id ?? i} style={{
              padding: '10px 12px', borderRadius: 10,
              background: meta.bg,
              border:     `1px solid ${meta.color}30`,
              display:    'flex', alignItems: 'center', gap: 10,
              animation:  fresh ? 'fadeInUp 0.3s ease' : 'none',
              transition: 'opacity 0.3s',
            }}>
              <Icon size={15} style={{ color: meta.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{log.check_type?.replace(/_/g,' ')}</span>
                  {fresh && (
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--amber)', background: 'rgba(245,158,11,0.15)', padding: '2px 7px', borderRadius: 99, letterSpacing: '0.06em' }}>NEW</span>
                  )}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  conf: {(log.confidence * 100).toFixed(0)}% · {relativeTime(log.checked_at)}
                </div>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: meta.color, padding: '2px 8px', borderRadius: 99, background: `${meta.color}20`, whiteSpace: 'nowrap' }}>
                {meta.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function relativeTime(iso) {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (secs < 60)  return `${secs}s ago`
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  return `${Math.floor(secs / 3600)}h ago`
}
