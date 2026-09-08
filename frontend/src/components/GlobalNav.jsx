import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Cpu, Scan, Heart, Home, BarChart3, Database, Brain, History } from 'lucide-react'
import { DiagnosticHistoryDrawer } from './DiagnosticHistoryDrawer'

export function GlobalNav() {
  const location = useLocation()
  const path = location.pathname
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  return (
    <>
      <nav className="global-nav">
        <div className="global-nav-inner">
          {/* Brand */}
          <Link to="/" className="nav-brand" style={{ textDecoration: 'none' }}>
            <div className="nav-logo">
              <Cpu size={20} color="white" />
            </div>
            <div className="nav-brand-text">
              <h1>Quantum Healthcare AI</h1>
              <span>Hybrid Quantum-Classical Diagnostics</span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="nav-links">
            <Link
              to="/"
              className={`nav-link ${path === '/' ? 'active' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="nav-icon blue">
                <Home size={15} />
              </div>
              Home
            </Link>

            <Link
              to="/breast-cancer"
              className={`nav-link ${path.startsWith('/breast-cancer') ? 'active' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="nav-icon rose">
                <Scan size={15} />
              </div>
              Breast Scanner
            </Link>

            <Link
              to="/heart-disease"
              className={`nav-link ${path.startsWith('/heart-disease') ? 'active' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="nav-icon emerald">
                <Heart size={15} />
              </div>
              Heart QML
            </Link>

            <Link
              to="/alzheimers"
              className={`nav-link ${path.startsWith('/alzheimers') ? 'active' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="nav-icon amber" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>
                <Brain size={15} />
              </div>
              Alzheimer's QML
            </Link>

            <Link
              to="/benchmarks"
              className={`nav-link ${path.startsWith('/benchmarks') ? 'active' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="nav-icon purple" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#c084fc' }}>
                <BarChart3 size={15} />
              </div>
              Benchmarking
            </Link>

            <Link
              to="/ingestion"
              className={`nav-link ${path.startsWith('/ingestion') ? 'active' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="nav-icon cyan" style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#22d3ee' }}>
                <Database size={15} />
              </div>
              Data Ingestion
            </Link>
          </div>

          {/* Right Actions: History Drawer & Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setIsHistoryOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '6px 14px',
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                borderRadius: 10,
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#38bdf8',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.22)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.12)'}
            >
              <History size={14} />
              <span>Run History (SQLite)</span>
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: 10,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#34d399',
              flexShrink: 0
            }}>
              <span style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#34d399',
                animation: 'pulse 2s infinite',
                display: 'block'
              }} />
              AI Systems Online
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
