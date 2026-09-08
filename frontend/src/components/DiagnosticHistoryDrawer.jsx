import React, { useState, useEffect } from 'react'
import {
  History,
  X,
  RefreshCw,
  Trash2,
  Download,
  Filter,
  Search,
  Cpu,
  Brain,
  Heart,
  Scan,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  ChevronRight,
  Database
} from 'lucide-react'

const API_BASE = 'http://127.0.0.1:8000'

export function DiagnosticHistoryDrawer({ isOpen, onClose }) {
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedDisease, setSelectedDisease] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeItem, setActiveItem] = useState(null)

  useEffect(() => {
    if (isOpen) {
      fetchHistory()
      fetchStats()
    }
  }, [isOpen, selectedDisease])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const url = selectedDisease === 'all'
        ? `${API_BASE}/history?limit=100`
        : `${API_BASE}/history?disease=${selectedDisease}&limit=100`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setHistory(data)
      }
    } catch (e) {
      console.error('Failed to fetch history:', e)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/history/stats`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (e) {
      console.error('Failed to fetch stats:', e)
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm(`Delete diagnostic record #${id} from SQLite?`)) return
    try {
      const res = await fetch(`${API_BASE}/history/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id))
        fetchStats()
        if (activeItem?.id === id) setActiveItem(null)
      }
    } catch (err) {
      alert(`Delete failed: ${err.message}`)
    }
  }

  const handleClearAll = async () => {
    const msg = selectedDisease === 'all'
      ? 'Clear ALL diagnostic history from SQLite database?'
      : `Clear all ${selectedDisease} records from SQLite database?`
    if (!window.confirm(msg)) return
    try {
      const url = selectedDisease === 'all'
        ? `${API_BASE}/history`
        : `${API_BASE}/history?disease=${selectedDisease}`
      const res = await fetch(url, { method: 'DELETE' })
      if (res.ok) {
        setHistory([])
        fetchStats()
        setActiveItem(null)
      }
    } catch (err) {
      alert(`Clear failed: ${err.message}`)
    }
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quantum_diagnostic_history_${Date.now()}.json`
    a.click()
  }

  if (!isOpen) return null

  const filteredHistory = history.filter((item) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      item.patient_id?.toLowerCase().includes(q) ||
      item.prediction?.toLowerCase().includes(q) ||
      item.model_used?.toLowerCase().includes(q) ||
      item.disease?.toLowerCase().includes(q)
    )
  })

  const getDiseaseIcon = (dis) => {
    if (dis === 'breast_cancer') return <Scan size={14} color="#f43f5e" />
    if (dis === 'heart_disease') return <Heart size={14} color="#10b981" />
    return <Brain size={14} color="#fbbf24" />
  }

  const getPredictionColor = (pred) => {
    const p = (pred || '').toLowerCase()
    if (p.includes('malignant') || p.includes('positive') || p.includes('demented')) {
      return { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' }
    }
    return { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 8, 16, 0.75)',
      backdropFilter: 'blur(6px)',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 780,
        height: '100%',
        backgroundColor: 'var(--bg-primary)',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-floating)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-card)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <History size={20} color="white" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                Diagnostic Run History
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Persistent Storage via SQLite (<code>data/diagnostics.db</code>)
                </span>
                {stats && (
                  <span style={{
                    fontSize: 11,
                    background: 'var(--accent-soft)',
                    color: 'var(--accent)',
                    padding: '2px 10px',
                    borderRadius: 'var(--radius-pill)',
                    fontWeight: 700,
                    border: '1px solid var(--border)'
                  }}>
                    {stats.total_diagnostic_runs} Total Runs
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={handleExport}
              title="Export all records as JSON"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                padding: '7px 14px',
                borderRadius: 'var(--radius-pill)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'var(--transition)'
              }}
            >
              <Download size={14} /> Export
            </button>
            <button
              onClick={fetchHistory}
              title="Refresh"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                padding: '7px 12px',
                borderRadius: 'var(--radius-pill)',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 6,
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div style={{
          padding: '14px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-secondary)'
        }}>
          {/* Disease Tabs */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: 'all', label: 'All Diseases' },
              { id: 'breast_cancer', label: 'Breast Cancer' },
              { id: 'heart_disease', label: 'Heart Disease' },
              { id: 'alzheimers', label: "Alzheimer's" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedDisease(tab.id)}
                style={{
                  background: selectedDisease === tab.id ? 'var(--accent)' : 'var(--bg-card)',
                  border: selectedDisease === tab.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                  color: selectedDisease === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div style={{ position: 'relative', minWidth: 220 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search patient, model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-pill)',
                padding: '7px 14px 7px 34px',
                color: 'var(--text-primary)',
                fontSize: 12,
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* List Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px' }} />
              <div>Loading diagnostic records from SQLite...</div>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              <Database size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <div style={{ fontWeight: 600 }}>No matching diagnostic runs found</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                Run an inference in Breast Cancer, Heart Disease, or Alzheimer's to persist a run.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredHistory.map((item) => {
                const predStyle = getPredictionColor(item.prediction)
              const isIQM = (item.hardware_backend && item.hardware_backend.includes('IQM')) || item.is_real_hardware || (item.model_used && item.model_used.includes('IQM'))

              return (
                <div
                  key={item.id}
                  onClick={() => setActiveItem(item)}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px 20px',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                  }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                      <div style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        background: 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {getDiseaseIcon(item.disease)}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                            {item.patient_id}
                          </span>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: predStyle.bg,
                            color: predStyle.text,
                            border: `1px solid ${predStyle.border}`,
                          }}>
                            {item.prediction}
                          </span>
                          {item.confidence_pct && (
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>
                              {item.confidence_pct}% conf
                            </span>
                          )}
                          {isIQM && (
                            <span style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: '1px 6px',
                              borderRadius: 4,
                              background: 'rgba(6, 182, 212, 0.15)',
                              color: '#22d3ee',
                              border: '1px solid rgba(6, 182, 212, 0.3)',
                            }}>
                              ⚛️ REAL IQM QPU
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, fontSize: 11, color: '#64748b' }}>
                          <span>{item.model_used}</span>
                          <span>•</span>
                          <span>{new Date(item.timestamp).toLocaleString()}</span>
                          {item.latency_ms > 0 && (
                            <>
                              <span>•</span>
                              <span>{item.latency_ms}ms</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        title="Delete from SQLite"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          padding: 6,
                          borderRadius: 6,
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#f87171'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                      >
                        <Trash2 size={15} />
                      </button>
                      <ChevronRight size={16} color="#64748b" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer info & clear button */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-card)',
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Showing {filteredHistory.length} of {history.length} records
          </span>
          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#f87171',
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Clear {selectedDisease === 'all' ? 'All' : selectedDisease} History
            </button>
          )}
        </div>
      </div>

      {/* Item Detail Inspector Modal */}
      {activeItem && (
        <div
          onClick={() => setActiveItem(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.60)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 620,
              maxHeight: '85vh',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-floating)',
            }}
          >
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--bg-secondary)',
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
                  Run #{activeItem.id} Details ({activeItem.patient_id})
                </h3>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {new Date(activeItem.timestamp).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ background: 'var(--bg-secondary)', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>Diagnosis & Result</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)', marginTop: 4 }}>
                    {activeItem.prediction}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{activeItem.stage_or_risk}</div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>Hardware & Model</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                    {activeItem.model_used}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 2 }}>{activeItem.hardware_backend}</div>
                </div>
              </div>

              {/* Probabilities */}
              {activeItem.probabilities && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                    Calibrated Probabilities
                  </div>
                  <pre style={{
                    background: 'var(--bg-secondary)',
                    padding: 12,
                    borderRadius: 'var(--radius-md)',
                    fontSize: 11,
                    color: 'var(--accent)',
                    overflowX: 'auto',
                    border: '1px solid var(--border)',
                    fontFamily: 'JetBrains Mono, monospace'
                  }}>
                    {JSON.stringify(activeItem.probabilities, null, 2)}
                  </pre>
                </div>
              )}

              {/* Quantum Telemetry */}
              {activeItem.quantum_telemetry && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Quantum Circuit & Hardware Telemetry
                  </div>
                  <pre style={{
                    background: 'var(--bg-secondary)',
                    padding: 10,
                    borderRadius: 8,
                    fontSize: 11,
                    color: '#a78bfa',
                    overflowX: 'auto',
                    border: '1px solid var(--border)',
                    maxHeight: 180,
                  }}>
                    {JSON.stringify(activeItem.quantum_telemetry, null, 2)}
                  </pre>
                </div>
              )}

              {/* Input Parameters */}
              {activeItem.input_summary && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Input Parameters
                  </div>
                  <pre style={{
                    background: 'var(--bg-secondary)',
                    padding: 10,
                    borderRadius: 8,
                    fontSize: 11,
                    color: '#94a3b8',
                    overflowX: 'auto',
                    border: '1px solid var(--border)',
                  }}>
                    {JSON.stringify(activeItem.input_summary, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
