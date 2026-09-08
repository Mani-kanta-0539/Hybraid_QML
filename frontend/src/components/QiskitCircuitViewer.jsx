import React, { useState } from 'react'
import { Cpu, Code2, ZoomIn, Copy, Check, Info, Sparkles, Layers } from 'lucide-react'

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
      background: '#070c18',
      border: '1px solid #1e3a5f',
      borderRadius: 14,
      padding: 22,
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
      overflow: 'hidden',
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
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Cpu size={18} color="#60a5fa" />
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
              {title}
            </h3>
            {badges.map((b, i) => (
              <span
                key={i}
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  background: 'rgba(96, 165, 250, 0.15)',
                  color: '#60a5fa',
                  border: '1px solid rgba(96, 165, 250, 0.3)',
                  padding: '2px 8px',
                  borderRadius: 6,
                  letterSpacing: '0.04em',
                }}
              >
                {b}
              </span>
            ))}
          </div>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
            {subtitle}
          </p>
        </div>

        {/* Action Toggle (Diagram vs Code) */}
        <div style={{ display: 'flex', gap: 6, background: '#091325', padding: 4, borderRadius: 8, border: '1px solid #1e3a5f' }}>
          <button
            type="button"
            onClick={() => setActiveTab('schematic')}
            style={{
              background: activeTab === 'schematic' ? '#2563eb' : 'transparent',
              color: activeTab === 'schematic' ? '#ffffff' : '#94a3b8',
              border: 'none',
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Layers size={13} /> Qiskit Diagram
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            style={{
              background: activeTab === 'code' ? '#2563eb' : 'transparent',
              color: activeTab === 'code' ? '#ffffff' : '#94a3b8',
              border: 'none',
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
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
              background: '#040711',
              border: '1px solid #1e3a5f',
              borderRadius: 10,
              padding: 12,
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
                  borderRadius: 6,
                }}
              />
            </div>

            <div style={{
              position: 'absolute',
              bottom: 14,
              right: 14,
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: '0.68rem',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              pointerEvents: 'none',
            }}>
              <ZoomIn size={12} /> {zoomed ? 'Click to fit view' : 'Click to zoom (100% scale)'}
            </div>
          </div>

          {/* Qubit details grid */}
          {qubitDetails.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 8,
              marginTop: 14,
            }}>
              {qubitDetails.map((q, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 8,
                    padding: '8px 12px',
                  }}
                >
                  <div style={{ fontSize: '0.70rem', color: '#60a5fa', fontWeight: 700, fontFamily: 'monospace' }}>
                    Qubit |{q.qubit ?? i}⟩
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f1f5f9', marginTop: 2 }}>
                    {q.label}
                  </div>
                  {q.desc && (
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 2 }}>
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
                background: copied ? '#059669' : '#1e293b',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 6,
                padding: '4px 10px',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy Qiskit Code'}
            </button>
          </div>
          <pre style={{
            fontFamily: 'JetBrains Mono, Menlo, monospace',
            fontSize: '0.78rem',
            color: '#34d399',
            background: '#040711',
            border: '1px solid #1e3a5f',
            borderRadius: 10,
            padding: 16,
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
