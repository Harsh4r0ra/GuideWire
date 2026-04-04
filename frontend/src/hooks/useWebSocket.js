/**
 * useWebSocket — custom hook that connects to the backend WS as a worker client.
 * Navigates to /storm on STORM_MODE event and /payout on PAYOUT_CONFIRMED.
 *
 * Usage:
 *   const { connected } = useWebSocket()
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const WS_URL  = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'
const RECONNECT_DELAY_MS = 5_000

export default function useWebSocket() {
  const wsRef     = useRef(null)
  const timerRef  = useRef(null)
  const navigate  = useNavigate()
  const [connected, setConnected] = useState(false)

  const connect = useCallback(() => {
    const workerId = localStorage.getItem('gs_worker_id')
    if (!workerId) return  // not registered yet

    const url = `${WS_URL}/ws?role=worker&worker_id=${workerId}`
    const ws  = new WebSocket(url)

    ws.onopen = () => {
      setConnected(true)
      console.log('[WS] connected ✅')
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        handleMessage(msg)
      } catch (_) { /* ignore */ }
    }

    ws.onclose = () => {
      setConnected(false)
      console.log('[WS] disconnected — reconnecting in', RECONNECT_DELAY_MS, 'ms')
      timerRef.current = setTimeout(connect, RECONNECT_DELAY_MS)
    }

    ws.onerror = (err) => {
      console.warn('[WS] error', err)
      ws.close()
    }

    wsRef.current = ws
  }, [])   // eslint-disable-line react-hooks/exhaustive-deps

  function handleMessage(msg) {
    switch (msg.type) {
      case 'STORM_MODE': {
        sessionStorage.setItem('gs_storm', JSON.stringify(msg.payload))
        navigate('/storm', { state: msg.payload })
        break
      }
      case 'PAYOUT_CONFIRMED': {
        sessionStorage.setItem('gs_payout', JSON.stringify(msg.payload))
        navigate('/payout', { state: msg.payload })
        break
      }
      case 'CLAIM_STATUS_UPDATE': {
        // Could dispatch to a global store — for now just log
        console.log('[WS] claim update:', msg.payload)
        break
      }
      default: break
    }
  }

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(timerRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  return { connected }
}
