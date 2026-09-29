import React, { useState, useCallback, useRef, useEffect } from 'react'
import axios from 'axios'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { API_BASE } from '../config/api'

const API = API_BASE

const CLASS_COLORS = { Normal: '#10b981', Benign: '#f59e0b', Malignant: '#ef4444' }
const CLASS_ICONS  = { Normal: '🟢', Benign: '🟡', Malignant: '🔴' }
const CLASS_DESC   = {
  Normal:    'No structural abnormalities identified. Sonographic features are consistent with normal breast parenchyma.',
  Benign:    'Non-malignant lesion detected. Features consistent with fibroadenoma or cyst. Clinical follow-up recommended.',
  Malignant: 'Suspicious lesion with features suggestive of malignancy. Immediate specialist referral and biopsy advised.',
}
const RISK_COLORS = { LOW: '#10b981', MODERATE: '#f59e0b', HIGH: '#ef4444' }

function BreastUploadPanel({ onResult, onLoading, loading }) {
  const [preview, setPreview]   = useState(null)
  const [file, setFile]         = useState(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError]       = useState(null)
  const inputRef                = useRef()

  const handleFile = useCallback((f) => {
    if (!f) return
    setFile(f)
    setError(null)
    const url = URL.createObjectURL(f)
    setPreview(url)
    onResult(null)
  }, [onResult])

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [handleFile])

  const handleAnalyze = async () => {
    if (!file) return
    onLoading(true); setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await axios.post(`${API}/predict`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onResult(res.data)
    } catch (e) {
      const msg = e.response?.data?.detail || 'Inference failed. Is the API server running?'
      setError(msg)
      onResult(null)
    } finally {
      onLoading(false)
    }
  }

  const handleClear = () => {
    setPreview(null); setFile(null); onResult(null); setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="card">
      <div className="card-header">📷 Breast Ultrasound Image Upload</div>

      {error && <div className="error-banner">⚠️ {error}</div>}

      <div
        className={`upload-zone${dragging ? ' drag-active' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !preview && inputRef.current.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])}
        />

        {preview ? (
          <div className="preview-container">
            <img src={preview} alt="Ultrasound Preview" className="preview-img" />
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon">📂</div>
            <div className="upload-title">Drop Breast Ultrasound scan here</div>
            <div className="upload-sub">or click to browse files (PNG, JPEG)</div>
          </div>
        )}
      </div>

      {file && (
        <div style={{ marginTop: 12, fontSize: '0.85em', color: '#8facc8' }}>
          📄 Selected: <b>{file.name}</b> ({(file.size / 1024).toFixed(1)} KB)
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button
          className="btn btn-primary"
          onClick={handleAnalyze}
          disabled={!file || loading}
          style={{ flex: 1 }}
        >
          {loading ? '⚛️ Processing Quantum Model...' : '🔬 Run AI Diagnosis'}
        </button>
        {file && (
          <button className="btn btn-secondary" onClick={handleClear} disabled={loading}>
            Clear
          </button>
        )}
      </div>
    </div>
  )
}

function BreastResultCard({ result, loading }) {
  if (loading) {
    return (
      <div className="card">
        <div className="card-header">📊 Diagnostic Inference</div>
        <div className="loading-spinner">
          <div className="spinner" />
          <div className="loading-text">Processing image via 6-Qubit Quantum Circuit...</div>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="card">
        <div className="card-header">📊 Diagnostic Inference</div>
        <div className="placeholder">
          <div className="placeholder-icon">⚛️</div>
          <div className="placeholder-text">Upload a breast ultrasound image to run predictions.</div>
        </div>
      </div>
    )
  }

  const { predicted_class, confidence_pct, probabilities, risk_level, recommendation, latency_ms } = result
  const mainColor = CLASS_COLORS[predicted_class] || '#2563eb'

  return (
    <div className="card">
      <div className="card-header">📊 Diagnostic Inference Result</div>

      <div className="result-main-card" style={{ background: `${mainColor}18`, borderColor: `${mainColor}60` }}>
        <div className="result-class-badge" style={{ background: mainColor }}>
          {CLASS_ICONS[predicted_class]} {predicted_class.toUpperCase()}
        </div>

        <div className="result-confidence-group">
          <div className="result-confidence-val" style={{ color: mainColor }}>
            {confidence_pct.toFixed(1)}%
          </div>
          <div className="result-confidence-lbl">Prediction Confidence</div>
        </div>
      </div>

      <div className="prob-section">
        <div className="prob-title">Class Probability Distribution</div>
        {Object.entries(probabilities || {}).map(([cls, prob]) => {
          const pct   = (prob * 100).toFixed(1)
          const color = CLASS_COLORS[cls] || '#2563eb'
          return (
            <div key={cls} className="prob-row">
              <div className="prob-label">
                <span>{CLASS_ICONS[cls]} {cls}</span>
                <span className="prob-pct">{pct}%</span>
              </div>
              <div className="prob-track">
                <div className="prob-fill" style={{ width: `${pct}%`, background: color }} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="clinical-card" style={{ borderColor: `${RISK_COLORS[risk_level]}60` }}>
        <div className="clinical-header">
          <span className="risk-badge" style={{ background: RISK_COLORS[risk_level] }}>
            {risk_level} RISK
          </span>
          <span className="clinical-title">Clinical Assessment & Action</span>
        </div>
        <p className="clinical-desc">{CLASS_DESC[predicted_class]}</p>
        <div className="clinical-rec">
          <b>Recommendation:</b> {recommendation}
        </div>
      </div>

      <div className="latency-bar">
        ⚡ Inference Time: <b>{latency_ms.toFixed(1)} ms</b> &nbsp;|&nbsp; Resolution: <b>256×256 CLAHE</b> &nbsp;|&nbsp; Quantum Hardware: <b>6 Qubits</b>
      </div>
    </div>
  )
}

// ─── Sub-Pages ──────────────────────────────────────────────────────────────

function BreastScannerSubPage() {
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="grid-2col">
      <BreastUploadPanel onResult={setResult} onLoading={setLoading} loading={loading} />
      <BreastResultCard result={result} loading={loading} />
    </div>
  )
}

function BreastArchitectureSubPage() {
  return (
    <div className="card" style={{ padding: 28 }}>
      <h2 style={{ fontSize: '1.4em', fontWeight: 700, color: '#f0f6ff', marginBottom: 16 }}>
        ⚛️ 6-Qubit Data Re-Uploading Quantum Architecture
      </h2>
      <p style={{ color: '#8facc8', lineHeight: 1.6, marginBottom: 24 }}>
        The Breast Cancer Hybrid Quantum Neural Network (HQNN v2) maps preprocessed ultrasound features through a classical ResNet-18 bottleneck into a 6-qubit variational circuit with Data Re-Uploading.
      </p>

      <div style={{ background: '#070c16', border: '1px solid #1e3a5f', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <div style={{ color: '#60a5fa', fontWeight: 700, fontSize: '0.9em', textTransform: 'uppercase', marginBottom: 14 }}>
          Quantum Circuit Topology & Observables
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '0.85em', color: '#34d399', lineHeight: 1.8, overflowX: 'auto', background: '#091325', padding: 16, borderRadius: 8 }}>
          {`q[0]: ──RY(x0)──S(θ00)──●───────X──RY(x0)──S(θ10)──⟨Z0⟩ ⟨X0⟩
q[1]: ──RY(x1)──S(θ01)──┼──●────┼──RY(x1)──S(θ11)──⟨Z1⟩ ⟨X1⟩
q[2]: ──RY(x2)──S(θ02)──┼──┼──●─┼──RY(x2)──S(θ12)──⟨Z2⟩ ⟨X2⟩
q[3]: ──RY(x3)──S(θ03)──X──┼──┼─●──RY(x3)──S(θ13)──⟨Z3⟩ ⟨X3⟩
q[4]: ──RY(x4)──S(θ04)─────X──┼────RY(x4)──S(θ14)──⟨Z4⟩ ⟨X4⟩
q[5]: ──RY(x5)──S(θ05)────────X────RY(x5)──S(θ15)──⟨Z5⟩ ⟨X5⟩`}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <div style={{ background: '#070c16', border: '1px solid #1e3a5f', padding: 18, borderRadius: 10 }}>
          <div style={{ fontWeight: 700, color: '#f0f6ff', marginBottom: 6 }}>1. Data Re-Uploading</div>
          <div style={{ fontSize: '0.86em', color: '#8facc8', lineHeight: 1.5 }}>
            Features $x_i$ are re-embedded before each variational layer, transforming the circuit into a universal quantum kernel capable of fitting non-linear decision boundaries.
          </div>
        </div>

        <div style={{ background: '#070c16', border: '1px solid #1e3a5f', padding: 18, borderRadius: 10 }}>
          <div style={{ fontWeight: 700, color: '#f0f6ff', marginBottom: 6 }}>2. Dual Pauli Readout</div>
          <div style={{ fontSize: '0.86em', color: '#8facc8', lineHeight: 1.5 }}>
            Measures both $\langle Z_i \rangle$ and $\langle X_i \rangle$ expectation values per qubit, producing $2 \times 6 = 12$ high-dimensional quantum readout features.
          </div>
        </div>

        <div style={{ background: '#070c16', border: '1px solid #1e3a5f', padding: 18, borderRadius: 10 }}>
          <div style={{ fontWeight: 700, color: '#f0f6ff', marginBottom: 6 }}>3. 64-Dimensional Hilbert Space</div>
          <div style={{ fontSize: '0.86em', color: '#8facc8', lineHeight: 1.5 }}>
            6 qubits operate in $2^6 = 64$ Hilbert space dimensions, processing complex acoustic shadowing and lesion textures efficiently.
          </div>
        </div>
      </div>
    </div>
  )
}

function BreastMetricsSubPage() {
  const [metrics, setMetrics] = useState(null)

  useEffect(() => {
    axios.get(`${API}/metrics`).then(res => setMetrics(res.data)).catch(() => {})
  }, [])

  const history = metrics?.training_history || []

  return (
    <div>
      <div className="metrics-grid">
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-value" style={{ color: '#10b981' }}>72.65%</div>
          <div className="stat-label">Best Val Accuracy</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚛️</div>
          <div className="stat-value" style={{ color: '#60a5fa' }}>6 Qubits</div>
          <div className="stat-label">Quantum Width</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔬</div>
          <div className="stat-value" style={{ color: '#fbbf24' }}>256×256</div>
          <div className="stat-label">CLAHE Resolution</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-value" style={{ color: '#f472b6' }}>146 ms</div>
          <div className="stat-label">Avg Inference Latency</div>
        </div>
      </div>

      {history.length > 0 && (
        <div className="chart-section">
          <div className="chart-title">📈 Validation Accuracy Trajectory</div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={history} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="epoch" stroke="#4a6280" tick={{ fill: '#8facc8', fontSize: 12 }} />
              <YAxis stroke="#4a6280" tick={{ fill: '#8facc8', fontSize: 12 }} domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={{ background: '#0f1829', border: '1px solid #1e3a5f', borderRadius: 10, color: '#f0f6ff', fontSize: '0.85em' }} formatter={(v) => `${v}%`} />
              <Legend wrapperStyle={{ color: '#8facc8', fontSize: '0.85em', paddingTop: 10 }} />
              <Line type="monotone" dataKey="val_acc" stroke="#2563eb" strokeWidth={2.5} dot={false} name="Val Accuracy" />
              <Line type="monotone" dataKey="train_acc" stroke="#10b981" strokeWidth={2} dot={false} name="Train Accuracy" strokeDasharray="5 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

function BreastAboutSubPage() {
  return (
    <div className="about-grid">
      <div className="about-section">
        <h3>🧠 System Architecture & Preprocessing</h3>
        <p>
          The Breast Cancer Diagnostic Suite combines Contrast Limited Adaptive Histogram Equalization (CLAHE) with a fine-tuned ResNet-18 feature extractor and PennyLane variational quantum circuit.
        </p>
        <p>
          <b>CLAHE Contrast Enhancement:</b> Acoustic speckle noise is smoothed while enhancing micro-calcifications and lesion boundary edges.
        </p>
      </div>

      <div className="about-section">
        <h3>🏷️ Diagnostic Classes</h3>
        <div className="class-badge-row">
          <div className="class-badge">
            <div className="class-badge-dot" style={{ background: '#10b981' }} />
            <div>
              <div className="class-badge-name" style={{ color: '#10b981' }}>Normal (Class 0)</div>
              <div className="class-badge-desc">Normal parenchymal architecture, no acoustic shadowing or focal mass.</div>
            </div>
          </div>
          <div className="class-badge">
            <div className="class-badge-dot" style={{ background: '#f59e0b' }} />
            <div>
              <div className="class-badge-name" style={{ color: '#f59e0b' }}>Benign (Class 1)</div>
              <div className="class-badge-desc">Circumscribed margin, oval fibroadenoma or simple fluid-filled cyst.</div>
            </div>
          </div>
          <div className="class-badge">
            <div className="class-badge-dot" style={{ background: '#ef4444' }} />
            <div>
              <div className="class-badge-name" style={{ color: '#ef4444' }}>Malignant (Class 2)</div>
              <div className="class-badge-desc">Spiculated margin, hypoechoic acoustic shadowing, micro-invasions.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function BreastCancerModule({ subTab }) {
  return (
    <div>
      {subTab === 'scanner'      && <BreastScannerSubPage />}
      {subTab === 'architecture' && <BreastArchitectureSubPage />}
      {subTab === 'metrics'      && <BreastMetricsSubPage />}
      {subTab === 'about'        && <BreastAboutSubPage />}
    </div>
  )
}
