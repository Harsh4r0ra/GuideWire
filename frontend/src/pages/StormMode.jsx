import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Shield, Clock, CheckCircle, Loader } from 'lucide-react'
import useWebSocket from '../hooks/useWebSocket.js'

const STEPS = [
  { id: 1, label: 'Trigger detected',      sublabel: 'DSI threshold crossed' },
  { id: 2, label: 'Claim auto-created',    sublabel: 'Policy matched to zone' },
  { id: 3, label: 'PADS validation',       sublabel: 'Physics-based fraud check' },
  { id: 4, label: 'Payout initiated',      sublabel: 'Razorpay → UPI transfer' },
]

export default function StormMode() {
  const location   = useLocation()
  const { connected } = useWebSocket()

  // Get storm data from navigation state or sessionStorage
  const rawData    = location.state ?? JSON.parse(sessionStorage.getItem('gs_storm') ?? '{}')
  const stormData  = {
    trigger_type: rawData.trigger_type ?? 'HEAVY_RAIN',
    dsi_score:    rawData.dsi_score    ?? 78,
    claim_amount: rawData.claim_amount ?? 420,
    claim_id:     rawData.claim_id,
    eta_seconds:  rawData.eta_seconds  ?? 180,
  }

  const [currentStep, setCurrentStep] = useState(1)
  const [eta, setEta]                 = useState(stormData.eta_seconds)
  const [done, setDone]               = useState(false)
  const timerRef  = useRef(null)
  const stepTimer = useRef(null)

  const TRIGGER_META = {
    HEAVY_RAIN:     { emoji: '🌧️', label: 'Heavy Rain',  color: '#3B82F6' },
    FLOOD:          { emoji: '🌊', label: 'Flood Alert', color: '#1D4ED8' },
    HEATWAVE:       { emoji: '🔥', label: 'Heatwave',    color: '#EF4444' },
    POLLUTION:      { emoji: '🌫️', label: 'High AQI',   color: '#6B7280' },
    CURFEW:         { emoji: '🚧', label: 'Civic Event', color: '#F59E0B' },
    COMPOSITE_DSI:  { emoji: '⚡', label: 'DSI Alert',   color: '#F97316' },
  }
  const meta = TRIGGER_META[stormData.trigger_type] ?? TRIGGER_META['COMPOSITE_DSI']

  // Countdown ETA
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setEta(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  // Step progression (0→1→2→3→4)
  useEffect(() => {
    const delays = [0, 3000, 8000, 14000]
    delays.forEach((delay, idx) => {
      setTimeout(() => setCurrentStep(idx + 1), delay)
    })
    setTimeout(() => setDone(true), 28000)
    return () => {}
  }, [])

  const fmtEta = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const dsiPct  = Math.min(100, stormData.dsi_score)

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(160deg, var(--storm-1) 0%, var(--storm-2) 40%, var(--storm-3) 100%)`,
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Animated background rings */}
      {[1,2,3].map(i => (
        <div key={i} style={{
          position: 'absolute', top: '30%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: `${i * 180}px`, height: `${i * 180}px`,
          borderRadius: '50%',
          border: '1px solid rgba(239,68,68,0.15)',
          animation: `pulseDanger ${1.5 + i * 0.4}s infinite`,
          animationDelay: `${i * 0.3}s`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Header */}
      <div style={{ padding: '52px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FBBF24', animation: 'pulseDanger 1.5s infinite' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            STORM MODE ACTIVE
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/home" style={{ padding: '6px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.82)', fontSize: '0.75rem', fontWeight: 600 }}>
            Home
          </Link>
          <Link to="/admin/login" style={{ padding: '6px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.82)', fontSize: '0.75rem', fontWeight: 600 }}>
            Admin
          </Link>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>DSI: {dsiPct}/100</div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', position: 'relative', zIndex: 2, gap: 28 }}>

        {/* Icon + claim amount */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '5rem', marginBottom: 12, animation: 'heroFloat 2s ease-in-out infinite', display: 'inline-block' }}>
            {meta.emoji}
          </div>
          <div style={{ fontFamily: 'Poppins', fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
            {meta.label} Detected
          </div>
          <div style={{ fontFamily: 'Poppins', fontSize: '3.2rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
            ₹{stormData.claim_amount.toLocaleString()}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', marginTop: 6 }}>
            incoming to your UPI
          </div>
        </div>

        {/* ETA timer */}
        {!done && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)',
            padding: '12px 22px', borderRadius: 99,
          }}>
            <Clock size={16} style={{ color: '#FBBF24' }} />
            <span style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.2rem', color: '#FBBF24' }}>
              {fmtEta(eta)}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>estimated ETA</span>
          </div>
        )}

        {/* 4-step progress */}
        <div style={{ width: '100%', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)', borderRadius: 20, padding: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
          {STEPS.map((s, i) => {
            const isComplete = currentStep > s.id
            const isActive   = currentStep === s.id
            return (
              <div key={s.id} style={{ display: 'flex', gap: 14, marginBottom: i < STEPS.length - 1 ? 16 : 0, alignItems: 'flex-start' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isComplete ? 'var(--success)' : isActive ? '#FCD34D' : 'rgba(255,255,255,0.1)',
                  border: `2px solid ${isComplete ? 'var(--success)' : isActive ? '#FCD34D' : 'rgba(255,255,255,0.2)'}`,
                  transition: 'all 0.3s',
                }}>
                  {isComplete
                    ? <CheckCircle size={16} style={{ color: '#fff' }} />
                    : isActive
                    ? <Loader size={15} style={{ color: '#000', animation: 'spin 1s linear infinite' }} />
                    : <span style={{ fontWeight: 800, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{s.id}</span>
                  }
                </div>
                <div style={{ paddingTop: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isComplete ? '#fff' : isActive ? '#FCD34D' : 'rgba(255,255,255,0.4)' }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                    {s.sublabel}
                  </div>
                </div>
                {isActive && (
                  <div style={{ marginLeft: 'auto', paddingTop: 6 }}>
                    <Loader size={14} style={{ color: '#FCD34D', animation: 'spin 1s linear infinite' }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Done message */}
        {done && (
          <div style={{ textAlign: 'center', animation: 'fadeInUp 0.5s ease' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>✅</div>
            <div style={{ fontFamily: 'Poppins', fontWeight: 800, color: '#fff', fontSize: '1.1rem' }}>
              Payout Initiated!
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginTop: 4 }}>
              Money on its way to your UPI account
            </div>
          </div>
        )}

        {/* PADS badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.25)', padding: '8px 16px', borderRadius: 99 }}>
          <Shield size={13} style={{ color: 'var(--success)' }} />
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)' }}>PADS physics-based fraud check active</span>
        </div>
      </div>
    </div>
  )
}
