/**
 * Admin stats route — /api/v1/admin
 *
 * GET /stats      → KPI summary for the dashboard
 * GET /zones      → all zones with DSI + policy counts
 */
import { Router } from 'express';
import pool       from '../db/pool.js';
import requireAdmin from '../middleware/requireAdmin.js';

const router = Router();
router.use(requireAdmin);

// ── GET /stats ────────────────────────────────────────────────────────────────
router.get('/stats', async (_req, res, next) => {
  try {
    const [policiesRes, claimsRes, payoutsRes, fraudRes] = await Promise.all([
      // Active policies
      pool.query(`SELECT COUNT(*)::int AS total,
                         COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days')::int AS new_7d
                  FROM policies WHERE status = 'ACTIVE'`),
      // Claims today
      pool.query(`SELECT COUNT(*)::int AS total,
                         COUNT(*) FILTER (WHERE status = 'PAID')::int AS paid,
                         COUNT(*) FILTER (WHERE status = 'FLAGGED')::int AS flagged
                  FROM claims WHERE created_at::date = CURRENT_DATE`),
      // Total payouts this week (loss ratio numerator)
      pool.query(`SELECT COALESCE(SUM(amount), 0)::float AS total_paid
                  FROM payouts WHERE status = 'COMPLETED'
                    AND completed_at > NOW() - INTERVAL '7 days'`),
      // Fraud rate
      pool.query(`SELECT
                    COUNT(*) FILTER (WHERE status = 'REJECTED')::float /
                    NULLIF(COUNT(*), 0) * 100 AS fraud_rate
                  FROM claims WHERE created_at > NOW() - INTERVAL '30 days'`),
    ]);

    const activePolicies = policiesRes.rows[0]?.total ?? 0;
    const claimsToday    = claimsRes.rows[0]?.total    ?? 0;
    const paidToday      = claimsRes.rows[0]?.paid     ?? 0;
    const totalPaid      = payoutsRes.rows[0]?.total_paid ?? 0;
    const fraudRate      = parseFloat((fraudRes.rows[0]?.fraud_rate ?? 0).toFixed(1));

    // Loss ratio = paid_premium / claims_paid (simplified mock for hackathon)
    const lossRatio = activePolicies > 0
      ? Math.min(95, Math.round((totalPaid / (activePolicies * 30)) * 100))
      : 62;

    res.json({
      active_policies:  activePolicies,
      policies_delta:   `+${policiesRes.rows[0]?.new_7d ?? 0} this week`,
      claims_today:     claimsToday,
      claims_delta:     paidToday,
      loss_ratio:       lossRatio,
      fraud_rate:       fraudRate,
      total_paid_inr:   totalPaid,
      timestamp:        new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /zones ────────────────────────────────────────────────────────────────
router.get('/zones', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT z.id, z.name, z.city,
              z.lat::float, z.lng::float, z.radius_km::float,
              COUNT(p.id) FILTER (WHERE p.status = 'ACTIVE')::int AS active_policies
       FROM zones z
       LEFT JOIN workers w ON w.zone_id = z.id
       LEFT JOIN policies p ON p.worker_id = w.id AND p.status = 'ACTIVE'
       GROUP BY z.id
       ORDER BY z.city, z.name`
    );
    res.json({ zones: rows, total: rows.length });
  } catch (err) {
    next(err);
  }
});

// ── GET /workers (for XAI search) ────────────────────────────────────────────
router.get('/workers', async (req, res, next) => {
  const q = req.query.q ?? '';
  try {
    const { rows } = await pool.query(
      `SELECT w.id, w.name, w.phone, w.city, w.platform, w.avg_daily_earnings::float,
              p.plan_tier, p.premium_amount::float, p.coverage_amount::float,
              p.shap_explanation
       FROM workers w
       LEFT JOIN policies p ON p.worker_id = w.id AND p.status = 'ACTIVE'
       WHERE w.name ILIKE $1 OR w.phone ILIKE $1
       LIMIT 10`,
      [`%${q}%`]
    );
    res.json({ workers: rows });
  } catch (err) {
    next(err);
  }
});

// ── GET /workers/explain?q=... (for XAI panel) ──────────────────────────────
router.get('/workers/explain', async (req, res, next) => {
  const q = String(req.query.q ?? '').trim();
  if (!q) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT w.id,
              w.name,
              w.phone,
              w.city,
              w.platform,
              w.avg_daily_earnings::float,
              p.id AS policy_id,
              p.status AS policy_status,
              p.plan_tier,
              p.premium_amount::float,
              p.coverage_amount::float,
              p.shieldsac_confidence::float,
              p.shap_explanation
       FROM workers w
       LEFT JOIN LATERAL (
         SELECT p.*
         FROM policies p
         WHERE p.worker_id = w.id
         ORDER BY (p.status = 'ACTIVE') DESC, p.created_at DESC
         LIMIT 1
       ) p ON true
       WHERE w.name ILIKE $1 OR w.phone ILIKE $1
       ORDER BY (p.status = 'ACTIVE') DESC, w.updated_at DESC
       LIMIT 1`,
      [`%${q}%`],
    );

    if (!rows[0]) {
      return res.status(404).json({
        error: 'Worker not found',
        message: 'No worker matches this name or phone number.',
      });
    }

    const row = rows[0];
    const shap = row.shap_explanation ?? {};
    const premium = row.premium_amount ?? 0;
    const rawPredicted = Number(shap.raw_predicted_premium ?? shap.final_premium_inr ?? premium);

    res.json({
      worker_id: row.id,
      worker_name: row.name,
      phone: row.phone,
      city: row.city,
      platform: row.platform,
      avg_daily_earnings: row.avg_daily_earnings,
      policy_id: row.policy_id,
      policy_status: row.policy_status,
      plan_tier: row.plan_tier,
      premium_inr: premium,
      coverage_inr: row.coverage_amount,
      confidence: row.shieldsac_confidence,
      shap_explanation: {
        ...shap,
        base_value: Number(shap.base_value ?? shap.base_premium_inr ?? premium),
        top_factors: Array.isArray(shap.top_factors) ? shap.top_factors : [],
      },
      fairness_applied: rawPredicted > premium,
      original_premium: rawPredicted,
      source: 'db_live',
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /fraud/logs?limit=20 (for fraud monitor) ───────────────────────────
router.get('/fraud/logs', async (req, res, next) => {
  const limit = Math.min(Math.max(Number(req.query.limit ?? 20), 1), 200);
  try {
    const { rows } = await pool.query(
      `SELECT fl.id,
              fl.claim_id,
              fl.check_type,
              fl.result,
              fl.confidence::float,
              fl.details,
              fl.checked_at,
              c.status AS claim_status,
              c.fraud_score::float,
              t.type AS trigger_type,
              t.dsi_score::float,
              z.name AS zone_name,
              z.city,
              w.name AS worker_name
       FROM fraud_logs fl
       LEFT JOIN claims c ON c.id = fl.claim_id
       LEFT JOIN triggers t ON t.id = c.trigger_id
       LEFT JOIN zones z ON z.id = t.zone_id
       LEFT JOIN policies p ON p.id = c.policy_id
       LEFT JOIN workers w ON w.id = p.worker_id
       ORDER BY fl.checked_at DESC
       LIMIT $1`,
      [limit],
    );

    res.json({ logs: rows, total: rows.length, source: 'db_live' });
  } catch (err) {
    next(err);
  }
});

export default router;
