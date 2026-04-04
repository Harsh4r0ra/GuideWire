/**
 * DSI Heatmap — Leaflet map with 25 zone markers.
 * Loads Leaflet from CDN (no npm bundle bloat for demo).
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { getDSIHeatmap } from '../../services/api.js'

// DSI level → colour + emoji
const LEVEL_META = {
  NORMAL:   { color: '#10B981', emoji: '🟢', label: 'Normal'   },
  ELEVATED: { color: '#F59E0B', emoji: '🟡', label: 'Elevated' },
  HIGH:     { color: '#F97316', emoji: '🟠', label: 'High'     },
  CRITICAL: { color: '#EF4444', emoji: '🔴', label: 'Critical' },
}

const LEVEL_ALIASES = {
  LOW: 'NORMAL',
  MODERATE: 'ELEVATED',
  MEDIUM: 'ELEVATED',
  SEVERE: 'HIGH',
}

function getDSILevel(score) {
  if (score < 30) return 'NORMAL'
  if (score < 50) return 'ELEVATED'
  if (score < 70) return 'HIGH'
  return 'CRITICAL'
}

function resolveLevelKey(rawLevel, score) {
  const normalized = String(rawLevel ?? '').trim().toUpperCase()
  if (LEVEL_META[normalized]) return normalized
  if (LEVEL_ALIASES[normalized]) return LEVEL_ALIASES[normalized]
  return getDSILevel(score)
}

function toFiniteNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function normalizeZones(rawZones) {
  if (!Array.isArray(rawZones)) return []

  return rawZones
    .map((z, idx) => {
      const lat = toFiniteNumber(z?.lat)
      const lng = toFiniteNumber(z?.lng)
      const score = toFiniteNumber(z?.dsi_score)

      if (lat === null || lng === null) return null
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null

      return {
        ...z,
        _key: z?.id ? String(z.id) : z?.zone_id ? String(z.zone_id) : `zone-${idx}`,
        lat,
        lng,
        dsi_score: score ?? (Math.random() * 80 + 10),
        source_level: z?.level,
      }
    })
    .filter(Boolean)
}

export default function DSIHeatmap({ zones: propZones }) {
  const mapRef    = useRef(null)
  const leafletRef= useRef(null)
  const markerLayerRef = useRef(null)
  const [zones, setZones]     = useState(propZones ?? [])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading]  = useState(!propZones)
  const normalizedZones = useMemo(() => normalizeZones(zones), [zones])

  // Load & inject Leaflet script once
  useEffect(() => {
    if (window.L) { initMap(); return }
    const link = document.createElement('link')
    link.rel  = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src  = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = initMap
    document.head.appendChild(script)

    return () => destroyMap()
  }, [])

  // Refresh zones from API if not provided as prop
  useEffect(() => {
    if (propZones) { setZones(propZones); return }
    getDSIHeatmap()
      .then(r => setZones(r.data?.zones ?? r.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [propZones])

  // Re-draw markers when zones change
  useEffect(() => {
    if (!leafletRef.current || normalizedZones.length === 0) return
    updateMarkers()
  }, [normalizedZones])

  useEffect(() => {
    if (!leafletRef.current || normalizedZones.length === 0) return
    const map = leafletRef.current
    const handleResize = () => {
      try {
        map.invalidateSize()
      } catch {
        // Ignore invalidate errors during teardown.
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [normalizedZones.length])

  function destroyMap() {
    if (leafletRef.current) {
      try {
        leafletRef.current.off()
        leafletRef.current.remove()
      } catch {
        // Ignore teardown errors during strict mode remount.
      }
      leafletRef.current = null
      markerLayerRef.current = null
    }
  }

  function initMap() {
    if (leafletRef.current || !mapRef.current) return
    const L   = window.L
    const map = L.map(mapRef.current, {
      center:     [20.5937, 78.9629],
      zoom:       5,
      zoomControl: true,
    })
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains:  'abcd',
      maxZoom:     19,
    }).addTo(map)
    markerLayerRef.current = L.layerGroup().addTo(map)
    leafletRef.current = map

    // Ensure renderer bounds are initialized before adding paths.
    map.whenReady(() => {
      map.invalidateSize()
      if (normalizedZones.length > 0) updateMarkers()
    })
  }

  function updateMarkers() {
    const L   = window.L
    const map = leafletRef.current
    const markerLayer = markerLayerRef.current
    if (!L || !map || !markerLayer) return

    if (!map._loaded) {
      map.whenReady(() => updateMarkers())
      return
    }

    // Clear only marker layer and keep base tile layer intact.
    markerLayer.clearLayers()

    normalizedZones.forEach(z => {
      const score = Number(z.dsi_score)
      const level = resolveLevelKey(z.source_level, score)
      const meta  = LEVEL_META[level]

      try {
        const circle = L.circleMarker([z.lat, z.lng], {
          radius:      14 + (score / 100) * 10,
          color:       meta.color,
          fillColor:   meta.color,
          fillOpacity: 0.5,
          weight:      2,
          opacity:     0.9,
        }).addTo(markerLayer)

        circle.bindTooltip(`${meta.emoji} ${meta.label}`, {
          className: 'gs-level-label',
          permanent: true,
          direction: 'center',
          interactive: false,
          opacity: 1,
        }).openTooltip()

        circle.on('click', () => setSelected({ ...z, dsi_score: score, level, meta }))
      } catch {
        // Skip a marker if Leaflet rejects render state for this frame.
      }
    })
  }

  const selMeta = selected ? (LEVEL_META[selected.level] ?? LEVEL_META.NORMAL) : null

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      {/* Map */}
      <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: 'inherit' }} />

      {loading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.8)', borderRadius: 'inherit' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading DSI data…</div>
        </div>
      )}

      {/* Zone info tooltip overlay */}
      {selected && (
        <div style={{
          position: 'absolute', bottom: 16, left: 16, right: 16, zIndex: 1000,
          background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)',
          border: `1px solid ${selMeta.color}40`, borderRadius: 16, padding: '16px',
          animation: 'fadeInUp 0.2s ease',
        }}>
          <button onClick={() => setSelected(null)}
            style={{ position: 'absolute', top: 10, right: 12, color: 'var(--text-muted)', fontSize: '1.1rem' }}>×</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: '1.5rem' }}>{selMeta.emoji}</span>
            <div>
              <div style={{ fontWeight: 700 }}>{selected.name ?? selected.zone_name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selected.city}</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: '1.5rem', color: selMeta.color }}>
                {Math.round(selected.dsi_score)}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>DSI / 100</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              ['Active Policies', selected.active_policies ?? '—'],
              ['Radius', `${selected.radius_km ?? 3} km`],
              ['Status', selMeta.label],
            ].map(([k, v]) => (
              <div key={k} style={{ flex: 1, background: 'var(--bg-700)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 2 }}>{k}</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 999, background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(8px)', borderRadius: 10, padding: '10px 14px', fontSize: '0.72rem' }}>
        <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--text-muted)' }}>DSI Level</div>
        {Object.entries(LEVEL_META).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: v.color }} />
            <span style={{ color: 'var(--text-secondary)' }}>{v.label}</span>
          </div>
        ))}
      </div>

      {/* Tooltip styling */}
      <style>{`
        .gs-level-label {
          background: rgba(15, 23, 42, 0.85) !important;
          border: 1px solid rgba(148, 163, 184, 0.2) !important;
          color: #E2E8F0 !important;
          font-family: Inter, sans-serif;
          font-weight: 700;
          font-size: 10px;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          padding: 2px 6px;
          border-radius: 999px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          white-space: nowrap;
        }
        .gs-level-label::before { display: none; }
        .leaflet-container { background: #0F172A; }
      `}</style>
    </div>
  )
}
