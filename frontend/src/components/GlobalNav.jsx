import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Cpu, Scan, Heart, Home, BarChart3, Database, Brain, History, Sun, Moon } from 'lucide-react'
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
          {/* Brand */}
          <Link to="/" className="nav-brand">
            <div className="nav-logo">
              <Cpu size={22} color="white" />
            </div>
            <div className="nav-brand-text">
              <h1>Quantum Healthcare AI</h1>
              <span>Hybrid Clinical Diagnostics</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="nav-links">
            <Link
              to="/"
              className={`nav-link ${path === '/' ? 'active' : ''}`}
            >
              <div className="nav-icon blue">
                <Home size={16} />
              </div>
              Home
            </Link>

            <Link
              to="/breast-cancer"
              className={`nav-link ${path.startsWith('/breast-cancer') ? 'active' : ''}`}
            >
              <div className="nav-icon rose">
                <Scan size={16} />
              </div>
              Breast Scanner
            </Link>

            <Link
              to="/heart-disease"
              className={`nav-link ${path.startsWith('/heart-disease') ? 'active' : ''}`}
            >
              <div className="nav-icon emerald">
                <Heart size={16} />
              </div>
              Heart QML
            </Link>

            <Link
              to="/alzheimers"
              className={`nav-link ${path.startsWith('/alzheimers') ? 'active' : ''}`}
            >
              <div className="nav-icon amber">
                <Brain size={16} />
              </div>
              Alzheimer's QML
            </Link>

            <Link
              to="/benchmarks"
              className={`nav-link ${path.startsWith('/benchmarks') ? 'active' : ''}`}
            >
              <div className="nav-icon purple">
                <BarChart3 size={16} />
              </div>
              Benchmarking
            </Link>

            <Link
              to="/ingestion"
              className={`nav-link ${path.startsWith('/ingestion') ? 'active' : ''}`}
            >
              <div className="nav-icon cyan">
                <Database size={16} />
              </div>
              Data Ingestion
            </Link>
          </div>

          {/* Right Action Cluster */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={theme === 'light' ? 'Switch to Dark Mode (Obsidian Cyan)' : 'Switch to Light Mode (Mediva Healthcare)'}
              aria-label="Toggle visual theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Run History (SQLite) Pill Button */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '0 18px',
                height: 42,
                background: 'var(--accent-soft)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--accent)',
                cursor: 'pointer',
                transition: 'var(--transition)',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--accent-soft-hover)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--accent-soft)'
                e.currentTarget.style.transform = 'none'
              }}
            >
              <History size={15} />
              <span>Run History (SQLite)</span>
            </button>

            {/* Live Telemetry Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '0 14px',
              height: 42,
              background: 'var(--normal-bg)',
              border: '1px solid var(--normal-border)',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: 'var(--normal)',
              flexShrink: 0
            }}>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--normal)',
                boxShadow: '0 0 10px var(--normal)',
                display: 'block'
              }} />
              IQM Online
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
