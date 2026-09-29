/**
 * frontend/src/config/api.js
 * ==============================================================================
 * Centralized API Base URL Configuration for HealthQure
 * Supports seamless deployment across:
 *   - Local Development (Vite on 5173 + FastAPI on 8000)
 *   - Vercel Production Deployment (via VITE_API_URL or same-origin proxy)
 *   - Cloud Run / Railway / Render backends
 * ==============================================================================
 */

export const getApiBase = () => {
  // 1. Explicit environment variable configured in Vercel project settings
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '')
  }
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
  }

  // 2. Production Vercel detection: avoid mixed-content or connection refused errors
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0'
    if (!isLocal) {
      // In production, default to relative path (supports Vercel serverless / rewrites)
      return ''
    }
  }

  // 3. Local development fallback
  return 'http://127.0.0.1:8000'
}

export const API_BASE = getApiBase()
export default API_BASE
