import React, { useState } from 'react'
import { Cpu, Code2, ZoomIn, Copy, Check, Layers } from 'lucide-react'

export function QiskitCircuitViewer({
  title = 'Qiskit Quantum Circuit',
  subtitle = 'Code-accurate quantum circuit diagram transpiled and rendered via Qiskit',
  imageSrc,
  qiskitCode,
  qubitDetails = [],
  badges = ['Qiskit 2.x Accurate', 'MPL Dark Medical Theme'],
  defaultTab = 'schematic'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [copied, setCopied] = useState(false)
  const [zoomed, setZoomed] = useState(false)

  const handleCopy = () => {
    if (qiskitCode) {
      navigator.clipboard.writeText(qiskitCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)',
      padding: 24,
      boxShadow: 'var(--shadow-md)',
      overflow: 'hidden',
      transition: 'background-color 0.2s ease, border-color 0.2s ease'
    }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
        paddingBottom: 14,
        borderBottom: '1px solid var(--border)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Cpu size={18} color="var(--accent)" />
            <h3 style={{ fontSize: '1.02rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              {title}
            </h3>
            {badges.map((b, i) => (
              <span
                key={i}
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  border: '1px solid var(--border)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  letterSpacing: '0.02em',
                }}
              >
                {b}
              </span>
            ))}
          </div>
          <p style={{ margin: 0, fontSize: '0.80rem', color: 'var(--text-secondary)' }}>
            {subtitle}
          </p>
        </div>

        {/* Action Toggle (Diagram vs Code) */}
        <div style={{ display: 'flex', gap: 6, background: 'var(--bg-secondary)', padding: 4, borderRadius: 8, border: '1px solid var(--border)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('schematic')}
            style={{
              background: activeTab === 'schematic' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'schematic' ? '#ffffff' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: 6,
              padding: '6px 14px',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={13} /> Qiskit Diagram
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            style={{
              background: activeTab === 'code' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'code' ? '#ffffff' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: 6,
              padding: '6px 14px',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease'
            }}
          >
            <Code2 size={13} /> Python Code
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'schematic' ? (
        <div>
          {/* Circuit Image Container */}
          <div
            style={{
              position: 'relative',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: 16,
              overflowX: 'auto',
              textAlign: 'center',
              cursor: zoomed ? 'zoom-out' : 'zoom-in',
            }}
            onClick={() => setZoomed(!zoomed)}
            title="Click to toggle magnification"
          >
            <div style={{
              display: 'inline-block',
              minWidth: zoomed ? '1400px' : '100%',
              maxWidth: zoomed ? 'none' : '100%',
              transition: 'min-width 0.2s ease',
            }}>
              <img
                src={imageSrc}
                alt={title}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  borderRadius: 8,
                }}
              />
            </div>

            <div style={{
              position: 'absolute',
              bottom: 14,
              right: 14,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: '0.68rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              pointerEvents: 'none',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <ZoomIn size={12} /> {zoomed ? 'Click to fit view' : 'Click to zoom (100% scale)'}
            </div>
          </div>

          {/* Qubit details grid */}
          {qubitDetails.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 10,
              marginTop: 16,
            }}>
              {qubitDetails.map((q, i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '10px 14px',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 800, fontFamily: 'monospace' }}>
                    Qubit |{q.qubit ?? i}⟩
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                    {q.label}
                  </div>
                  {q.desc && (
                    <div style={{ fontSize: '0.70rem', color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>
                      {q.desc}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Python Code Tab */
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 10,
          }}>
            <button
              type="button"
              onClick={handleCopy}
              style={{
                background: copied ? '#059669' : 'var(--accent)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy Qiskit Code'}
            </button>
          </div>
          <pre style={{
            fontFamily: 'JetBrains Mono, Menlo, monospace',
            fontSize: '0.80rem',
            color: 'var(--text-primary)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: 18,
            lineHeight: 1.7,
            overflowX: 'auto',
            margin: 0,
          }}>
            {qiskitCode}
          </pre>
        </div>
      )}
    </div>
  )
}
