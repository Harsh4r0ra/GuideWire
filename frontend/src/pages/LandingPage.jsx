import { Link } from 'react-router-dom'
import { Shield, Zap, MapPin, Users, ChevronDown, CheckCircle } from 'lucide-react'
import { useEffect, useRef } from 'react'

const STATS = [
  { value: '12M+',   label: 'Gig workers at risk' },
  { value: '< 3min', label: 'Payout speed' },
  { value: '₹15',    label: 'Starting premium' },
  { value: '25',     label: 'DSI zones online' },
]

const FEATURES = [
  {
    icon: '🧠',
    title: 'Shield-SAC Pricing',
    desc: 'XGBoost model with SHAP explainability. Your premium is personalized — and always capped at 5% of weekly earnings.',
    tag: 'Fairness Guaranteed',
  },
  {
    icon: '🔬',
    title: 'PADS Fraud Detection',
    desc: 'Physics-based 5-layer fraud pipeline using IMU kinematics, GPS, and Isolation Forest. Not just GPS — actual physics.',
    tag: '5-Layer Pipeline',
  },
  {
    icon: '🌦️',
    title: 'DSI Weather Index',
    desc: 'Composite Disruption Severity Index combining rain, AQI, traffic, and order-drop signals. Auto-triggers claims.',
    tag: 'Real-time',
  },
  {
    icon: '💬',
    title: 'WhatsApp Onboarding',
    desc: 'Register in 90 seconds via WhatsApp. No app download needed. Works on any ₹3,000 smartphone.',
    tag: 'Zero Friction',
  },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Register in 90s', desc: 'Phone OTP → Platform → Daily earnings → UPI ID. Done.' },
  { step: '02', title: 'DSI fires a trigger', desc: 'Weather sensors cross the DSI threshold for your zone. System auto-detects.' },
  { step: '03', title: 'Payout in < 3 min', desc: 'PADS validates your claim. Razorpay sends money directly to your UPI.' },
]

const PLANS = [
  { name: 'Basic Shield', price: 15, coverage: 1500, color: '#3B82F6', features: ['Rain & flood coverage', 'WhatsApp alerts', 'Auto claim'] },
  { name: 'Pro Shield',   price: 30, coverage: 3000, color: '#F59E0B', features: ['All Basic features', 'Air quality coverage', 'SHAP explanation', 'Pool discount'], popular: true },
  { name: 'Elite Shield', price: 45, coverage: 5000, color: '#10B981', features: ['All Pro features', 'Heat & drought', 'Priority payout', 'Dedicated support'] },
]

const TESTIMONIALS = [
  { name: 'Raju K.', city: 'Mumbai', platform: 'Blinkit', quote: 'Monsoon mein ₹612 mila. Bina kuch kiye. Seedha UPI pe.', avatar: '👨' },
  { name: 'Priya S.', city: 'Delhi',  platform: 'Zepto',   quote: 'AQI 350 tha, delivery nahi kar sakti thi. 2 minute mein paisa aa gaya.', avatar: '👩' },
  { name: 'Vikram M.',city: 'Bangalore', platform: 'Swiggy', quote: 'Ab baarish se darna band. GigShield hai toh tension nahi.', avatar: '🧑' },
]

export default function LandingPage() {
  const heroRef = useRef(null)

  useEffect(() => {
    document.title = 'GIGASHIELD — Protecting India\'s Gig Workers'
    // Intersection observer for reveal animations
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('animate-fadeInUp')),
      { threshold: 0.1 }
    )
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div style={{ maxWidth: '100%', fontFamily: "'Inter', sans-serif", background: 'var(--bg-900)', color: 'var(--text-primary)' }}>

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 999,
        background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1.4rem', animation: 'shieldPulse 2.5s ease-in-out infinite' }}>🛡️</span>
          <span style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.1rem', color: 'var(--amber)' }}>
            GIGASHIELD
          </span>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <a href="#features" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Features</a>
          <a href="#plans"    style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Plans</a>
          <Link to="/login" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>Login</Link>
          <Link to="/onboard" className="btn btn-primary" style={{ padding: '9px 20px', fontSize: '0.85rem' }}>
            Get Protected →
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section ref={heroRef} style={{
        minHeight: '92vh', display: 'flex', alignItems: 'center',
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245,158,11,0.08), transparent)',
        padding: '80px 24px 60px', textAlign: 'center', flexDirection: 'column', justifyContent: 'center',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 99,
          background: 'rgba(245,158,11,0.12)',
          border: '1px solid rgba(245,158,11,0.3)',
          marginBottom: 28, fontSize: '0.78rem', fontWeight: 600, color: 'var(--amber)',
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--amber)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          Built for Guidewire DevTrails Hackathon 2026
        </div>

        <h1 style={{ fontSize: 'clamp(2.4rem, 7vw, 4.2rem)', fontFamily: 'Poppins', fontWeight: 900, lineHeight: 1.1, marginBottom: 24, maxWidth: 700, margin: '0 auto 24px' }}>
          Protect gig workers from<br />
          <span className="gradient-text">extreme weather</span>
        </h1>

        <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
          AI-powered parametric micro-insurance with instant payouts, zero paperwork,
          and automatic claim settlement — starting at just ₹15/week.
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/onboard" className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '16px 32px' }}>
            🛡️ Get Protected Now
          </Link>
          <Link to="/login" className="btn btn-ghost" style={{ fontSize: '1.05rem', padding: '16px 32px' }}>
            Already Registered? Login
          </Link>
          <a href="#how-it-works" className="btn btn-ghost" style={{ fontSize: '1.05rem', padding: '16px 32px' }}>
            See How It Works <ChevronDown size={16} />
          </a>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap', marginTop: 72 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Poppins', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, color: 'var(--amber)' }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ color: 'var(--amber)', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Four Pillars</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontFamily: 'Poppins' }}>
            Why GIGASHIELD <span className="gradient-text">wins</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="reveal card" style={{
              padding: 28, borderRadius: 20, cursor: 'default',
              transition: 'all 0.25s',
              animationDelay: `${i * 0.1}s`,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ fontSize: '2.4rem', marginBottom: 16 }}>{f.icon}</div>
              <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 99, background: 'var(--warning-bg)', color: 'var(--amber)', fontSize: '0.7rem', fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.tag}</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '80px 24px', background: 'rgba(30,41,59,0.3)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontFamily: 'Poppins' }}>Zero to protected in <span className="gradient-text">90 seconds</span></h2>
          </div>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="reveal" style={{ flex: '1 1 240px', textAlign: 'center', animationDelay: `${i * 0.15}s` }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--amber-dark), var(--amber))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.2rem',
                  margin: '0 auto 20px', boxShadow: 'var(--shadow-amber)',
                }}>
                  {step.step}
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: 10 }}>{step.title}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plans ───────────────────────────────────────────────────────── */}
      <section id="plans" style={{ padding: '80px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontFamily: 'Poppins' }}>Simple, <span className="gradient-text">fair pricing</span></h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 10, fontSize: '0.95rem' }}>AI-personalized. Never more than 5% of your weekly earnings.</p>
        </div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
          {PLANS.map((plan, i) => (
            <div key={i} className="card reveal" style={{
              flex: '1 1 270px', maxWidth: 300, position: 'relative',
              border: plan.popular ? `1.5px solid ${plan.color}` : '1px solid var(--border)',
              animationDelay: `${i * 0.1}s`,
            }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--amber)', color: '#fff', fontSize: '0.68rem', fontWeight: 800, padding: '3px 12px', borderRadius: 99, whiteSpace: 'nowrap', letterSpacing: '0.06em' }}>
                  MOST POPULAR
                </div>
              )}
              <div style={{ color: plan.color, fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>{plan.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ fontFamily: 'Poppins', fontSize: '2.4rem', fontWeight: 900 }}>₹{plan.price}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/week</span>
              </div>
              <div style={{ color: 'var(--success)', fontSize: '0.88rem', fontWeight: 600, marginBottom: 20 }}>
                ₹{plan.coverage.toLocaleString()} coverage
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <CheckCircle size={14} style={{ color: plan.color, flexShrink: 0 }} /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/onboard" className="btn btn-full" style={{
                background: `linear-gradient(135deg, ${plan.color}cc, ${plan.color})`,
                color: '#fff', textAlign: 'center', display: 'block', padding: '12px', borderRadius: 99
              }}>
                Start Free Trial →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────── */}
      <section style={{ padding: '70px 24px', background: 'rgba(30,41,59,0.3)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontFamily: 'Poppins', fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', marginBottom: 44 }}>
            Workers trust <span className="gradient-text">GigShield</span>
          </h2>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card reveal" style={{ flex: '1 1 250px', maxWidth: 300, animationDelay: `${i * 0.12}s` }}>
                <div style={{ fontSize: '1.8rem', marginBottom: 14 }}>{t.avatar}</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 16, fontStyle: 'italic' }}>"{t.quote}"</p>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.platform} · {t.city}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA ─────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', textAlign: 'center', background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(245,158,11,0.07), transparent)' }}>
        <div style={{ fontSize: '4rem', marginBottom: 24, display: 'inline-block' }} className="animate-float">🛡️</div>
        <h2 style={{ fontFamily: 'Poppins', fontSize: 'clamp(1.8rem, 4vw, 3rem)', marginBottom: 16 }}>
          Ready to get <span className="gradient-text">protected?</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 36, fontSize: '1rem' }}>
          Join 12M+ gig workers. Register in 90 seconds. Cancel anytime.
        </p>
        <Link to="/onboard" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '18px 40px' }}>
          🛡️ Activate My Shield Now
        </Link>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer style={{ padding: '32px 24px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
          <span>🛡️</span>
          <span style={{ fontFamily: 'Poppins', fontWeight: 700, color: 'var(--amber)' }}>GIGASHIELD NEXUS</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Built natively on Guidewire Cloud Platform · Guidewire DevTrails 2026
        </p>
      </footer>
    </div>
  )
}
