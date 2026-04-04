/**
 * API service — thin axios wrapper over the backend REST API.
 * Base URL auto-detected from env or defaults to localhost:3001.
 */
import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: `${BASE}/api/v1`,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const path = config.url || ''
  const needsAdmin = path.startsWith('/admin') || path.startsWith('/triggers/inject')
  if (needsAdmin) {
    const adminToken = sessionStorage.getItem('gs_admin_token')
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`
    }
  }
  return config
})

// ── Workers ──────────────────────────────────────────────────────────────────
export const registerWorker  = (data)     => api.post('/workers/register', data)
export const loginWorker     = (data)     => api.post('/workers/login', data)
export const getWorker       = (id)       => api.get(`/workers/${id}`)
export const getWorkerDashboard = (id)   => api.get(`/workers/${id}/dashboard`)
export const getWorkerClaims = (id)      => api.get(`/workers/${id}/claims`)
export const getWorkerPayouts= (id)      => api.get(`/workers/${id}/payouts`)
export const getWorkerPolicies= (id)     => api.get(`/workers/${id}/policies`)

// ── Policies ─────────────────────────────────────────────────────────────────
export const subscribePlan   = (data)     => api.post('/policies/subscribe', data)
export const getPolicy       = (id)       => api.get(`/policies/${id}`)

// ── Claims ────────────────────────────────────────────────────────────────────
export const getClaim        = (id)       => api.get(`/claims/${id}`)

// ── DSI ──────────────────────────────────────────────────────────────────────
export const getDSIHeatmap   = ()         => api.get('/triggers/dsi/heatmap')
export const getZoneDSI      = (zoneId)   => api.get(`/triggers/dsi/${zoneId}`)

// ── Generic error extractor ───────────────────────────────────────────────────
export const getErrorMsg = (err) =>
  err?.response?.data?.message
  || err?.response?.data?.error
  || err?.message
  || 'Something went wrong'

export default api
