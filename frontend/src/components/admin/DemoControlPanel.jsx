/**
 * Demo Control Panel — ⚡ THE MAGIC BUTTON
 * Fires trigger → claim → PADS → payout pipeline with one click.
 */
import { useEffect, useState } from 'react'
import { Zap, Loader, CheckCircle, AlertTriangle } from 'lucide-react'
import api from '../../services/api.js'
import { getAdminZoneDisplayName } from '../../services/zoneNames.js'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const isUuid = (value) => UUID_PATTERN.test(String(value ?? '').trim())

const TRIGGER_TYPES = [
  { id: 'HEAVY_RAIN',    emoji: '🌧️', label: 'Heavy Rain',      dsi: 72 },
  { id: 'FLOOD',         emoji: '🌊', label: 'Flood',            dsi: 91 },
  { id: 'HEATWAVE',      emoji: '🔥', label: 'Heatwave',         dsi: 68 },
  { id: 'POLLUTION',     emoji: '🌫️', label: 'High AQI',        dsi: 61 },
  { id: 'CURFEW',        emoji: '🚧', label: 'Civic Disruption', dsi: 55 },
  { id: 'COMPOSITE_DSI', emoji: '⚡', label: 'Composite DSI',    dsi: 82 },
]

export default function DemoControlPanel({ zones, onTriggerFired }) {
  const cityCounters = new Map()
  const zoneOptions = Array.isArray(zones)
    ? zones
        .map((z, idx) => ({
          id: z?.id ? String(z.id) : z?.zone_id ? String(z.zone_id) : `zone-${idx}`,
          label: getAdminZoneDisplayName(z, cityCounters),
          valid: isUuid(z?.id ?? z?.zone_id),
        }))
        .filter((z) => z.valid)
    : []

  const [selectedZone,    setSelectedZone]    = useState(zoneOptions[0]?.id ?? '')
  const [selectedTrigger, setSelectedTrigger] = useState('HEAVY_RAIN')
  const [dsiOverride,     setDsiOverride]     = useState(72)
  const [loading,         setLoading]         = useState(false)
  const [lastResult,      setLastResult]      = useState(null)
  const [error,           setError]           = useState('')

  useEffect(() => {
    if (!zoneOptions.length) return
    const isValidSelection = zoneOptions.some((z) => z.id === selectedZone)
    if (!isValidSelection) {
      setSelectedZone(zoneOptions[0].id)
    }
  }, [zoneOptions, selectedZone])

  const fire = async () => {
    if (!selectedZone) { setError('Select a zone first'); return }
    setLoading(true); setError(''); setLastResult(null)
    try {
      const trigMeta = TRIGGER_TYPES.find(t => t.id === selectedTrigger)
      const res = await api.post('/triggers/inject', {
        zone_id:        selectedZone,
        type:           selectedTrigger,
        severity_value: dsiOverride / 10,
        dsi_score:      dsiOverride,
        source:         'DEMO_CONTROL_PANEL',
        raw_data:       { injected_by: 'admin', trigger_label: trigMeta?.label },
      })
      setLastResult(res.data)
      onTriggerFired?.(res.data)
    } catch (err) {
      setError(err?.response?.data?.message ?? err.message ?? 'Injection failed')
    } finally {
      setLoading(false)
    }
  }

  const selTrig = TRIGGER_TYPES.find(t => t.id === selectedTrigger)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Zone selector */}
      <div>
        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Target Zone
        </label>
        <select value={selectedZone} onChange={e => setSelectedZone(e.target.value)}
          className="input" style={{ fontSize: '0.9rem' }}>
          <option value="">— Select zone —</option>
          {zoneOptions.map((z) => (
            <option key={`zone-opt-${z.id}`} value={z.id}>{z.label}</option>
          ))}
        </select>
        {zoneOptions.length === 0 && (
          <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--warning)' }}>
            No valid backend zones found. Refresh the dashboard.
          </div>
        )}
      </div>

      {/* Trigger type grid */}
      <div>
        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
          Trigger Type
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {TRIGGER_TYPES.map(t => (
            <button key={t.id} onClick={() => { setSelectedTrigger(t.id); setDsiOverride(t.dsi) }}
              style={{
                padding: '10px 8px', borderRadius: 10, fontSize: '0.78rem', fontWeight: 600,
                background: selectedTrigger === t.id ? 'rgba(245,158,11,0.15)' : 'var(--bg-700)',
                border:     `1.5px solid ${selectedTrigger === t.id ? 'var(--amber)' : 'var(--border)'}`,
                color:      selectedTrigger === t.id ? 'var(--amber)' : 'var(--text-secondary)',
                transition: 'all 0.15s', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
              <span style={{ fontSize: '1.3rem' }}>{t.emoji}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* DSI severity slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            DSI Severity
          </label>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: dsiOverride >= 70 ? 'var(--danger)' : dsiOverride >= 50 ? 'var(--warning)' : 'var(--success)' }}>
            {dsiOverride}/100
          </span>
        </div>
        <input type="range" min={20} max={100} step={1} value={dsiOverride}
          onChange={e => setDsiOverride(Number(e.target.value))}
          style={{ width: '100%', accentColor: dsiOverride >= 70 ? '#EF4444' : dsiOverride >= 50 ? '#F59E0B' : '#10B981', height: 6 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: '0.68rem', color: 'var(--text-muted)' }}>
          <span>🟢 Normal</span><span>🟡 Elevated</span><span>🔴 Critical</span>
        </div>
      </div>

      {/* Fire button */}
      <button className="btn btn-danger btn-full" onClick={fire} disabled={loading || !selectedZone}
        style={{ padding: '16px', fontSize: '1.05rem', letterSpacing: '0.02em', boxShadow: '0 0 30px rgba(239,68,68,0.3)' }}>
        {loading
          ? <><Loader size={20} className="animate-spin" /> Injecting…</>
          : <><Zap size={20} /> ⚡ INJECT TRIGGER</>
        }
      </button>

      {/* Error */}
      {error && (
        <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger)', fontSize: '0.82rem', display: 'flex', gap: 8, alignItems: 'center' }}>
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {/* Success result */}
      {lastResult && (
        <div style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <CheckCircle size={18} style={{ color: 'var(--success)' }} />
            <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.9rem' }}>Trigger fired successfully!</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Trigger ID</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>{lastResult.trigger?.id?.slice(0, 18)}…</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Policies affected</span>
              <span style={{ fontWeight: 700, color: 'var(--amber)' }}>{lastResult.policies_affected}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Claims created</span>
              <span style={{ fontWeight: 700, color: 'var(--success)' }}>{lastResult.claims_created}</span>
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {selTrig && (
        <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--bg-700)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {selTrig.emoji} <strong style={{ color: 'var(--text-secondary)' }}>{selTrig.label}</strong> — DSI {dsiOverride} → pipeline: trigger → claims → PADS → payout
        </div>
      )}
    </div>
  )
}
