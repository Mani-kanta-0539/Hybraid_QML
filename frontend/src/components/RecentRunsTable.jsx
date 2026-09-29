import React, { useState, useEffect } from 'react'
import {
  Database,
  RefreshCw,
  Cpu,
  Trash2,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Layers,
  Zap
} from 'lucide-react'
import { API_BASE } from '../config/api'

export function RecentRunsTable({ disease, title = 'Recent Diagnostic Runs (SQLite)', limit = 5, refreshTrigger = 0 }) {
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedRun, setSelectedRun] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const fetchRuns = async () => {
    setLoading(true)
    try {
      const url = disease 
        ? `${API_BASE}/history?disease=${disease}&limit=${limit}`
        : `${API_BASE}/history?limit=${limit}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setRuns(Array.isArray(data) ? data : (data.runs || []))
      }
    } catch (e) {
      console.error('Failed to fetch recent runs:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRuns()
  }, [disease, limit, refreshTrigger])

  const handleDelete = async (e, runId) => {
    e.stopPropagation()
    if (!window.confirm('Delete this diagnostic record from SQLite?')) return
    setDeletingId(runId)
    try {
      const res = await fetch(`${API_BASE}/history/${runId}`, { method: 'DELETE' })
      if (res.ok) {
        setRuns(prev => prev.filter(r => r.id !== runId))
        if (selectedRun?.id === runId) setSelectedRun(null)
      }
    } catch (e) {
      console.error('Delete failed:', e)
    } finally {
      setDeletingId(null)
    }
  }

  const formatTimestamp = (ts) => {
    if (!ts) return '-'
    try {
      const d = new Date(ts)
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    } catch {
      return ts
    }
  }

  const getModelBadge = (modelType, hwBackend) => {
    const s = `${modelType || ''} ${hwBackend || ''}`.toLowerCase()
    if (s.includes('iqm') || s.includes('garnet') || s.includes('transmon') || s.includes('physical')) {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '2px 8px',
          borderRadius: 6,
          background: 'rgba(59, 130, 246, 0.2)',
          color: '#60a5fa',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          fontSize: '0.68rem',
          fontWeight: 800
        }}>
          <Cpu size={11} /> IQM Garnet QPU
        </span>
      )
    }
    if (s.includes('vqc')) {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '2px 8px',
          borderRadius: 6,
          background: 'rgba(168, 85, 247, 0.2)',
          color: '#c084fc',
          border: '1px solid rgba(168, 85, 247, 0.4)',
          fontSize: '0.68rem',
          fontWeight: 700
        }}>
          ⚛️ 4-Qubit VQC
        </span>
      )
    }
    if (s.includes('qsvc') || s.includes('havl') || s.includes('svm') || s.includes('kernel')) {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '2px 8px',
          borderRadius: 6,
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          fontSize: '0.68rem',
          fontWeight: 700
        }}>
          ⚡ Havlíček QSVC
        </span>
      )
    }
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 6,
        background: 'rgba(100, 116, 139, 0.2)',
        color: '#94a3b8',
        border: '1px solid rgba(100, 116, 139, 0.3)',
        fontSize: '0.68rem',
        fontWeight: 600
      }}>
        {modelType || 'Classical'}
      </span>
    )
  }

  const getRiskBadge = (risk, diagnosis) => {
    const isHigh = risk === 'HIGH' || diagnosis?.includes('Malignant') || diagnosis?.includes('POSITIVE') || diagnosis?.includes('Demented')
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 6,
        background: isHigh ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
        color: isHigh ? '#f87171' : '#34d399',
        border: `1px solid ${isHigh ? 'rgba(239, 68, 68, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
        fontSize: '0.70rem',
        fontWeight: 700
      }}>
        {isHigh ? <AlertTriangle size={11} /> : <CheckCircle2 size={11} />}
        {diagnosis || risk || 'Evaluated'}
      </span>
    )
  }

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)',
      padding: 24,
      boxShadow: 'var(--shadow-md)',
      marginTop: 24
    }}>
      {/* Table Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        borderBottom: '1px solid var(--border)',
        paddingBottom: 14
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Database size={18} color="var(--accent)" />
          <span style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {title}
          </span>
          <span style={{
            fontSize: '0.70rem',
            padding: '3px 10px',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--accent-soft)',
            color: 'var(--accent)',
            border: '1px solid var(--border)',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 700
          }}>
            SQLite Persistent ({runs.length})
          </span>
        </div>

        <button
          onClick={fetchRuns}
          disabled={loading}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius-pill)',
            padding: '6px 14px',
            fontSize: '0.76rem',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'var(--transition)'
          }}
        >
          <RefreshCw size={12} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Table Body */}
      {runs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 12px', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
          {loading ? 'Querying diagnostics.db...' : 'No diagnostic runs logged yet. Execute a prediction to record it into SQLite.'}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.80rem', color: 'var(--text-primary)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '8px 10px' }}>Run ID & Time</th>
                <th style={{ padding: '8px 10px' }}>Modality</th>
                <th style={{ padding: '8px 10px' }}>Model / Hardware</th>
                <th style={{ padding: '8px 10px' }}>Diagnosis</th>
                <th style={{ padding: '8px 10px' }}>Confidence</th>
                <th style={{ padding: '8px 10px' }}>Latency</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => {
                const isSelected = selectedRun?.id === r.id
                return (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedRun(isSelected ? null : r)}
                    style={{
              borderBottom: '1px solid var(--border)',
              background: isSelected ? 'var(--accent-soft)' : 'transparent',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--accent-soft)' }}
            onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
          >
            <td style={{ padding: '12px 10px' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: 'var(--accent)', fontSize: '0.76rem' }}>
                {r.id.slice(0, 8)}...
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <Clock size={10} /> {formatTimestamp(r.timestamp)}
              </div>
            </td>
            <td style={{ padding: '12px 10px' }}>
              <span style={{ textTransform: 'capitalize', color: 'var(--text-primary)', fontWeight: 700 }}>
                {r.modality || r.disease}
              </span>
            </td>
            <td style={{ padding: '12px 10px' }}>
              {getModelBadge(r.model_used || r.model_type, r.hardware_backend)}
            </td>
            <td style={{ padding: '12px 10px' }}>
              {getRiskBadge(r.stage_or_risk || r.risk_level, r.prediction || r.diagnosis)}
            </td>
            <td style={{ padding: '12px 10px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
              {r.confidence_pct ? `${r.confidence_pct.toFixed(1)}%` : '-'}
            </td>
            <td style={{ padding: '12px 10px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>
              {r.latency_ms ? `${r.latency_ms.toFixed(0)} ms` : '-'}
            </td>
            <td style={{ padding: '12px 10px', textAlign: 'right' }}>
              <button
                onClick={(e) => handleDelete(e, r.id)}
                disabled={deletingId === r.id}
                title="Delete record from SQLite"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#f87171',
                  opacity: 0.65,
                  cursor: 'pointer',
                  padding: 4
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.65'}
              >
                <Trash2 size={14} />
              </button>
            </td>
          </tr>
        )
      })}
    </tbody>
  </table>
</div>
)}

{/* Expanded Run Inspector Modal / Panel */}
{selectedRun && (() => {
const qTel = selectedRun.hardware_telemetry || selectedRun.quantum_telemetry
const isIQM = (selectedRun.hardware_backend && selectedRun.hardware_backend.includes('IQM')) || selectedRun.is_real_hardware || (selectedRun.model_used && selectedRun.model_used.includes('IQM'))
return (
  <div style={{
    marginTop: 18,
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: 20
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
      <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <FileText size={16} /> Diagnostic Run Details: <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{selectedRun.id}</span>
      </div>
      <button
        onClick={() => setSelectedRun(null)}
        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
      >
        ✕ Close
      </button>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 14 }}>
      <div style={{ background: 'var(--bg-card)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)', fontWeight: 700 }}>Primary Diagnosis</div>
        <div style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{selectedRun.prediction || selectedRun.diagnosis}</div>
      </div>
      <div style={{ background: 'var(--bg-card)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)', fontWeight: 700 }}>Confidence / Risk</div>
        <div style={{ fontSize: '0.96rem', fontWeight: 800, color: selectedRun.risk_level === 'HIGH' || (selectedRun.stage_or_risk && selectedRun.stage_or_risk.includes('HIGH')) ? '#f87171' : '#10b981', marginTop: 2 }}>
          {selectedRun.confidence_pct ? `${selectedRun.confidence_pct.toFixed(1)}%` : '-'} · {selectedRun.stage_or_risk || selectedRun.risk_level}
        </div>
      </div>
      <div style={{ background: 'var(--bg-card)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)', fontWeight: 700 }}>Quantum Execution</div>
        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--accent)', marginTop: 2 }}>
          {isIQM ? '🌐 Real IQM Garnet 20-Qubit QPU' : (selectedRun.model_type === 'vqc' ? '⚛️ 4-Qubit VQC' : '⚡ 4-Qubit QSVC')}
        </div>
      </div>
    </div>

            {/* Hardware Telemetry if present */}
            {isIQM && qTel && (
              <div style={{
                background: 'rgba(37, 99, 235, 0.08)',
                border: '1px solid rgba(37, 99, 235, 0.3)',
                borderRadius: 8,
                padding: 10,
                marginBottom: 10
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#60a5fa', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Cpu size={13} /> Hardware Telemetry (Espoo, Finland)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 6, fontSize: '0.70rem', color: '#94a3b8' }}>
                  <div>Backend: <b style={{ color: 'var(--text-primary)' }}>{qTel.backend || selectedRun.hardware_backend}</b></div>
                  <div>Job ID: <b style={{ color: 'var(--text-primary)' }}>{(qTel.job_id || '').slice(0, 10)}...</b></div>
                  <div>Qubits: <b style={{ color: 'var(--text-primary)' }}>{qTel.qubits_used || 4} Transmons</b></div>
                  <div>Shots: <b style={{ color: 'var(--text-primary)' }}>{qTel.shots || 1024}</b></div>
                  <div>QPU Time: <b style={{ color: '#60a5fa' }}>{qTel.physical_latency_ms || selectedRun.latency_ms?.toFixed(0)} ms</b></div>
                </div>
              </div>
            )}

          {/* Raw JSON inspection toggle */}
          <details style={{ fontSize: '0.70rem', color: '#7da8cc' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#93c5fd' }}>Inspect SQLite Stored JSON Payload</summary>
            <pre style={{
              background: 'var(--bg-secondary)',
              padding: 10,
              borderRadius: 6,
              border: '1px solid var(--border)',
              overflowX: 'auto',
              maxHeight: 180,
              color: 'var(--accent)',
              fontFamily: 'JetBrains Mono, monospace',
              marginTop: 6
            }}>
              {JSON.stringify({ input_data: selectedRun.input_data, raw_result: selectedRun.raw_result }, null, 2)}
            </pre>
          </details>
        </div>
        )
      })()}
    </div>
  )
}
