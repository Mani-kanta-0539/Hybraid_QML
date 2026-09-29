/**
 * frontend/src/config/api.js
 * ==============================================================================
 * Centralized API Base URL Configuration for HealthQure Multi-Service Architecture
 * Supports:
 *   - Vercel Service Binding: process.env.APP_URL (in serverless/node contexts)
 *   - Client Environment Variables: VITE_APP_URL, VITE_API_URL
 *   - Production Same-Origin Rewrites: Relative path routed to "app" service
 *   - Local Development: Fallback to http://127.0.0.1:8000
 * ==============================================================================
 */

export const getApiBase = () => {
  // 1. Service binding variable (injected by Vercel when running in functions)
  if (typeof process !== 'undefined' && process.env && process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, '')
  }

  // 2. Explicit environment variables configured in Vercel project settings
  if (import.meta.env.VITE_APP_URL) {
    return import.meta.env.VITE_APP_URL.replace(/\/$/, '')
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '')
  }
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
  }

  // 3. Browser environment on Vercel: use same-origin relative path
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0'
    if (!isLocal) {
      // Same-origin relative path, routed directly to the "app" service via Vercel rewrites
      return ''
    }
  }

  // 4. Local development fallback
  return 'http://127.0.0.1:8000'
}

export const API_BASE = getApiBase()
export default API_BASE
