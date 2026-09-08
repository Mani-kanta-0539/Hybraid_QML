import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Activity, Scan, Heart, Home, BarChart3, Database, Brain, History, Sun, Moon, ShieldCheck } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { DiagnosticHistoryDrawer } from './DiagnosticHistoryDrawer'

export function GlobalNav() {
  const location = useLocation()
  const path = location.pathname
  const { theme, toggleTheme } = useTheme()
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  return (
    <>
      <nav className="global-nav">
        <div className="global-nav-inner">
          {/* Brand Logo & Name: HealthQure */}
          <Link to="/" className="nav-brand">
            <div className="nav-logo">
              <Activity size={22} color="white" strokeWidth={2.5} />
            </div>
            <div className="nav-brand-text">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <h1 style={{ fontSize: '1.20rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
                  Health<span style={{ color: 'var(--accent)' }}>Qure</span>
                </h1>
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  border: '1px solid var(--border)'
                }}>
                  QPU AI
                </span>
              </div>
              <span>Clinical Diagnostic Suite</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="nav-links">
            <Link
              to="/"
              className={`nav-link ${path === '/' ? 'active' : ''}`}
            >
              <Home size={15} />
              <span>Home</span>
            </Link>

            <Link
              to="/breast-cancer"
              className={`nav-link ${path.startsWith('/breast-cancer') ? 'active' : ''}`}
            >
              <Scan size={15} />
              <span>Breast Scanner</span>
            </Link>

            <Link
              to="/heart-disease"
              className={`nav-link ${path.startsWith('/heart-disease') ? 'active' : ''}`}
            >
              <Heart size={15} />
              <span>Heart QML</span>
            </Link>

            <Link
              to="/alzheimers"
              className={`nav-link ${path.startsWith('/alzheimers') ? 'active' : ''}`}
            >
              <Brain size={15} />
              <span>Alzheimer's QML</span>
            </Link>

            <Link
              to="/benchmarks"
              className={`nav-link ${path.startsWith('/benchmarks') ? 'active' : ''}`}
            >
              <BarChart3 size={15} />
              <span>Benchmarking</span>
            </Link>

            <Link
              to="/ingestion"
              className={`nav-link ${path.startsWith('/ingestion') ? 'active' : ''}`}
            >
              <Database size={15} />
              <span>Data Ingestion</span>
            </Link>
          </div>

          {/* Right Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={theme === 'light' ? 'Switch to Dark Mode (Obsidian Cyan)' : 'Switch to Light Mode (Mediva Healthcare)'}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </button>

            {/* Run History (SQLite) Pill Button */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '0 16px',
                height: 38,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.80rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'var(--transition)',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--accent-soft)'
                e.currentTarget.style.color = 'var(--accent)'
                e.currentTarget.style.borderColor = 'var(--accent)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)'
                e.currentTarget.style.color = 'var(--text-primary)'
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              <History size={14} />
              <span>Run History</span>
            </button>

            {/* Live QPU Telemetry Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '0 12px',
              height: 38,
              background: 'var(--normal-bg)',
              border: '1px solid var(--normal-border)',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.76rem',
              fontWeight: 700,
              color: 'var(--normal)',
            }}>
              <span style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--normal)',
                boxShadow: '0 0 8px var(--normal)',
                display: 'block'
              }} />
              <span>IQM Ready</span>
            </div>
          </div>
        </div>
      </nav>

      <DiagnosticHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </>
  )
}
