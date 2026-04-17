import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw, MapPin, Users, ChevronRight, Zap } from 'lucide-react'
import { getWorkerDashboard, getZoneDSI, getErrorMsg } from '../services/api.js'
import { getLocale, getStoredLanguage } from '../services/language.js'
import BottomNav from '../components/BottomNav.jsx'
import useWebSocket from '../hooks/useWebSocket.js'

const DSI_LEVEL_META = {
  NORMAL:    { labelKey: 'dsiClear',    color: '#10B981', emoji: '☀️',  bg: 'rgba(16,185,129,0.1)'  },
  ELEVATED:  { labelKey: 'dsiElevated', color: '#F59E0B', emoji: '🌤️', bg: 'rgba(245,158,11,0.1)'  },
  HIGH:      { labelKey: 'dsiHighRisk', color: '#F97316', emoji: '⛈️', bg: 'rgba(249,115,22,0.1)'  },
  CRITICAL:  { labelKey: 'dsiStorm',    color: '#EF4444', emoji: '🌪️', bg: 'rgba(239,68,68,0.14)'  },
}

const DSI_LEVEL_ALIASES = {
  LOW: 'NORMAL',
  MODERATE: 'ELEVATED',
  MEDIUM: 'ELEVATED',
  SEVERE: 'HIGH',
}

const PLAN_COVER = { LOW: 1500, MEDIUM: 3000, HIGH: 5000 }
const PLAN_LABELS = {
  en: { LOW: 'Basic Shield', MEDIUM: 'Pro Shield', HIGH: 'Elite Shield' },
  hi: { LOW: 'बेसिक कवच', MEDIUM: 'प्रो कवच', HIGH: 'एलीट कवच' },
}

// 7-day mock DSI forecast (index 0 = today)
const FORECAST_LABELS = {
  en: ['Today', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  hi: ['आज', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'रवि'],
}

const COPY = {
  en: {
    good: 'Good',
    live: 'Live',
    weeklyCoverage: 'Weekly coverage',
    active: 'ACTIVE',
    inactive: 'INACTIVE',
    plan: 'Plan',
    weeklyPremium: 'Weekly premium',
    expires: 'Expires',
    totalReceived: 'Total received',
    zoneWeatherRisk: 'Zone Weather Risk',
    dsiScore: 'DSI Score / 100',
    forecastTitle: '7-Day DSI Forecast',
    totalClaims: 'Total claims',
    shieldPoolActive: 'Shield Pool Active',
    membersDiscount: '{members} members · {discount}% premium discount',
    autoProtection: 'Auto-protection ON',
    autoProtectionDesc: 'Claims auto-trigger when DSI > threshold',
    quickRoutes: 'Quick Routes',
    claims: 'Claims',
    stormMode: 'Storm Mode',
    payout: 'Payout',
    admin: 'Admin',
    dsiClear: 'Clear',
    dsiElevated: 'Elevated',
    dsiHighRisk: 'High Risk',
    dsiStorm: 'STORM',
  },
  hi: {
    good: 'शुभ',
    live: 'लाइव',
    weeklyCoverage: 'साप्ताहिक कवरेज',
    active: 'सक्रिय',
    inactive: 'निष्क्रिय',
    plan: 'प्लान',
    weeklyPremium: 'साप्ताहिक प्रीमियम',
    expires: 'समाप्ति',
    totalReceived: 'कुल प्राप्त',
    zoneWeatherRisk: 'ज़ोन मौसम जोखिम',
    dsiScore: 'DSI स्कोर / 100',
    forecastTitle: '7-दिन DSI पूर्वानुमान',
    totalClaims: 'कुल दावे',
    shieldPoolActive: 'शील्ड पूल सक्रिय',
    membersDiscount: '{members} सदस्य · {discount}% प्रीमियम छूट',
    autoProtection: 'ऑटो-प्रोटेक्शन चालू',
    autoProtectionDesc: 'DSI सीमा पार होने पर दावे स्वतः ट्रिगर होते हैं',
    quickRoutes: 'त्वरित मार्ग',
    claims: 'दावे',
    stormMode: 'तूफान मोड',
    payout: 'भुगतान',
    admin: 'एडमिन',
    dsiClear: 'सामान्य',
    dsiElevated: 'बढ़ा हुआ',
    dsiHighRisk: 'उच्च जोखिम',
    dsiStorm: 'तूफान',
  },
}

const mockForecast = () => FORECAST_LABELS.en.map(() => Math.floor(Math.random() * 80 + 15))

function resolveDsiLevel(level) {
  const normalized = String(level ?? '').trim().toUpperCase()
  if (DSI_LEVEL_META[normalized]) return normalized
  if (DSI_LEVEL_ALIASES[normalized]) return DSI_LEVEL_ALIASES[normalized]
  return 'NORMAL'
}

export default function Home() {
  const workerId    = localStorage.getItem('gs_worker_id')
  const workerName  = localStorage.getItem('gs_worker_name') ?? 'Partner'
  const language = getStoredLanguage()
  const locale = getLocale(language)
  const copy = COPY[language] ?? COPY.en
  const forecastLabels = FORECAST_LABELS[language] ?? FORECAST_LABELS.en
  const { connected } = useWebSocket()

  const [data, setData]         = useState(null)
  const [dsi, setDsi]           = useState(null)
  const [forecast]              = useState(mockForecast)
  const [loading, setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError]       = useState('')

  const load = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    try {
      const res = await getWorkerDashboard(workerId)
      setData(res.data)
      if (res.data.worker?.zone_id) {
        const dsiRes = await getZoneDSI(res.data.worker.zone_id)
        setDsi(dsiRes.data)
      }
    } catch (err) {
      setError(getErrorMsg(err))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <LoadingState />

  const policy = data?.active_policy
  const worker = data?.worker
  const claims = data?.claims_summary
  const payouts= data?.payout_summary
  const tier   = policy?.plan_tier ?? 'MEDIUM'
  const coverage = PLAN_COVER[tier] ?? 3000
  const premium  = parseFloat(policy?.premium_amount ?? 30)
  const planLabels = PLAN_LABELS[language] ?? PLAN_LABELS.en
  const planDisplayLabel = planLabels[tier] ?? `${tier} Shield`

  const dsiLevel = resolveDsiLevel(dsi?.level)
  const dsiMeta  = DSI_LEVEL_META[dsiLevel] ?? DSI_LEVEL_META.NORMAL
  const dsiLabel = copy[dsiMeta.labelKey] ?? COPY.en[dsiMeta.labelKey] ?? dsiMeta.labelKey
  const dsiScore = dsi?.dsi_score ?? 32

  const maxBar = Math.max(...forecast, 1)

  return (
    <div className="page-container">
      {/* Top bar */}
      <div style={{ padding: '52px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {copy.good} {getGreeting(language)}
          </div>
          <div style={{ fontFamily: 'Poppins', fontSize: '1.45rem', fontWeight: 800, marginTop: 2 }}>
            {workerName.split(' ')[0]} 👋
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {connected && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--success-bg)', padding: '5px 10px', borderRadius: 99 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 700 }}>{copy.live}</span>
            </div>
          )}
          <button onClick={() => load(true)} style={{ color: 'var(--text-muted)', display: 'flex' }}>
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Shield Status Card ── */}
        <div style={{
          borderRadius: 24, padding: '24px',
          background: policy
            ? 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(15,23,42,0.95))'
            : 'linear-gradient(135deg, rgba(246,68,68,0.1), rgba(15,23,42,0.95))',
          border: `1.5px solid ${policy ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, fontSize: '8rem', opacity: 0.06, pointerEvents: 'none' }}>🛡️</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '2.6rem', marginBottom: 8 }} className="animate-shield-pulse">🛡️</div>
              <div style={{ fontFamily: 'Poppins', fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>
                ₹{coverage.toLocaleString(locale)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{copy.weeklyCoverage}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 99,
                background: policy ? 'var(--success-bg)' : 'var(--danger-bg)',
              }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: policy ? 'var(--success)' : 'var(--danger)', animation: policy ? 'pulse 2s infinite' : 'none' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: policy ? 'var(--success)' : 'var(--danger)' }}>
                  {policy ? copy.active : copy.inactive}
                </span>
              </div>
              {policy && (
                <div style={{ marginTop: 10, textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{copy.plan}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{planDisplayLabel}</div>
                </div>
              )}
            </div>
          </div>

          {policy && (
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{copy.weeklyPremium}</div>
                <div style={{ fontWeight: 700, color: 'var(--amber)' }}>₹{premium}/wk</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{copy.expires}</div>
                <div style={{ fontWeight: 700 }}>{policy.end_date ? new Date(policy.end_date).toLocaleDateString(locale, { day: 'numeric', month: 'short' }) : '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{copy.totalReceived}</div>
                <div style={{ fontWeight: 700, color: 'var(--success)' }}>₹{(payouts?.total_received ?? 0).toLocaleString(locale)}</div>
              </div>
            </div>
          )}
        </div>

        {/* ── DSI Zone Card ── */}
        <div className="card" style={{ background: dsiMeta.bg, borderColor: `${dsiMeta.color}30` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                {copy.zoneWeatherRisk}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.8rem' }}>{dsiMeta.emoji}</span>
                <div>
                  <div style={{ fontWeight: 800, color: dsiMeta.color, fontSize: '1.05rem' }}>{dsiLabel}</div>
                  {worker?.zone_name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <MapPin size={11} /> {worker.zone_name}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Poppins', fontSize: '2rem', fontWeight: 900, color: dsiMeta.color }}>{dsiScore}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{copy.dsiScore}</div>
            </div>
          </div>

          {/* DSI bar */}
          <div style={{ height: 6, borderRadius: 99, background: 'var(--bg-700)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${dsiScore}%`, background: `linear-gradient(90deg, ${dsiMeta.color}80, ${dsiMeta.color})`, borderRadius: 99, transition: 'width 1s ease' }} />
          </div>
        </div>

        {/* ── 7-day DSI Forecast ── */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>
            {copy.forecastTitle}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 72 }}>
            {forecast.map((val, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div style={{
                  width: '100%',
                  height: `${(val / maxBar) * 60}px`,
                  borderRadius: '4px 4px 0 0',
                  background: i === 0
                    ? `linear-gradient(to top, ${dsiMeta.color}cc, ${dsiMeta.color})`
                    : 'var(--bg-700)',
                  transition: 'height 0.6s ease',
                  animationDelay: `${i * 0.05}s`,
                  minHeight: 4,
                }} />
                <span style={{ fontSize: '0.58rem', color: i === 0 ? 'var(--amber)' : 'var(--text-muted)', fontWeight: i === 0 ? 700 : 400 }}>
                  {forecastLabels[i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Stats row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Poppins', fontSize: '1.7rem', fontWeight: 800, color: 'var(--amber)' }}>
              {claims?.total_claims ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{copy.totalClaims}</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Poppins', fontSize: '1.7rem', fontWeight: 800, color: 'var(--success)' }}>
              ₹{(payouts?.total_received ?? 0).toLocaleString(locale)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{copy.totalReceived}</div>
          </div>
        </div>

        {/* ── Shield Pool ── */}
        {policy?.pool_id && (
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={22} style={{ color: 'var(--info)' }} />
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{copy.shieldPoolActive}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {copy.membersDiscount
                    .replace('{members}', policy?.member_count ?? 0)
                    .replace('{discount}', policy?.premium_discount_pct ?? 10)}
              </div>
            </div>
            <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
        )}

        {/* ── Quick action ── */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.2)' }}>
          <div style={{ fontSize: '1.5rem' }}>⚡</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--amber)' }}>{copy.autoProtection}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{copy.autoProtectionDesc}</div>
          </div>
        </div>

        {/* ── Quick routes ── */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
            {copy.quickRoutes}
          </div>
          <div className="quick-links-grid">
            <Link className="quick-link-btn" to="/claims">{copy.claims}</Link>
            <Link className="quick-link-btn" to="/storm">{copy.stormMode}</Link>
            <Link className="quick-link-btn" to="/payout">{copy.payout}</Link>
            <Link className="quick-link-btn" to="/admin">{copy.admin}</Link>
          </div>
        </div>

      </div>

      {error && (
        <div style={{ margin: '12px 20px', padding: 14, borderRadius: 10, background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.82rem' }}>
          ⚠️ {error}
        </div>
      )}

      <BottomNav />
    </div>
  )
}

function getGreeting(language) {
  const h = new Date().getHours()
  if (language === 'hi') {
    if (h < 12) return 'सुबह'
    if (h < 17) return 'दोपहर'
    return 'शाम'
  }
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function LoadingState() {
  return (
    <div className="page-container" style={{ padding: '52px 20px 0' }}>
      <div style={{ height: 40, borderRadius: 8, marginBottom: 24 }} className="skeleton" />
      <div style={{ height: 160, borderRadius: 24, marginBottom: 16 }} className="skeleton" />
      <div style={{ height: 100, borderRadius: 20, marginBottom: 16 }} className="skeleton" />
      <div style={{ height: 90, borderRadius: 20 }} className="skeleton" />
      <BottomNav />
    </div>
  )
}
