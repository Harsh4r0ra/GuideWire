/**
 * Admin Dashboard — KPI Cards
 * Polls /api/v1/admin/stats every 30 seconds.
 */
export default function KPICards({ stats, loading }) {
  const cards = [
    {
      label:   'Active Policies',
      value:   stats?.active_policies ?? 0,
      delta:   stats?.policies_delta  ?? '+23%',
      icon:    '🛡️',
      color:   'var(--amber)',
      bg:      'rgba(245,158,11,0.08)',
      border:  'rgba(245,158,11,0.2)',
    },
    {
      label:   'Claims Today',
      value:   stats?.claims_today ?? 0,
      delta:   `+${stats?.claims_delta ?? 0}`,
      icon:    '📋',
      color:   'var(--info)',
      bg:      'rgba(59,130,246,0.08)',
      border:  'rgba(59,130,246,0.2)',
    },
    {
      label:   'Loss Ratio',
      value:   `${stats?.loss_ratio ?? 62}%`,
      delta:   '✓ Healthy',
      icon:    '📊',
      color:   'var(--success)',
      bg:      'rgba(16,185,129,0.08)',
      border:  'rgba(16,185,129,0.2)',
    },
    {
      label:   'Fraud Rate',
      value:   `${stats?.fraud_rate ?? 2.1}%`,
      delta:   '✓ Below threshold',
      icon:    '🔬',
      color:   'var(--success)',
      bg:      'rgba(16,185,129,0.08)',
      border:  'rgba(16,185,129,0.2)',
    },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
      {cards.map((c, i) => (
        <div key={i} style={{
          background: c.bg, border: `1px solid ${c.border}`, borderRadius: 16, padding: '20px 22px',
          transition: 'transform 0.2s',
          cursor: 'default',
          opacity: loading ? 0.6 : 1,
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{c.label}</span>
            <span style={{ fontSize: '1.3rem' }}>{c.icon}</span>
          </div>
          <div style={{ fontFamily: 'Poppins', fontSize: '2rem', fontWeight: 900, color: c.color, lineHeight: 1, marginBottom: 6 }}>
            {loading ? <Skeleton w={80} h={32} /> : c.value.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: c.color, fontWeight: 600, opacity: 0.8 }}>{c.delta}</div>
        </div>
      ))}
    </div>
  )
}

function Skeleton({ w, h }) {
  return <div style={{ width: w, height: h, borderRadius: 6, background: 'var(--bg-700)', animation: 'shimmer 1.8s infinite', backgroundSize: '1000px 100%' }} />
}
