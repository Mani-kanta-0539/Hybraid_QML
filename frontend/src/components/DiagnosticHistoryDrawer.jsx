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
        backgroundColor: '#0d1321',
        borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.5)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.6)',
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
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#f8fafc' }}>
                Diagnostic Run History
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>
                  Persistent Storage via SQLite (<code>data/diagnostics.db</code>)
                </span>
                {stats && (
                  <span style={{
                    fontSize: 11,
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    padding: '1px 8px',
                    borderRadius: 999,
                    fontWeight: 600,
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
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#cbd5e1',
                padding: '7px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Download size={14} /> Export
            </button>
            <button
              onClick={fetchHistory}
              title="Refresh"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#cbd5e1',
                padding: '7px 10px',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
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
          padding: '12px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
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
                  background: selectedDisease === tab.id ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                  border: selectedDisease === tab.id ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
                  color: selectedDisease === tab.id ? '#38bdf8' : '#94a3b8',
                  padding: '5px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div style={{ position: 'relative', minWidth: 200 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: 9, color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search patient, model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 8,
                padding: '6px 12px 6px 30px',
                color: '#f8fafc',
                fontSize: 12,
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Content Body: List and Detail Modal */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {loading && history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <RefreshCw size={24} className="spin" style={{ marginBottom: 12 }} />
              <div>Loading diagnostic history from SQLite...</div>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <Database size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8' }}>No diagnostic runs recorded yet</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                Execute a prediction on any disease page to automatically record the run here.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredHistory.map((item) => {
                const predStyle = getPredictionColor(item.prediction)
                const isIQM = item.hardware_backend?.includes('IQM')
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveItem(item)}
                    style={{
                      background: 'rgba(17, 24, 39, 0.75)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: 12,
                      padding: '14px 18px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 16,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)'}
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
                          <span style={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9' }}>
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
          padding: '12px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.4)',
        }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Showing {filteredHistory.length} of {history.length} records
          </span>
          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#f87171',
                padding: '5px 12px',
                borderRadius: 6,
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: 600,
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
            background: 'rgba(0, 0, 0, 0.65)',
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
              background: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 16,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            }}
          >
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.03)',
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>
                  Run #{activeItem.id} Details ({activeItem.patient_id})
                </h3>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>
                  {new Date(activeItem.timestamp).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 12, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Diagnosis & Result</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#38bdf8', marginTop: 4 }}>
                    {activeItem.prediction}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{activeItem.stage_or_risk}</div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 12, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Hardware & Model</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f8fafc', marginTop: 4 }}>
                    {activeItem.model_used}
                  </div>
                  <div style={{ fontSize: 11, color: '#22d3ee', marginTop: 2 }}>{activeItem.hardware_backend}</div>
                </div>
              </div>

              {/* Probabilities */}
              {activeItem.probabilities && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
                    Calibrated Probabilities
                  </div>
                  <pre style={{
                    background: '#090d16',
                    padding: 10,
                    borderRadius: 8,
                    fontSize: 11,
                    color: '#38bdf8',
                    overflowX: 'auto',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}>
                    {JSON.stringify(activeItem.probabilities, null, 2)}
                  </pre>
                </div>
              )}

              {/* Quantum Telemetry */}
              {activeItem.quantum_telemetry && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
                    Quantum Circuit & Hardware Telemetry
                  </div>
                  <pre style={{
                    background: '#090d16',
                    padding: 10,
                    borderRadius: 8,
                    fontSize: 11,
                    color: '#a78bfa',
                    overflowX: 'auto',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    maxHeight: 180,
                  }}>
                    {JSON.stringify(activeItem.quantum_telemetry, null, 2)}
                  </pre>
                </div>
              )}

              {/* Input Parameters */}
              {activeItem.input_summary && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
                    Input Parameters
                  </div>
                  <pre style={{
                    background: '#090d16',
                    padding: 10,
                    borderRadius: 8,
                    fontSize: 11,
                    color: '#94a3b8',
                    overflowX: 'auto',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
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
