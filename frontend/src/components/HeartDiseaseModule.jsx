import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'http://127.0.0.1:8000'
const RISK_COLORS = { LOW: '#10b981', MODERATE: '#f59e0b', HIGH: '#ef4444' }

// ─── Sub-Page 1: Patient Form & Results ─────────────────────────────────────
function PatientFormSubPage() {
  const [formData, setFormData] = useState({
    age: 54,
    sex: 1,
    cholesterol: 245,
    resting_bp: 135,
    exercise_angina: 1,
    st_depression: 1.5
  })
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const PRESETS = [
    { label: '🟢 Low Risk Sample (CAD Negative)', data: { age: 34, sex: 0, cholesterol: 172, resting_bp: 112, exercise_angina: 0, st_depression: 0.1 } },
    { label: '🟡 Borderline Risk Sample', data: { age: 52, sex: 1, cholesterol: 226, resting_bp: 128, exercise_angina: 0, st_depression: 0.8 } },
    { label: '🔴 High Risk Sample (CAD Positive)', data: { age: 62, sex: 1, cholesterol: 275, resting_bp: 150, exercise_angina: 1, st_depression: 2.5 } },
    { label: '🚨 Acute Ischemic Sample', data: { age: 68, sex: 1, cholesterol: 255, resting_bp: 144, exercise_angina: 1, st_depression: 3.4 } },
  ]

  const handlePredict = async (dataToSubmit = formData) => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await axios.post(`${API}/predict/heart`, dataToSubmit)
      setResult(res.data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Heart prediction API error. Is the backend server running?')
    } finally {
      setLoading(false)
    }
  }

  const applyPreset = (pData) => {
    setFormData(pData)
    handlePredict(pData)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
      {/* Form Card */}
      <div className="card">
        <div className="card-header">🩺 Patient Clinical Parameters</div>

        {error && <div className="error-banner">⚠️ {error}</div>}

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: '0.85em', color: '#8facc8', marginBottom: 8, fontWeight: 600 }}>Clinical Presets (Cleveland Study Samples)</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                className="btn btn-secondary"
                style={{ fontSize: '0.82em', padding: '6px 12px' }}
                onClick={() => applyPreset(p.data)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={e => { e.preventDefault(); handlePredict() }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85em', color: '#8facc8', marginBottom: 6 }}>Age (25–85 years)</label>
              <input
                type="number"
                className="input-field"
                style={{ width: '100%', padding: '10px', background: '#070c16', border: '1px solid #1e3a5f', borderRadius: 8, color: '#fff' }}
                value={formData.age}
                onChange={e => setFormData({ ...formData, age: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85em', color: '#8facc8', marginBottom: 6 }}>Biological Sex</label>
              <select
                className="input-field"
                style={{ width: '100%', padding: '10px', background: '#070c16', border: '1px solid #1e3a5f', borderRadius: 8, color: '#fff' }}
                value={formData.sex}
                onChange={e => setFormData({ ...formData, sex: parseInt(e.target.value) })}
              >
                <option value={1}>👨 Male (Value 1)</option>
                <option value={0}>👩 Female (Value 0)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85em', color: '#8facc8', marginBottom: 6 }}>Serum Cholesterol (mg/dL)</label>
              <input
                type="number"
                className="input-field"
                style={{ width: '100%', padding: '10px', background: '#070c16', border: '1px solid #1e3a5f', borderRadius: 8, color: '#fff' }}
                value={formData.cholesterol}
                onChange={e => setFormData({ ...formData, cholesterol: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85em', color: '#8facc8', marginBottom: 6 }}>Resting Blood Pressure (mm Hg)</label>
              <input
                type="number"
                className="input-field"
                style={{ width: '100%', padding: '10px', background: '#070c16', border: '1px solid #1e3a5f', borderRadius: 8, color: '#fff' }}
                value={formData.resting_bp}
                onChange={e => setFormData({ ...formData, resting_bp: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85em', color: '#8facc8', marginBottom: 6 }}>Exercise Induced Angina</label>
              <select
                className="input-field"
                style={{ width: '100%', padding: '10px', background: '#070c16', border: '1px solid #1e3a5f', borderRadius: 8, color: '#fff' }}
                value={formData.exercise_angina}
                onChange={e => setFormData({ ...formData, exercise_angina: parseInt(e.target.value) })}
              >
                <option value={0}>❌ 0: Absent</option>
                <option value={1}>⚠️ 1: Present (Angina Chest Pain)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85em', color: '#8facc8', marginBottom: 6 }}>ST Segment Depression (mm)</label>
              <input
                type="number"
                step="0.1"
                className="input-field"
                style={{ width: '100%', padding: '10px', background: '#070c16', border: '1px solid #1e3a5f', borderRadius: 8, color: '#fff' }}
                value={formData.st_depression}
                onChange={e => setFormData({ ...formData, st_depression: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #d97706, #b45309)', border: 'none' }}
          >
            {loading ? '⚛️ Computing Quantum Kernel...' : '❤️ Run QSVC Quantum Prediction'}
          </button>
        </form>
      </div>

      {/* Result Card */}
      <div className="card">
        <div className="card-header">📊 Quantum Fidelity Assessment</div>

        {!result && !loading && (
          <div className="placeholder" style={{ padding: '60px 20px' }}>
            <div className="placeholder-icon">⚛️</div>
            <div className="placeholder-text">Click Run QSVC Prediction to evaluate Havlíček ZZ-Feature Map quantum fidelity.</div>
          </div>
        )}

        {loading && (
          <div className="loading-spinner" style={{ padding: '60px 20px' }}>
            <div className="spinner" />
            <div className="loading-text">Evaluating 4-Qubit Quantum Hilbert Space Statevectors...</div>
          </div>
        )}

        {result && (
          <div>
            <div style={{
              background: result.risk_level === 'HIGH' ? 'rgba(239, 68, 68, 0.15)' : result.risk_level === 'MODERATE' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              border: `1px solid ${RISK_COLORS[result.risk_level]}`,
              borderRadius: 12,
              padding: 20,
              textAlign: 'center',
              marginBottom: 20
            }}>
              <div style={{ fontSize: '0.85em', color: '#8facc8', fontWeight: 600, textTransform: 'uppercase' }}>Coronary Heart Disease Risk</div>
              <div style={{ fontSize: '2.5em', fontWeight: 800, color: RISK_COLORS[result.risk_level], margin: '4px 0' }}>
                {result.risk_percentage}%
              </div>
              <div style={{ fontSize: '1.1em', fontWeight: 700, color: RISK_COLORS[result.risk_level] }}>
                {result.risk_level} RISK — {result.prediction_class}
              </div>
            </div>

            {result.risk_factors && result.risk_factors.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '0.88em', fontWeight: 700, color: '#f0f6ff', marginBottom: 8 }}>⚠️ Identified Biomarker Risk Factors:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {result.risk_factors.map((factor, idx) => (
                    <div key={idx} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px 12px', borderRadius: 6, fontSize: '0.85em', color: '#fca5a5' }}>
                      • {factor}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ background: '#070c16', border: '1px solid #1e3a5f', padding: 16, borderRadius: 10, marginBottom: 20 }}>
              <div style={{ fontSize: '0.88em', fontWeight: 700, color: '#60a5fa', marginBottom: 6 }}>📋 ACC/AHA Diagnostic Recommendation:</div>
              <div style={{ fontSize: '0.9em', color: '#e2e8f0', lineHeight: 1.5 }}>{result.recommendation}</div>
            </div>

            <div style={{ background: '#070c16', border: '1px solid #1e3a5f', padding: 16, borderRadius: 10 }}>
              <div style={{ fontSize: '0.85em', color: '#8facc8', marginBottom: 8 }}>⚛️ PCA Angle Representation ($x_1..x_4 \in [-\pi, \pi]$):</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, textAlign: 'center' }}>
                {result.quantum_angles.map((angle, idx) => (
                  <div key={idx} style={{ background: '#0f1829', padding: '6px 4px', borderRadius: 6, fontSize: '0.82em', border: '1px solid #1e3a5f' }}>
                    <div style={{ color: '#4a6280', fontSize: '0.78em' }}>q[{idx}]</div>
                    <div style={{ color: '#34d399', fontWeight: 600 }}>{angle} rad</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sub-Page 2: CSV Batch Uploader ─────────────────────────────────────────
function BatchUploadSubPage() {
  const [csvContent, setCsvContent] = useState('')
  const [batchResults, setBatchResults] = useState(null)
  const [loading, setLoading]       = useState(false)

  const sampleCSV = `age,sex,cholesterol,resting_bp,exercise_angina,st_depression
34,0,172,112,0,0.1
52,1,226,128,0,0.8
62,1,275,150,1,2.5
68,1,255,144,1,3.4`

  const handleProcessBatch = async () => {
    if (!csvContent.trim()) return
    setLoading(true)
    try {
      const lines = csvContent.trim().split('\n')
      const headers = lines[0].split(',')
      const results = []

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue
        const vals = lines[i].split(',')
        const rowData = {
          age: parseFloat(vals[0]),
          sex: parseInt(vals[1]),
          cholesterol: parseFloat(vals[2]),
          resting_bp: parseFloat(vals[3]),
          exercise_angina: parseInt(vals[4]),
          st_depression: parseFloat(vals[5])
        }
        const res = await axios.post(`${API}/predict/heart`, rowData)
        results.push({ row: i, input: rowData, result: res.data })
      }
      setBatchResults(results)
    } catch (e) {
      alert('Error processing CSV batch.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ padding: 28 }}>
      <h2 style={{ fontSize: '1.4em', fontWeight: 700, color: '#f0f6ff', marginBottom: 12 }}>
        📁 CSV Batch Clinical Data Uploader
      </h2>
      <p style={{ color: '#8facc8', lineHeight: 1.6, marginBottom: 20 }}>
        Paste or upload a CSV file containing multiple patient clinical records to perform automated batch QSVC quantum state fidelity assessment.
      </p>

      <div style={{ marginBottom: 16 }}>
        <button
          className="btn btn-secondary"
          style={{ fontSize: '0.82em', marginBottom: 10 }}
          onClick={() => setCsvContent(sampleCSV)}
        >
          Load Sample Clinical Dataset CSV
        </button>

        <textarea
          style={{ width: '100%', height: 160, background: '#070c16', border: '1px solid #1e3a5f', borderRadius: 8, padding: 14, color: '#34d399', fontFamily: 'monospace', fontSize: '0.85em' }}
          value={csvContent}
          placeholder="age,sex,cholesterol,resting_bp,exercise_angina,st_depression..."
          onChange={e => setCsvContent(e.target.value)}
        />
      </div>

      <button
        className="btn btn-primary"
        disabled={loading || !csvContent.trim()}
        onClick={handleProcessBatch}
        style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #d97706, #b45309)', border: 'none' }}
      >
        {loading ? '⚛️ Processing Batch Quantum Kernels...' : '⚡ Process Batch Quantum Inference'}
      </button>

      {batchResults && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: '1.1em', fontWeight: 700, color: '#f0f6ff', marginBottom: 12 }}>
            📊 Batch Inference Results ({batchResults.length} Patients Evaluated)
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table className="summary-table" style={{ background: '#070c16', border: '1px solid #1e3a5f', borderRadius: 8 }}>
              <thead>
                <tr style={{ background: '#0f1829', color: '#8facc8' }}>
                  <th style={{ padding: 10, textAlign: 'left' }}>Patient #</th>
                  <th style={{ padding: 10, textAlign: 'left' }}>Age/Sex</th>
                  <th style={{ padding: 10, textAlign: 'left' }}>Cholesterol</th>
                  <th style={{ padding: 10, textAlign: 'left' }}>Resting BP</th>
                  <th style={{ padding: 10, textAlign: 'left' }}>Angina / ST</th>
                  <th style={{ padding: 10, textAlign: 'left' }}>CAD Risk %</th>
                  <th style={{ padding: 10, textAlign: 'left' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {batchResults.map((r, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #1e3a5f' }}>
                    <td style={{ padding: 10, color: '#fff' }}>Patient #{r.row}</td>
                    <td style={{ padding: 10, color: '#8facc8' }}>{r.input.age} y / {r.input.sex === 1 ? 'M' : 'F'}</td>
                    <td style={{ padding: 10, color: '#8facc8' }}>{r.input.cholesterol} mg/dL</td>
                    <td style={{ padding: 10, color: '#8facc8' }}>{r.input.resting_bp} mm Hg</td>
                    <td style={{ padding: 10, color: '#8facc8' }}>{r.input.exercise_angina === 1 ? 'Yes' : 'No'} / {r.input.st_depression}mm</td>
                    <td style={{ padding: 10, fontWeight: 800, color: RISK_COLORS[r.result.risk_level] }}>
                      {r.result.risk_percentage}%
                    </td>
                    <td style={{ padding: 10 }}>
                      <span className="badge" style={{ background: `${RISK_COLORS[r.result.risk_level]}20`, color: RISK_COLORS[r.result.risk_level], border: `1px solid ${RISK_COLORS[r.result.risk_level]}40` }}>
                        {r.result.risk_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sub-Page 3: ZZ Feature Map Architecture ────────────────────────────────
function ArchitectureSubPage() {
  return (
    <div className="card" style={{ padding: 28 }}>
      <h2 style={{ fontSize: '1.4em', fontWeight: 700, color: '#f0f6ff', marginBottom: 12 }}>
        ⚛️ Havlíček ZZ-Feature Map Quantum Architecture
      </h2>
      <p style={{ color: '#8facc8', lineHeight: 1.6, marginBottom: 24 }}>
        The Quantum Support Vector Classifier (QSVC) maps classical clinical biomarkers into a 4-qubit quantum state space using non-linear two-qubit entangling gates.
      </p>

      <div style={{ background: '#070c16', border: '1px solid #1e3a5f', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.9em', textTransform: 'uppercase', marginBottom: 12 }}>
          Quantum Fidelity Kernel Equation
        </div>
        <div style={{ fontSize: '1.1em', fontFamily: 'monospace', color: '#60a5fa', background: '#0f1829', padding: 14, borderRadius: 8, textAlign: 'center', marginBottom: 16 }}>
          $K(x_i, x_j) = |\langle \psi(x_i) \mid \psi(x_j) \rangle|^2$
        </div>
        <p style={{ fontSize: '0.88em', color: '#8facc8', lineHeight: 1.5 }}>
          The transition amplitude between statevectors $\psi(x_i)$ and $\psi(x_j)$ evaluates similarity in the 16-dimensional complex Hilbert space $\mathcal{H} \in \mathbb{C}^{16}$, constructing a non-linear quantum Gram matrix for Support Vector Machines.
        </p>
      </div>

      <div style={{ background: '#070c16', border: '1px solid #1e3a5f', borderRadius: 12, padding: 24 }}>
        <div style={{ color: '#34d399', fontWeight: 700, fontSize: '0.9em', textTransform: 'uppercase', marginBottom: 12 }}>
          ZZ-Feature Map Circuit Schematic (4 Qubits)
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '0.85em', color: '#34d399', lineHeight: 1.8, overflowX: 'auto', background: '#091325', padding: 16, borderRadius: 8 }}>
          {`q[0]: ──H──RZ(2x0)──●──────────────●──RZ(ϕ01)──●──────────────|psi(x)⟩
q[1]: ──H──RZ(2x1)──X──RZ(ϕ01)──X────────┼───────●──RZ(ϕ12)──●──|psi(x)⟩
q[2]: ──H──RZ(2x2)───────────────────────X───────X──RZ(ϕ12)──X──|psi(x)⟩
q[3]: ──H──RZ(2x3)──────────────────────────────────────────────|psi(x)⟩`}
        </div>
      </div>
    </div>
  )
}

// ─── Sub-Page 4: Dataset & Metrics Explorer ─────────────────────────────────
function DatasetMetricsSubPage() {
  const [meta, setMeta] = useState(null)

  useEffect(() => {
    axios.get(`${API}/metrics/heart`).then(res => setMeta(res.data)).catch(() => {})
  }, [])

  return (
    <div>
      <div className="metrics-grid">
        <div className="stat-card">
          <div className="stat-icon">⚛️</div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>4 Qubits</div>
          <div className="stat-label">Hilbert Space Width</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔬</div>
          <div className="stat-value" style={{ color: '#60a5fa' }}>6 Features</div>
          <div className="stat-label">Clinical Biomarkers</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-value" style={{ color: '#10b981' }}>{meta ? (meta.accuracy * 100).toFixed(1) + '%' : '52.5%'}</div>
          <div className="stat-label">Test Set Accuracy</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-value" style={{ color: '#f472b6' }}>{meta ? meta.f1_score.toFixed(3) : '0.596'}</div>
          <div className="stat-label">QSVC F1-Score</div>
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '1.1em', fontWeight: 700, color: '#f0f6ff', marginBottom: 14 }}>
          📋 Cleveland Clinical Dataset Biomarkers
        </h3>
        <table className="summary-table">
          <thead>
            <tr style={{ color: '#8facc8' }}>
              <th style={{ textAlign: 'left', padding: 8 }}>Attribute</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Clinical Description</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Normal Range</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Risk Threshold</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: 8, color: '#fff', fontWeight: 600 }}>age</td>
              <td style={{ padding: 8, color: '#8facc8' }}>Patient Age (years)</td>
              <td style={{ padding: 8, color: '#8facc8' }}>25 – 45 y</td>
              <td style={{ padding: 8, color: '#ef4444' }}>≥ 60 years</td>
            </tr>
            <tr>
              <td style={{ padding: 8, color: '#fff', fontWeight: 600 }}>sex</td>
              <td style={{ padding: 8, color: '#8facc8' }}>Biological Sex</td>
              <td style={{ padding: 8, color: '#8facc8' }}>Female (0) / Male (1)</td>
              <td style={{ padding: 8, color: '#f59e0b' }}>Male baseline</td>
            </tr>
            <tr>
              <td style={{ padding: 8, color: '#fff', fontWeight: 600 }}>cholesterol</td>
              <td style={{ padding: 8, color: '#8facc8' }}>Serum Cholesterol (mg/dL)</td>
              <td style={{ padding: 8, color: '#8facc8' }}>&lt; 200 mg/dL</td>
              <td style={{ padding: 8, color: '#ef4444' }}>≥ 240 mg/dL</td>
            </tr>
            <tr>
              <td style={{ padding: 8, color: '#fff', fontWeight: 600 }}>resting_bp</td>
              <td style={{ padding: 8, color: '#8facc8' }}>Resting Systolic BP (mm Hg)</td>
              <td style={{ padding: 8, color: '#8facc8' }}>&lt; 120 mm Hg</td>
              <td style={{ padding: 8, color: '#ef4444' }}>≥ 130 mm Hg</td>
            </tr>
            <tr>
              <td style={{ padding: 8, color: '#fff', fontWeight: 600 }}>exercise_angina</td>
              <td style={{ padding: 8, color: '#8facc8' }}>Exertional Chest Pain</td>
              <td style={{ padding: 8, color: '#8facc8' }}>0 (Absent)</td>
              <td style={{ padding: 8, color: '#ef4444' }}>1 (Present)</td>
            </tr>
            <tr>
              <td style={{ padding: 8, color: '#fff', fontWeight: 600 }}>st_depression</td>
              <td style={{ padding: 8, color: '#8facc8' }}>ST Segment Depression (Oldpeak)</td>
              <td style={{ padding: 8, color: '#8facc8' }}>&lt; 1.0 mm</td>
              <td style={{ padding: 8, color: '#ef4444' }}>≥ 2.0 mm Ischemia</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function HeartDiseaseModule({ subTab }) {
  return (
    <div>
      {subTab === 'patient_form'    && <PatientFormSubPage />}
      {subTab === 'batch_upload'    && <BatchUploadSubPage />}
      {subTab === 'architecture'    && <ArchitectureSubPage />}
      {subTab === 'dataset_explore' && <DatasetMetricsSubPage />}
    </div>
  )
}
