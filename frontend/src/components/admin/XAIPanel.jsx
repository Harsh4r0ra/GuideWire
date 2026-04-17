/**
 * XAI Panel — SHAP waterfall for any worker.
 * Shows AI premium explanation with positive/negative factor bars.
 */
import { useState } from 'react'
import { Search, Loader } from 'lucide-react'
import api from '../../services/api.js'

export default function XAIPanel() {
  const [query,   setQuery]   = useState('')
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const search = async () => {
    if (!query.trim()) return
    setLoading(true); setError('')
    try {
      const res = await api.get('/admin/workers/explain', { params: { q: query.trim() } })
      setData(res.data)
    } catch (err) {
      setData(null)
      setError(err?.response?.data?.message ?? 'Could not fetch worker explanation.')
    } finally {
      setLoading(false)
    }
  }

  const factors = data?.shap_explanation?.top_factors ?? []
  const maxImpact = Math.max(...factors.map(f => Math.abs(f.impact_inr)), 1)
  const base = data?.shap_explanation?.base_value ?? 0
  const premium = data?.premium_inr ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '100%' }}>

      {/* Search */}
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Worker phone or name…"
            value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            style={{ paddingLeft: 36, fontSize: '0.88rem' }} />
        </div>
        <button className="btn btn-primary" onClick={search} disabled={loading} style={{ padding: '12px 18px' }}>
          {loading ? <Loader size={16} className="animate-spin" /> : 'Explain'}
        </button>
      </div>

      {error && <div style={{ fontSize: '0.75rem', color: 'var(--warning)', padding: '8px 12px', borderRadius: 8, background: 'var(--warning-bg)' }}>⚠️ {error}</div>}

      {!data && !loading && (
        <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: 'var(--text-muted)', fontSize: '0.84rem', textAlign: 'center', padding: '18px 12px' }}>
          Search a real worker by name or phone to view live Shield-SAC explanation.
        </div>
      )}

      {data && (
        <>
          {/* Worker header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '14px 16px', borderRadius: 12, background: 'var(--bg-700)' }}>
            <div>
              <div style={{ fontWeight: 700 }}>{data?.worker_name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{data?.plan_tier ?? 'N/A'} Shield · {data?.city ?? '—'}</div>
              {data?.fairness_applied && (
                <div style={{ marginTop: 6, fontSize: '0.7rem', color: 'var(--success)', background: 'var(--success-bg)', padding: '3px 10px', borderRadius: 99, display: 'inline-block' }}>
                  ✓ Fairness Shield applied (capped from ₹{data.original_premium} → ₹{data.premium_inr})
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Poppins', fontSize: '1.8rem', fontWeight: 900, color: 'var(--amber)', lineHeight: 1 }}>₹{premium}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>/week</div>
            </div>
          </div>

          {/* Base value */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Base premium (industry avg)</span>
            <span style={{ fontWeight: 600 }}>₹{base}</span>
          </div>

          {/* SHAP bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
              Premium Factors (AI Explanation)
            </div>
            {factors.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', padding: '8px 0' }}>
                No SHAP factors available for this policy yet.
              </div>
            )}
            {factors.map((f, i) => {
              const impact = Number(f.impact_inr ?? 0)
              const pct  = (Math.abs(impact) / maxImpact) * 100
              const isUp = f.direction === 'increases_premium' || impact > 0
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{f.label ?? `Factor ${i + 1}`}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: isUp ? 'var(--danger)' : 'var(--success)' }}>
                      {isUp ? '+' : '-'}₹{Math.abs(impact).toFixed(1)}
                    </span>
                  </div>
                  <div style={{ height: 7, borderRadius: 99, background: 'var(--bg-600)', overflow: 'hidden', display: 'flex', justifyContent: isUp ? 'flex-start' : 'flex-end' }}>
                    <div style={{
                      width: `${pct}%`, height: '100%', borderRadius: 99,
                      background: isUp
                        ? 'linear-gradient(90deg, #B91C1C, #EF4444)'
                        : 'linear-gradient(90deg, #059669, #10B981)',
                      transition: 'width 1s ease',
                      animationDelay: `${i * 0.1}s`,
                    }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Final premium */}
          <div style={{ paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>Final fair premium</span>
            <span style={{ fontFamily: 'Poppins', fontSize: '1.4rem', fontWeight: 900, color: 'var(--amber)' }}>₹{premium}/wk</span>
          </div>
        </>
      )}
    </div>
  )
}
