/**
 * Trigger Timeline — scrollable list of recent trigger events.
 */
import { useState, useEffect } from 'react'
import api from '../../services/api.js'

const TYPE_META = {
  HEAVY_RAIN:    { emoji: '🌧️', color: '#3B82F6' },
  FLOOD:         { emoji: '🌊', color: '#1D4ED8' },
  HEATWAVE:      { emoji: '🔥', color: '#EF4444' },
  POLLUTION:     { emoji: '🌫️', color: '#6B7280' },
  CURFEW:        { emoji: '🚧', color: '#F59E0B' },
  COMPOSITE_DSI: { emoji: '⚡', color: '#F97316' },
}

function relativeTime(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  return `${Math.floor(s / 3600)}h ago`
}

export default function TriggerTimeline({ liveEvents }) {
  const [triggers, setTriggers] = useState([])

  useEffect(() => {
    api.get('/triggers/active')
      .then(r => setTriggers(r.data.triggers ?? []))
      .catch(() => {})
  }, [])

  // Prepend live WS events
  useEffect(() => {
    if (!liveEvents?.length) return
    const fresh = liveEvents
      .filter(e => e.type === 'TRIGGER_FIRED')
      .map(e => ({
        id:             e.payload?.trigger_id,
        type:           e.payload?.type,
        dsi_score:      e.payload?.dsi_score,
        zone_name:      e.payload?.zone_name ?? 'Zone',
        city:           e.payload?.city ?? '',
        claims_count:   e.payload?.claims_created ?? 0,
        detected_at:    new Date().toISOString(),
        source:         e.payload?.source ?? 'LIVE',
      }))
    if (fresh.length) setTriggers(p => [...fresh, ...p].slice(0, 20))
  }, [liveEvents])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
        Recent Triggers
      </div>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {triggers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            No active triggers · Use the Demo Panel ⚡
          </div>
        )}
        {triggers.map((t, i) => {
          const meta  = TYPE_META[t.type] ?? TYPE_META['COMPOSITE_DSI']
          const score = parseFloat(t.dsi_score ?? 0)
          return (
            <div key={t.id ?? i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
              borderRadius: 10, background: 'var(--bg-700)',
              border: `1px solid ${meta.color}30`,
              animation: i === 0 ? 'fadeInUp 0.25s ease' : 'none',
            }}>
              <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{meta.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {t.type?.replace(/_/g,' ')} — {t.zone_name}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {t.claims_count ?? 0} claims · {relativeTime(t.detected_at)}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.05rem', color: meta.color }}>{Math.round(score)}</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>DSI</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
