import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Check, Loader } from 'lucide-react'
import { registerWorker, subscribePlan, getErrorMsg } from '../services/api.js'
import ShapWaterfall from '../components/ShapWaterfall.jsx'

const CITIES    = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai']
const PLATFORMS = ['Blinkit', 'Zepto', 'Swiggy Instamart', 'Other']
const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi',   native: 'हिन्दी',   flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil',   native: 'தமிழ்',   flag: '🏳️' },
]

const TOTAL_STEPS = 7

const PLAN_LABELS = { LOW: 'Basic Shield', MEDIUM: 'Pro Shield', HIGH: 'Elite Shield' }
const PLAN_COVER  = { LOW: 1500, MEDIUM: 3000, HIGH: 5000 }
const PLAN_COLORS = { LOW: '#3B82F6', MEDIUM: '#F59E0B', HIGH: '#10B981' }

const tierMultiplier = (tier) => (tier === 'LOW' ? 0.7 : tier === 'HIGH' ? 1.4 : 1)
const tierPremium = (basePremium, tier) => Math.round(basePremium * tierMultiplier(tier))

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [slideDir, setSlideDir] = useState('right')

  // Form state
  const [language, setLanguage]           = useState('en')
  const [phone, setPhone]                 = useState('')
  const [name, setName]                   = useState('')
  const [city, setCity]                   = useState('')
  const [platform, setPlatform]           = useState('')
  const [earnings, setEarnings]           = useState(400)
  const [aadhaarLast4, setAadhaarLast4]   = useState('')
  const [upiId, setUpiId]                 = useState('')
  const [chosenTier, setChosenTier]       = useState('MEDIUM')

  // API results
  const [workerId, setWorkerId]           = useState(null)
  const [premiumData, setPremiumData]     = useState(null)

  const progressPct = ((step - 1) / (TOTAL_STEPS - 1)) * 100

  const goNext = async () => {
    setError('')
    if (step === 5) {
      // Step 5 → Step 6: call backend to register + get premium
      await doRegister()
      return
    }
    if (step === 7) {
      await doSubscribe()
      return
    }
    animateStep('right')
    setStep(s => s + 1)
  }

  const goPrev = () => {
    if (step === 1) return
    animateStep('left')
    setStep(s => s - 1)
  }

  const animateStep = (dir) => {
    setSlideDir(dir)
  }

  const doRegister = async () => {
    if (!aadhaarLast4 || aadhaarLast4.length !== 4) {
      setError('Enter the last 4 digits of Aadhaar')
      return
    }
    setLoading(true)
    try {
      const res = await registerWorker({
        name,
        phone:              `+91${phone.replace(/\D/g,'')}`,
        city,
        platform:           platform.toUpperCase().replace(/ /g,'_'),
        avg_daily_earnings: earnings,
        language_pref:      language,
        aadhaar_last4:      aadhaarLast4,
      })
      const { worker, recommended_plan } = res.data
      setWorkerId(worker.id)
      setPremiumData(recommended_plan)
      animateStep('right')
      setStep(6)
    } catch (err) {
      setError(getErrorMsg(err))
    } finally {
      setLoading(false)
    }
  }

  const doSubscribe = async () => {
    if (!upiId || upiId.length < 5) { setError('Enter a valid UPI ID'); return }
    setLoading(true)
    try {
      const res = await subscribePlan({
        worker_id: workerId,
        plan_tier: chosenTier,
        upi_id:    upiId,
        language,
      })
      localStorage.setItem('gs_worker_id', workerId)
      localStorage.setItem('gs_policy_id', res.data.policy.id)
      localStorage.setItem('gs_worker_name', name)
      localStorage.setItem('gs_language', language)
      navigate('/home')
    } catch (err) {
      setError(getErrorMsg(err))
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    if (step === 1) return !!language
    if (step === 2) return phone.replace(/\D/,'').length === 10
    if (step === 3) return name.length >= 2 && city && platform
    if (step === 4) return earnings >= 100
    if (step === 5) return aadhaarLast4.length === 4
    if (step === 6) return !!chosenTier
    if (step === 7) return upiId.length >= 5
    return true
  }

  const basePremium = Number(premiumData?.premium_inr ?? 0)
  const selectedPremium = premiumData ? tierPremium(basePremium, chosenTier) : 0
  const scaledExplanation = premiumData?.shap_explanation
    ? {
        ...premiumData.shap_explanation,
        base_premium_inr: tierPremium(basePremium, chosenTier),
        final_premium_inr: selectedPremium,
        top_factors: (premiumData.shap_explanation.top_factors ?? []).map((f) => ({
          ...f,
          impact_inr: Number((f.impact_inr * tierMultiplier(chosenTier)).toFixed(2)),
        })),
      }
    : null

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0 0 24px' }}>

      {/* Header */}
      <div style={{ padding: '20px 20px 12px', display: 'flex', alignItems: 'center', gap: 14 }}>
        {step > 1 && (
          <button onClick={goPrev} style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
            <ChevronLeft size={24} />
          </button>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Step {step} of {TOTAL_STEPS}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--amber)', fontWeight: 700 }}>{Math.round(progressPct)}%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className={`animate-${slideDir === 'right' ? 'slideInRight' : 'slideInLeft'}`}
        key={step}
        style={{ flex: 1, padding: '24px 20px 0', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {step <= 2 && (
          <div style={{ textAlign: 'right', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Already registered? <Link to="/login" style={{ color: 'var(--amber)', fontWeight: 700 }}>Login</Link>
          </div>
        )}

        {/* ── Step 1: Language ── */}
        {step === 1 && (
          <>
            <div>
              <h1 style={{ fontFamily: 'Poppins', fontSize: '1.7rem', marginBottom: 8 }}>Choose your language</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Select the language you're most comfortable in</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => setLanguage(l.code)}
                  style={{
                    padding: '16px 20px', borderRadius: 16,
                    background: language === l.code ? 'rgba(245,158,11,0.12)' : 'var(--bg-800)',
                    border: `2px solid ${language === l.code ? 'var(--amber)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
                    transition: 'all 0.2s',
                  }}>
                  <span style={{ fontSize: '1.8rem' }}>{l.flag}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{l.native}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{l.label}</div>
                  </div>
                  {language === l.code && <Check size={18} style={{ color: 'var(--amber)', marginLeft: 'auto' }} />}
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── Step 2: Phone ── */}
        {step === 2 && (
          <>
            <div>
              <h1 style={{ fontFamily: 'Poppins', fontSize: '1.7rem', marginBottom: 8 }}>Your phone number</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>We'll send OTP alerts on this number</p>
            </div>
            <div className="input-group">
              <label className="input-label">Mobile Number</label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ padding: '14px 16px', background: 'var(--bg-700)', borderRadius: 12, border: '1.5px solid var(--border)', fontWeight: 700, color: 'var(--amber)', fontSize: '1rem', whiteSpace: 'nowrap' }}>
                  +91
                </div>
                <input className="input" type="tel" inputMode="numeric" maxLength={10}
                  placeholder="Enter 10-digit number"
                  value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,''))} />
              </div>
            </div>
            <div style={{ padding: 16, borderRadius: 12, background: 'var(--info-bg)', border: '1px solid rgba(59,130,246,0.2)', fontSize: '0.82rem', color: '#93C5FD' }}>
              📱 Your number is only used for payout alerts and claim notifications.
            </div>
          </>
        )}

        {/* ── Step 3: Profile ── */}
        {step === 3 && (
          <>
            <div>
              <h1 style={{ fontFamily: 'Poppins', fontSize: '1.7rem', marginBottom: 8 }}>Your delivery profile</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>We use this to customise your shield</p>
            </div>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input className="input" type="text" placeholder="e.g. Raju Kumar"
                value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Your City</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {CITIES.map(c => (
                  <button key={c} onClick={() => setCity(c)}
                    style={{
                      padding: '11px 8px', borderRadius: 10, fontSize: '0.82rem', fontWeight: 600,
                      background: city === c ? 'rgba(245,158,11,0.15)' : 'var(--bg-700)',
                      border: `1.5px solid ${city === c ? 'var(--amber)' : 'var(--border)'}`,
                      color: city === c ? 'var(--amber)' : 'var(--text-secondary)',
                      transition: 'all 0.15s',
                    }}>{c}</button>
                ))}
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Platform</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {PLATFORMS.map(p => (
                  <button key={p} onClick={() => setPlatform(p)}
                    style={{
                      padding: '12px 16px', borderRadius: 10, textAlign: 'left', fontWeight: 600, fontSize: '0.9rem',
                      background: platform === p ? 'rgba(245,158,11,0.12)' : 'var(--bg-700)',
                      border: `1.5px solid ${platform === p ? 'var(--amber)' : 'var(--border)'}`,
                      color: platform === p ? 'var(--amber)' : 'var(--text-secondary)',
                      transition: 'all 0.15s',
                    }}>{p}</button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Step 4: Daily Earnings ── */}
        {step === 4 && (
          <>
            <div>
              <h1 style={{ fontFamily: 'Poppins', fontSize: '1.7rem', marginBottom: 8 }}>Your daily earnings</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>This helps us guarantee your premium is always fair</p>
            </div>
            <div style={{ textAlign: 'center', padding: '28px 0' }}>
              <div style={{ fontFamily: 'Poppins', fontSize: '3.5rem', fontWeight: 900, color: 'var(--amber)', animation: 'countUp 0.3s ease' }}>
                ₹{earnings}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>per day on average</div>
            </div>
            <div>
              <input type="range" min={100} max={1500} step={50} value={earnings}
                onChange={e => setEarnings(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--amber)', height: 6, cursor: 'pointer' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹100</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹1,500</span>
              </div>
            </div>
            <div className="card" style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.2)' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--success)', lineHeight: 1.6 }}>
                🛡️ <strong>Fairness Shield active</strong><br />
                Your premium will never exceed <strong>₹{Math.round(earnings * 7 * 0.05)}/week</strong> (5% of weekly earnings = ₹{earnings * 7})
              </div>
            </div>
          </>
        )}

        {/* ── Step 5: Verification ── */}
        {step === 5 && (
          <>
            <div>
              <h1 style={{ fontFamily: 'Poppins', fontSize: '1.7rem', marginBottom: 8 }}>Quick verification</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Required for KYC compliance (last 4 digits only)</p>
            </div>
            <div className="input-group">
              <label className="input-label">Aadhaar — Last 4 digits</label>
              <input className="input" type="text" inputMode="numeric" maxLength={4}
                placeholder="e.g. 7892"
                value={aadhaarLast4} onChange={e => setAadhaarLast4(e.target.value.replace(/\D/g,''))}
                style={{ fontSize: '1.5rem', letterSpacing: '0.5em', textAlign: 'center', fontWeight: 700 }} />
            </div>
            <div style={{ padding: 14, borderRadius: 12, background: 'var(--bg-800)', border: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              🔒 We store only the last 4 digits, encrypted. We are DPDPA-2023 compliant.
            </div>
          </>
        )}

        {/* ── Step 6: Your Shield (SHAP premium) ── */}
        {step === 6 && premiumData && (
          <>
            <div>
              <h1 style={{ fontFamily: 'Poppins', fontSize: '1.7rem', marginBottom: 4 }}>Your personalised shield 🛡️</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>AI-calculated. Fairness guaranteed.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(PLAN_LABELS).map(([tier, label]) => {
                const isRec = tier === premiumData.plan_tier
                const color = PLAN_COLORS[tier]
                const baseP = tierPremium(basePremium, tier)
                return (
                  <button key={tier} onClick={() => setChosenTier(tier)} style={{
                    padding: '16px 18px', borderRadius: 16, textAlign: 'left',
                    background: chosenTier === tier ? `rgba(${color === '#F59E0B' ? '245,158,11' : color === '#3B82F6' ? '59,130,246' : '16,185,129'},0.12)` : 'var(--bg-800)',
                    border: `2px solid ${chosenTier === tier ? color : 'var(--border)'}`,
                    transition: 'all 0.2s', cursor: 'pointer',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 3 }}>
                          {label} {isRec && <span style={{ marginLeft: 6, fontSize: '0.68rem', background: color, color: '#fff', padding: '2px 7px', borderRadius: 99, fontWeight: 800 }}>RECOMMENDED</span>}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>₹{PLAN_COVER[tier].toLocaleString()} coverage</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.4rem', color }}> ₹{baseP}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>/week</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* SHAP waterfall */}
            {scaledExplanation?.top_factors?.length > 0 && (
              <div className="card">
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                  Why this premium? (AI explanation)
                </div>
                <ShapWaterfall explanation={scaledExplanation} premium={selectedPremium} />
              </div>
            )}
          </>
        )}

        {/* ── Step 7: Activate ── */}
        {step === 7 && (
          <>
            <div>
              <h1 style={{ fontFamily: 'Poppins', fontSize: '1.7rem', marginBottom: 8 }}>Activate your shield ⚡</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Enter your UPI ID to receive instant payouts</p>
            </div>
            <div className="input-group">
              <label className="input-label">UPI ID</label>
              <input className="input" type="text" placeholder="e.g. raju@okaxis"
                value={upiId} onChange={e => setUpiId(e.target.value)} />
            </div>

            {/* Summary card */}
            <div className="card" style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.25)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--amber)', marginBottom: 14 }}>📋 Your Shield Summary</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  ['Plan', PLAN_LABELS[chosenTier]],
                  ['Coverage', `₹${PLAN_COVER[chosenTier].toLocaleString()}`],
                  ['Weekly Premium', `₹${premiumData ? selectedPremium : '—'}`],
                  ['City', city],
                  ['Platform', platform],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
              By activating, you agree to our Terms of Service. Cancel anytime. No hidden fees.
            </div>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ margin: '12px 20px 0', padding: '12px 16px', borderRadius: 10, background: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger)', fontSize: '0.85rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* CTA button */}
      <div style={{ padding: '20px 20px 0' }}>
        <button className="btn btn-primary btn-full"
          onClick={goNext}
          disabled={!canProceed() || loading}
          style={{ fontSize: '1rem', padding: 16 }}>
          {loading
            ? <><Loader size={18} className="animate-spin" /> Processing…</>
            : step === 7 ? '⚡ Activate My Shield'
            : step === 5 ? 'Calculate My Premium'
            : step === TOTAL_STEPS ? 'Finish'
            : <>Next <ChevronRight size={18} /></>
          }
        </button>
      </div>
    </div>
  )
}
