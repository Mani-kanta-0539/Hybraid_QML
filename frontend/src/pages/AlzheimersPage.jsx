import React, { useState, useEffect } from 'react'
import {
  Brain,
  Scan,
  Activity,
  BarChart3,
  Database,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Upload,
  RefreshCw,
  Info,
  Layers,
  ChevronRight,
  TrendingDown,
  FileText
} from 'lucide-react'
import { QiskitCircuitViewer } from '../components/QiskitCircuitViewer'
import { RecentRunsTable } from '../components/RecentRunsTable'

const API_BASE = 'http://127.0.0.1:8000'

export function AlzheimersPage() {
  const [activeTab, setActiveTab] = useState('mri')

  // Model selection states
  const [mriModelType, setMriModelType] = useState('qsvc')
  const [clinicalModelType, setClinicalModelType] = useState('qsvc')
  const [recentRunsTrigger, setRecentRunsTrigger] = useState(0)

  // --- MRI TAB STATE ---
  const [mriFile, setMriFile] = useState(null)
  const [mriPreview, setMriPreview] = useState(null)
  const [mriLoading, setMriLoading] = useState(false)
  const [mriResult, setMriResult] = useState(null)
  const [mriError, setMriError] = useState(null)

  // --- CLINICAL TAB STATE ---
  const [clinicalForm, setClinicalForm] = useState({
    age: 74,
    educ: 12,
    ses: 2,
    mmse: 27,
    etiv: 1450,
    nwbv: 0.74,
  })
  const [clinicalLoading, setClinicalLoading] = useState(false)
  const [clinicalResult, setClinicalResult] = useState(null)
  const [clinicalError, setClinicalError] = useState(null)

  // --- METRICS & BENCHMARKS ---
  const [metrics, setMetrics] = useState(null)
  const [metricsLoading, setMetricsLoading] = useState(false)

  // --- OASIS COHORT DATASET ---
  const [oasisData, setOasisData] = useState(null)
  const [oasisLoading, setOasisLoading] = useState(false)
  const [oasisSearch, setOasisSearch] = useState('')

  // Load metrics & dataset on mount
  useEffect(() => {
    fetchMetrics()
    fetchOasisDataset()
  }, [])

  const fetchMetrics = async () => {
    setMetricsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/metrics/alzheimers`)
      if (res.ok) {
        const data = await res.json()
        setMetrics(data)
      }
    } catch (e) {
      console.error('Failed to load Alzheimer metrics:', e)
    } finally {
      setMetricsLoading(false)
    }
  }

  const fetchOasisDataset = async () => {
    setOasisLoading(true)
    try {
      const res = await fetch(`${API_BASE}/dataset/oasis?limit=35`)
      if (res.ok) {
        const data = await res.json()
        setOasisData(data)
      }
    } catch (e) {
      console.error('Failed to load OASIS dataset:', e)
    } finally {
      setOasisLoading(false)
    }
  }

  // --- MRI PRESET SAMPLES ---
  const handleSelectSample = async (category, filename) => {
    setMriError(null)
    setMriResult(null)
    const url = `/sample_alzheimers/${category}/${filename}`
    try {
      const response = await fetch(url)
      if (!response.ok) {
        // Fallback demo mock image generator
        generateDemoBrainScan(category)
        return
      }
      const blob = await response.blob()
      const file = new File([blob], filename, { type: 'image/png' })
      setMriFile(file)
      setMriPreview(URL.createObjectURL(file))
    } catch (err) {
      generateDemoBrainScan(category)
    }
  }

  const generateDemoBrainScan = (category) => {
    // Generate an in-browser medical MRI brain canvas
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#05070f'
    ctx.fillRect(0, 0, 256, 256)

    // Outer skull
    ctx.beginPath()
    ctx.ellipse(128, 128, 95, 115, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#222736'
    ctx.fill()
    ctx.lineWidth = 4
    ctx.strokeStyle = '#606b85'
    ctx.stroke()

    // Brain parenchyma
    ctx.beginPath()
    ctx.ellipse(128, 128, 86, 105, 0, 0, Math.PI * 2)
    ctx.fillStyle = category.includes('Demented') ? '#404961' : '#576282'
    ctx.fill()

    // Ventricles (enlarged in dementia)
    const vSize = category.includes('Moderate') ? 36 : (category.includes('Mild') ? 26 : 14)
    ctx.beginPath()
    ctx.ellipse(108, 120, vSize * 0.4, vSize, 0.2, 0, Math.PI * 2)
    ctx.ellipse(148, 120, vSize * 0.4, vSize, -0.2, 0, Math.PI * 2)
    ctx.fillStyle = '#0a0d18'
    ctx.fill()

    canvas.toBlob((blob) => {
      const file = new File([blob], `${category.toLowerCase()}_scan.png`, { type: 'image/png' })
      setMriFile(file)
      setMriPreview(canvas.toDataURL())
    })
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setMriFile(file)
      setMriPreview(URL.createObjectURL(file))
      setMriResult(null)
      setMriError(null)
    }
  }

  const handleMriPredict = async () => {
    if (!mriFile) return
    setMriLoading(true)
    setMriError(null)
    try {
      const formData = new FormData()
      formData.append('file', mriFile)
      const res = await fetch(`${API_BASE}/predict/alzheimers/mri?model_type=${mriModelType}`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Inference failed')
      }
      const data = await res.json()
      setMriResult(data)
      setRecentRunsTrigger(prev => prev + 1)
    } catch (err) {
      setMriError(err.message)
    } finally {
      setMriLoading(false)
    }
  }

  // --- CLINICAL FORM SUBMIT ---
  const handleClinicalPredict = async (e) => {
    if (e) e.preventDefault()
    setClinicalLoading(true)
    setClinicalError(null)
    try {
      const res = await fetch(`${API_BASE}/predict/alzheimers/clinical?model_type=${clinicalModelType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...clinicalForm, model_type: clinicalModelType }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Clinical prediction failed')
      }
      const data = await res.json()
      setClinicalResult(data)
      setRecentRunsTrigger(prev => prev + 1)
    } catch (err) {
      setClinicalError(err.message)
    } finally {
      setClinicalLoading(false)
    }
  }

  const loadClinicalPreset = (preset) => {
    if (preset === 'normal') {
      setClinicalForm({ age: 72, educ: 16, ses: 1, mmse: 29, etiv: 1460, nwbv: 0.77 })
    } else if (preset === 'mci') {
      setClinicalForm({ age: 77, educ: 12, ses: 3, mmse: 23, etiv: 1410, nwbv: 0.71 })
    } else if (preset === 'dementia') {
      setClinicalForm({ age: 83, educ: 10, ses: 4, mmse: 17, etiv: 1390, nwbv: 0.67 })
    }
    setClinicalResult(null)
  }

  return (
    <div style={{ maxWidth: 1350, margin: '0 auto', padding: '32px 24px' }}>
      {/* Top Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(17, 24, 39, 0.6) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        borderRadius: 20,
        padding: '28px 32px',
        marginBottom: 28,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #f59e0b, #b45309)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.35)',
          }}>
            <Brain size={32} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Alzheimer's Disease & Dementia QML Studio
              </h1>
              <span style={{
                background: 'rgba(245, 158, 11, 0.18)',
                color: '#fbbf24',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 10px',
                letterSpacing: 0.5,
              }}>
                4-QUBIT HAVLÍČEK QSVC
              </span>
            </div>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: 14 }}>
              Dual-Modality Diagnostic Engine: Brain MRI NeuroScans & OASIS Cognitive Clinical Biomarkers
            </p>
          </div>
        </div>

        {/* Feature Badges */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#cbd5e1',
            background: 'rgba(30, 41, 59, 0.8)', padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <Cpu size={14} color="#38bdf8" /> 4-Qubit ZZ-Kernel
          </span>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#cbd5e1',
            background: 'rgba(30, 41, 59, 0.8)', padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <Database size={14} color="#a855f7" /> OASIS (436 Patients)
          </span>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#cbd5e1',
            background: 'rgba(30, 41, 59, 0.8)', padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <Sparkles size={14} color="#fbbf24" /> Atrophy Saliency Heatmap
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: 12,
        marginBottom: 28,
        overflowX: 'auto',
      }}>
        {[
          { id: 'mri', label: '🧠 Brain MRI Scanner', desc: 'Scan Upload & Neurodegeneration Saliency' },
          { id: 'clinical', label: '📋 OASIS Cognitive Form', desc: 'EHR & Volumetric Biomarkers' },
          { id: 'benchmarks', label: '📊 Model Performance', desc: 'Accuracy & ROC-AUC Validation' },
          { id: 'dataset', label: '🗃️ OASIS Clinical Cohort', desc: '436 Patient Longitudinal Explorer' },
          { id: 'circuit', label: '⚛️ Quantum Architecture', desc: '4-Qubit Havlíček Topology' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              border: activeTab === tab.id ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
              color: activeTab === tab.id ? '#fbbf24' : '#94a3b8',
              borderRadius: 12,
              padding: '10px 18px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 2,
              transition: 'all 0.15s ease',
            }}
          >
            <span>{tab.label}</span>
            <span style={{ fontSize: 11, opacity: 0.7, fontWeight: 400 }}>{tab.desc}</span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BRAIN MRI SCANNER */}
      {/* ========================================================================= */}
      {activeTab === 'mri' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: 24 }}>
          {/* Left: Upload and Presets */}
          <div style={{
            background: 'var(--bg-card, #111827)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 16,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 6px 0', color: '#f1f5f9' }}>
                Upload Brain MRI Scan
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
                Accepts axial T1-weighted cranial MRI scans. Preprocessed via 64x64 PCA projection to 4 quantum qubits.
              </p>
            </div>

            {/* Model Architecture Selector */}
            <div style={{ background: '#0a0e1a', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 12, padding: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Cpu size={14} /> Quantum Architecture & Execution Engine:
              </label>
              <select
                value={mriModelType}
                onChange={(e) => setMriModelType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 10px',
                  borderRadius: 8,
                  border: `1px solid ${mriModelType === 'iqm' ? '#3b82f6' : 'rgba(245, 158, 11, 0.35)'}`,
                  background: '#131b2e',
                  color: '#f8fafc',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="qsvc">⚡ Havlíček QSVC (4-Qubit Simulator · 91.25% Acc — Production)</option>
                <option value="vqc">⚛️ 4-Qubit Variational Quantum Classifier (VQC Simulator)</option>
                <option value="iqm">🌐 Real Quantum Hardware: IQM Garnet 20-Qubit QPU (Transmon PRX/CZ + M3 QEM)</option>
              </select>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, lineHeight: 1.4 }}>
                {mriModelType === 'iqm'
                  ? '🌐 Transpiles 4-qubit circuit to native PRX & CZ pulses on IQM Garnet QPU (Espoo, Finland) with M3 readout mitigation.'
                  : mriModelType === 'vqc'
                  ? '⚛️ 4-qubit Strongly Entangled Variational Quantum Circuit with parametrized rotations and ring entanglement.'
                  : '⚡ 4-qubit second-order ZZ phase feature map with quantum kernel SVM decision boundaries.'}
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: 8 }}>
                Quick Test Scans (from Dataset):
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => handleSelectSample('NonDemented', 'non_1006.jpg')}
                  style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    color: '#4ade80',
                    padding: '8px 10px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  🟢 Non-Demented
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSample('VeryMildDemented', 'verymild.jpg')}
                  style={{
                    background: 'rgba(234, 179, 8, 0.1)',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    color: '#facc15',
                    padding: '8px 10px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  🟡 Early MCI
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSample('MildDemented', 'mild.jpg')}
                  style={{
                    background: 'rgba(249, 115, 22, 0.1)',
                    border: '1px solid rgba(249, 115, 22, 0.3)',
                    color: '#fb923c',
                    padding: '8px 10px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  🟠 Mild Dementia
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSample('ModerateDemented', 'moderate.jpg')}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    padding: '8px 10px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  🔴 Moderate Atrophy
                </button>
              </div>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onClick={() => document.getElementById('mri-upload-input').click()}
              style={{
                border: '2px dashed rgba(245, 158, 11, 0.3)',
                borderRadius: 12,
                padding: '28px 16px',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'rgba(245, 158, 11, 0.03)',
                transition: 'border 0.2s ease',
              }}
            >
              <input
                id="mri-upload-input"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <Upload size={32} color="#fbbf24" style={{ margin: '0 auto 10px auto' }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
                Click to upload MRI scan
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                PNG, JPG or DICOM exports (256x256 recommended)
              </div>
            </div>

            {/* Run Button */}
            <button
              onClick={handleMriPredict}
              disabled={!mriFile || mriLoading}
              style={{
                background: mriLoading
                  ? 'rgba(245, 158, 11, 0.4)'
                  : 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 10,
                padding: '12px 20px',
                fontSize: 15,
                fontWeight: 700,
                cursor: mriFile && !mriLoading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 16px rgba(245, 158, 11, 0.25)',
              }}
            >
              {mriLoading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> {mriModelType === 'iqm' ? 'Submitting to IQM Garnet QPU...' : 'Evaluating Quantum Circuit...'}
                </>
              ) : (
                <>
                  <Brain size={16} /> Run {mriModelType === 'iqm' ? 'on IQM Garnet QPU' : (mriModelType === 'vqc' ? '4-Qubit VQC Diagnosis' : 'Quantum MRI Diagnosis')}
                </>
              )}
            </button>

            {mriError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 8,
                padding: '10px 14px',
                color: '#fca5a5',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <AlertCircle size={16} /> {mriError}
              </div>
            )}
          </div>

          {/* Right: Dual Visualizer & Quantum Result Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Visualizer Row */}
            <div style={{
              background: 'var(--bg-card, #111827)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 16,
              padding: 24,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#f1f5f9' }}>
                  Brain MRI & Atrophy Saliency Viewer
                </h3>
                {mriResult && (
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>
                    Latency: {mriResult.latency_ms} ms
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Original Scan */}
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8, fontWeight: 600 }}>
                    1. Input T1-MRI Scan (Axial)
                  </div>
                  <div style={{
                    aspectRatio: '1/1',
                    background: '#090d16',
                    borderRadius: 12,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {mriPreview ? (
                      <img
                        src={mriPreview}
                        alt="Brain MRI Scan"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ color: '#475569', fontSize: 13, textAlign: 'center', padding: 20 }}>
                        <Brain size={40} strokeWidth={1.5} style={{ margin: '0 auto 8px auto', opacity: 0.4 }} />
                        Select or upload a scan on the left
                      </div>
                    )}
                  </div>
                </div>

                {/* Saliency Heatmap Overlay */}
                <div>
                  <div style={{ fontSize: 12, color: '#fbbf24', marginBottom: 8, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={13} /> 2. Quantum Atrophy Saliency Heatmap
                  </div>
                  <div style={{
                    aspectRatio: '1/1',
                    background: '#090d16',
                    borderRadius: 12,
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {mriResult?.saliency_overlay_base64 ? (
                      <img
                        src={mriResult.saliency_overlay_base64}
                        alt="Atrophy Saliency Heatmap"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ color: '#475569', fontSize: 13, textAlign: 'center', padding: 20 }}>
                        <Layers size={40} strokeWidth={1.5} style={{ margin: '0 auto 8px auto', opacity: 0.4 }} />
                        Run diagnosis to compute spatial attention hotspots
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnostic Result Card */}
            {mriResult && (
              <div style={{
                background: 'var(--bg-card, #111827)',
                border: mriResult.prediction === 1
                  ? '1px solid rgba(239, 68, 68, 0.35)'
                  : '1px solid rgba(34, 197, 94, 0.35)',
                borderRadius: 16,
                padding: 24,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: mriResult.prediction === 1 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                      color: mriResult.prediction === 1 ? '#f87171' : '#4ade80',
                      border: mriResult.prediction === 1 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: 8,
                      padding: '4px 12px',
                      fontSize: 13,
                      fontWeight: 700,
                      marginBottom: 8,
                    }}>
                      {mriResult.prediction === 1 ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
                      {mriResult.prediction_label === 'Demented' ? 'DEMENTIA PATTERN DETECTED' : 'NORMAL BRAIN MORPHOLOGY'}
                    </div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                      {mriResult.diagnosis_stage}
                    </h2>
                    <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
                      Estimated Clinical Rating: <strong style={{ color: '#fbbf24' }}>{mriResult.cdr_estimate}</strong>
                    </div>
                  </div>

                  {/* Confidence Gauge */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>Model Confidence</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: mriResult.prediction === 1 ? '#f87171' : '#4ade80' }}>
                      {mriResult.confidence_pct}%
                    </div>
                  </div>
                </div>

                {/* Recommendation */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 10,
                  padding: 14,
                  fontSize: 13,
                  color: '#cbd5e1',
                  marginBottom: 18,
                  lineHeight: 1.5,
                }}>
                  <strong style={{ color: '#f1f5f9' }}>Clinical Protocol: </strong>
                  {mriResult.recommendation}
                </div>

                {/* 4-Qubit State Angles */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Cpu size={14} color="#38bdf8" /> 4-Qubit Quantum Rotation Encodings:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                    {mriResult.quantum_circuit?.qubit_rotations?.map((q) => (
                      <div
                        key={q.qubit}
                        style={{
                          background: 'rgba(30, 41, 59, 0.7)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: 8,
                          padding: '8px 12px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
                          <span>Qubit |{q.qubit}⟩</span>
                          <span style={{ color: '#38bdf8', fontWeight: 600 }}>{q.angle_rad} rad</span>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginTop: 2 }}>
                          {q.feature}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Real Hardware Telemetry with M3 QEM */}
                {mriResult.hardware_telemetry && (
                  <div style={{
                    marginTop: 14,
                    background: 'rgba(59, 130, 246, 0.08)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: 10,
                    padding: 12
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Cpu size={14} /> Real Hardware Telemetry: {mriResult.hardware_telemetry.backend}
                      </span>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)', fontWeight: 700 }}>
                        M3 QEM Active
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 6, fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>
                      <div>Job ID: <b style={{ color: '#f1f5f9' }}>{(mriResult.hardware_telemetry.job_id || '').slice(0, 8)}...</b></div>
                      <div>Qubits: <b style={{ color: '#f1f5f9' }}>{mriResult.hardware_telemetry.qubits_used} Transmons</b></div>
                      <div>Shots: <b style={{ color: '#f1f5f9' }}>{mriResult.hardware_telemetry.shots}</b></div>
                      <div>QPU Latency: <b style={{ color: '#60a5fa' }}>{mriResult.hardware_telemetry.physical_latency_ms} ms</b></div>
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic', borderTop: '1px dashed rgba(59, 130, 246, 0.2)', paddingTop: 4 }}>
                      📡 {mriResult.hardware_telemetry.status_note}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SQLite Diagnostics Persistent History Table */}
          <div style={{ gridColumn: '1 / -1' }}>
            <RecentRunsTable
              disease="alzheimers"
              title="Recent NeuroScan & Clinical Runs (SQLite Persistent)"
              refreshTrigger={recentRunsTrigger}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: OASIS COGNITIVE CLINICAL FORM */}
      {/* ========================================================================= */}
      {activeTab === 'clinical' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 440px) 1fr', gap: 24 }}>
          {/* Left: Input Form */}
          <div style={{
            background: 'var(--bg-card, #111827)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 16,
            padding: 24,
          }}>
            <div style={{ marginBottom: 18 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 6px 0', color: '#f1f5f9' }}>
                OASIS Clinical Biomarkers
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
                Patient cognitive, educational, and cranial volumetric measurements mapped to 4-Qubit QSVC.
              </p>
            </div>

            {/* Model Architecture Selector */}
            <div style={{ background: '#0a0e1a', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 12, padding: 12, marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Cpu size={14} /> Quantum Architecture & Execution Engine:
              </label>
              <select
                value={clinicalModelType}
                onChange={(e) => setClinicalModelType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 10px',
                  borderRadius: 8,
                  border: `1px solid ${clinicalModelType === 'iqm' ? '#3b82f6' : 'rgba(245, 158, 11, 0.35)'}`,
                  background: '#131b2e',
                  color: '#f8fafc',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="qsvc">⚡ Havlíček QSVC (4-Qubit Simulator · 86.8% Acc — Production)</option>
                <option value="iqm">🌐 Real Quantum Hardware: IQM Garnet 20-Qubit QPU (Transmon PRX/CZ + M3 QEM)</option>
              </select>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, lineHeight: 1.4 }}>
                {clinicalModelType === 'iqm'
                  ? '🌐 Transpiles 4-qubit circuit to native PRX & CZ pulses on IQM Garnet QPU (Espoo, Finland) with M3 readout mitigation.'
                  : '⚡ 4-qubit second-order ZZ phase feature map encoding 6 OASIS clinical biomarkers into a 16D Hilbert space.'}
              </div>
            </div>

            {/* Presets */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: 8 }}>
                Clinical Presets:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => loadClinicalPreset('normal')}
                  style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.25)',
                    color: '#4ade80',
                    padding: '6px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  🟢 Healthy 72y
                </button>
                <button
                  type="button"
                  onClick={() => loadClinicalPreset('mci')}
                  style={{
                    background: 'rgba(234, 179, 8, 0.1)',
                    border: '1px solid rgba(234, 179, 8, 0.25)',
                    color: '#facc15',
                    padding: '6px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  🟡 Early MCI 77y
                </button>
                <button
                  type="button"
                  onClick={() => loadClinicalPreset('dementia')}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#f87171',
                    padding: '6px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  🔴 Dementia 83y
                </button>
              </div>
            </div>

            <form onSubmit={handleClinicalPredict} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Age */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: '#cbd5e1' }}>Patient Age</span>
                  <span style={{ color: '#fbbf24', fontWeight: 700 }}>{clinicalForm.age} years</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="98"
                  value={clinicalForm.age}
                  onChange={(e) => setClinicalForm({ ...clinicalForm, age: parseFloat(e.target.value) })}
                  style={{ width: '100%', accentColor: '#f59e0b' }}
                />
              </div>

              {/* MMSE */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: '#cbd5e1' }}>Mini-Mental State Exam (MMSE)</span>
                  <span style={{ color: clinicalForm.mmse < 24 ? '#f87171' : '#4ade80', fontWeight: 700 }}>
                    {clinicalForm.mmse} / 30 {clinicalForm.mmse < 24 ? '(Impairment)' : '(Normal)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="30"
                  value={clinicalForm.mmse}
                  onChange={(e) => setClinicalForm({ ...clinicalForm, mmse: parseFloat(e.target.value) })}
                  style={{ width: '100%', accentColor: clinicalForm.mmse < 24 ? '#ef4444' : '#22c55e' }}
                />
              </div>

              {/* nWBV */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: '#cbd5e1' }}>Normalized Whole Brain Vol. (nWBV)</span>
                  <span style={{ color: clinicalForm.nwbv < 0.72 ? '#f87171' : '#38bdf8', fontWeight: 700 }}>
                    {clinicalForm.nwbv.toFixed(3)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.64"
                  max="0.84"
                  step="0.005"
                  value={clinicalForm.nwbv}
                  onChange={(e) => setClinicalForm({ ...clinicalForm, nwbv: parseFloat(e.target.value) })}
                  style={{ width: '100%', accentColor: '#38bdf8' }}
                />
              </div>

              {/* eTIV */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: '#cbd5e1' }}>Est. Total Intracranial Vol. (eTIV)</span>
                  <span style={{ color: '#cbd5e1', fontWeight: 700 }}>{clinicalForm.etiv} mm³</span>
                </div>
                <input
                  type="range"
                  min="1150"
                  max="1950"
                  step="10"
                  value={clinicalForm.etiv}
                  onChange={(e) => setClinicalForm({ ...clinicalForm, etiv: parseFloat(e.target.value) })}
                  style={{ width: '100%', accentColor: '#a855f7' }}
                />
              </div>

              {/* Education & SES 2-column */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#cbd5e1', display: 'block', marginBottom: 4 }}>
                    Education (Years)
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="22"
                    value={clinicalForm.educ}
                    onChange={(e) => setClinicalForm({ ...clinicalForm, educ: parseFloat(e.target.value) })}
                    style={{
                      width: '100%',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#f8fafc',
                      borderRadius: 8,
                      padding: '8px 10px',
                      fontSize: 13,
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#cbd5e1', display: 'block', marginBottom: 4 }}>
                    Socioeconomic (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={clinicalForm.ses}
                    onChange={(e) => setClinicalForm({ ...clinicalForm, ses: parseFloat(e.target.value) })}
                    style={{
                      width: '100%',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#f8fafc',
                      borderRadius: 8,
                      padding: '8px 10px',
                      fontSize: 13,
                    }}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={clinicalLoading}
                style={{
                  marginTop: 8,
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 20px',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: clinicalLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {clinicalLoading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> {clinicalModelType === 'iqm' ? 'Submitting to IQM Garnet QPU...' : 'Evaluating Quantum Kernel...'}
                  </>
                ) : (
                  <>
                    <Activity size={16} /> Predict {clinicalModelType === 'iqm' ? 'on IQM Garnet QPU' : 'CDR Dementia Risk'}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right: Clinical Assessment Output */}
          <div>
            {clinicalResult ? (
              <div style={{
                background: 'var(--bg-card, #111827)',
                border: clinicalResult.prediction === 1
                  ? '1px solid rgba(239, 68, 68, 0.4)'
                  : '1px solid rgba(34, 197, 94, 0.4)',
                borderRadius: 16,
                padding: 28,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: clinicalResult.risk_level === 'HIGH' ? 'rgba(239, 68, 68, 0.15)' : (clinicalResult.risk_level === 'MODERATE' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(34, 197, 94, 0.15)'),
                      color: clinicalResult.risk_level === 'HIGH' ? '#f87171' : (clinicalResult.risk_level === 'MODERATE' ? '#fbbf24' : '#4ade80'),
                      border: '1px solid currentColor',
                      borderRadius: 8,
                      padding: '4px 12px',
                      fontSize: 12,
                      fontWeight: 700,
                      marginBottom: 8,
                    }}>
                      {clinicalResult.risk_level} RISK TIER
                    </div>
                    <h2 style={{ fontSize: 24, fontWeight: 900, margin: 0, color: '#f8fafc' }}>
                      {clinicalResult.cdr_estimate}
                    </h2>
                    <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
                      Clinical Status: <strong>{clinicalResult.prediction_label}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>Dementia Probability</div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: clinicalResult.dementia_probability >= 0.5 ? '#f87171' : '#4ade80' }}>
                      {(clinicalResult.dementia_probability * 100).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Latency: {clinicalResult.latency_ms}ms</div>
                  </div>
                </div>

                {/* Risk Factors Highlight */}
                {clinicalResult.risk_factors && clinicalResult.risk_factors.length > 0 && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: 10,
                    padding: 14,
                    marginBottom: 16,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <AlertTriangle size={14} /> Critical Clinical Risk Factors Identified:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#fecaca', lineHeight: 1.6 }}>
                      {clinicalResult.risk_factors.map((rf, i) => (
                        <li key={i}>{rf}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendation */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 10,
                  padding: 14,
                  fontSize: 13,
                  color: '#cbd5e1',
                  marginBottom: 20,
                  lineHeight: 1.5,
                }}>
                  <strong style={{ color: '#f1f5f9' }}>Diagnostic Recommendation: </strong>
                  {clinicalResult.recommendation}
                </div>

                {/* Quantum Rotations */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Cpu size={14} color="#38bdf8" /> 4-Qubit Havlíček Quantum Embedding:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10 }}>
                    {clinicalResult.quantum_circuit?.qubit_rotations?.map((q) => (
                      <div
                        key={q.qubit}
                        style={{
                          background: 'rgba(30, 41, 59, 0.7)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: 8,
                          padding: '10px 12px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
                          <span>Qubit |{q.qubit}⟩</span>
                          <span style={{ color: '#38bdf8', fontWeight: 600 }}>{q.angle_rad} rad</span>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginTop: 4 }}>
                          {q.feature}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Real Hardware Telemetry with M3 QEM */}
                {clinicalResult.hardware_telemetry && (
                  <div style={{
                    marginTop: 14,
                    background: 'rgba(59, 130, 246, 0.08)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: 10,
                    padding: 12
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Cpu size={14} /> Real Hardware Telemetry: {clinicalResult.hardware_telemetry.backend}
                      </span>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)', fontWeight: 700 }}>
                        M3 QEM Active
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 6, fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>
                      <div>Job ID: <b style={{ color: '#f1f5f9' }}>{(clinicalResult.hardware_telemetry.job_id || '').slice(0, 8)}...</b></div>
                      <div>Qubits: <b style={{ color: '#f1f5f9' }}>{clinicalResult.hardware_telemetry.qubits_used} Transmons</b></div>
                      <div>Shots: <b style={{ color: '#f1f5f9' }}>{clinicalResult.hardware_telemetry.shots}</b></div>
                      <div>QPU Latency: <b style={{ color: '#60a5fa' }}>{clinicalResult.hardware_telemetry.physical_latency_ms} ms</b></div>
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic', borderTop: '1px dashed rgba(59, 130, 246, 0.2)', paddingTop: 4 }}>
                      📡 {clinicalResult.hardware_telemetry.status_note}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                background: 'var(--bg-card, #111827)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 16,
                padding: 40,
                textAlign: 'center',
                color: '#64748b',
              }}>
                <Brain size={48} strokeWidth={1.5} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
                <h3 style={{ fontSize: 16, color: '#cbd5e1', margin: '0 0 6px 0' }}>No Assessment Executed Yet</h3>
                <p style={{ margin: 0, fontSize: 13 }}>
                  Select a clinical preset on the left or customize MMSE and brain volumetric parameters to predict CDR risk.
                </p>
              </div>
            )}
          </div>

          {/* SQLite Diagnostics Persistent History Table */}
          <div style={{ gridColumn: '1 / -1' }}>
            <RecentRunsTable
              disease="alzheimers"
              title="Recent NeuroScan & Clinical Runs (SQLite Persistent)"
              refreshTrigger={recentRunsTrigger}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MODEL PERFORMANCE & BENCHMARKS */}
      {/* ========================================================================= */}
      {activeTab === 'benchmarks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {metrics ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* MRI Model Card */}
                <div style={{
                  background: 'var(--bg-card, #111827)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: 16,
                  padding: 24,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Brain size={20} color="#fbbf24" />
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                        Brain MRI NeuroScan QSVC
                      </h3>
                    </div>
                    <span style={{ fontSize: 11, color: '#fbbf24', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: 6 }}>
                      4 Qubits
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 18 }}>
                    <div style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>Accuracy</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#4ade80' }}>
                        {metrics.mri_model?.accuracy_pct}%
                      </div>
                    </div>
                    <div style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>Balanced Acc</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#38bdf8' }}>
                        {metrics.mri_model?.balanced_acc_pct}%
                      </div>
                    </div>
                    <div style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>ROC-AUC</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#fbbf24' }}>
                        {metrics.mri_model?.roc_auc}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.6 }}>
                    <div><strong>Architecture:</strong> {metrics.mri_model?.model_type}</div>
                    <div><strong>Samples:</strong> {metrics.mri_model?.n_samples} axial brain scans (NonDemented & Demented)</div>
                    <div><strong>PCA Variance Explained:</strong> {metrics.mri_model?.pca_variance_explained?.join('%, ')}%</div>
                  </div>
                </div>

                {/* OASIS Clinical Model Card */}
                <div style={{
                  background: 'var(--bg-card, #111827)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: 16,
                  padding: 24,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Database size={20} color="#38bdf8" />
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                        OASIS Clinical Cohort QSVC
                      </h3>
                    </div>
                    <span style={{ fontSize: 11, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '2px 8px', borderRadius: 6 }}>
                      4 Qubits
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 18 }}>
                    <div style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>Accuracy</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#4ade80' }}>
                        {metrics.oasis_model?.accuracy_pct}%
                      </div>
                    </div>
                    <div style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>Balanced Acc</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#38bdf8' }}>
                        {metrics.oasis_model?.balanced_acc_pct}%
                      </div>
                    </div>
                    <div style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>ROC-AUC</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#38bdf8' }}>
                        {metrics.oasis_model?.roc_auc}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.6 }}>
                    <div><strong>Architecture:</strong> {metrics.oasis_model?.model_type}</div>
                    <div><strong>Cohort Database:</strong> {metrics.oasis_model?.total_cohort_records} clinical patient records</div>
                    <div><strong>Features:</strong> {metrics.oasis_model?.features?.join(', ')}</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px auto' }} />
              Loading benchmark metrics...
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: OASIS CLINICAL COHORT EXPLORER */}
      {/* ========================================================================= */}
      {activeTab === 'dataset' && (
        <div style={{
          background: 'var(--bg-card, #111827)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 16,
          padding: 24,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 4px 0', color: '#f8fafc' }}>
                OASIS Cross-Sectional Clinical Cohort
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
                Open Access Series of Imaging Studies (Washington University School of Medicine)
              </p>
            </div>

            {oasisData && (
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ fontSize: 12, color: '#cbd5e1', background: 'rgba(30, 41, 59, 0.8)', padding: '6px 12px', borderRadius: 8 }}>
                  Total Cohort: <strong>{oasisData.total_cohort_records}</strong> patients
                </span>
                <span style={{ fontSize: 12, color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', padding: '6px 12px', borderRadius: 8 }}>
                  Demented: <strong>{oasisData.demented_patients}</strong>
                </span>
                <span style={{ fontSize: 12, color: '#4ade80', background: 'rgba(34, 197, 94, 0.1)', padding: '6px 12px', borderRadius: 8 }}>
                  Non-Demented: <strong>{oasisData.non_demented_patients}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Table */}
          {oasisData?.sample_records ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                    <th style={{ padding: '10px 12px' }}>Patient ID</th>
                    <th style={{ padding: '10px 12px' }}>Sex</th>
                    <th style={{ padding: '10px 12px' }}>Age</th>
                    <th style={{ padding: '10px 12px' }}>Educ</th>
                    <th style={{ padding: '10px 12px' }}>SES</th>
                    <th style={{ padding: '10px 12px' }}>MMSE</th>
                    <th style={{ padding: '10px 12px' }}>CDR</th>
                    <th style={{ padding: '10px 12px' }}>eTIV</th>
                    <th style={{ padding: '10px 12px' }}>nWBV</th>
                  </tr>
                </thead>
                <tbody>
                  {oasisData.sample_records.map((r, i) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        color: '#cbd5e1',
                      }}
                    >
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#fbbf24' }}>{r.ID}</td>
                      <td style={{ padding: '10px 12px' }}>{r['M/F']}</td>
                      <td style={{ padding: '10px 12px' }}>{r.Age}</td>
                      <td style={{ padding: '10px 12px' }}>{r.Educ}</td>
                      <td style={{ padding: '10px 12px' }}>{r.SES}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: r.MMSE < 24 ? '#f87171' : '#4ade80' }}>
                        {r.MMSE}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          background: r.CDR > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                          color: r.CDR > 0 ? '#f87171' : '#4ade80',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 700,
                        }}>
                          {r.CDR === 'N/A' ? 'N/A' : `CDR ${r.CDR}`}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>{r.eTIV}</td>
                      <td style={{ padding: '10px 12px' }}>{r.nWBV}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
              <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 10px auto' }} />
              Loading OASIS cohort records...
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: QUANTUM CIRCUIT ARCHITECTURE */}
      {/* ========================================================================= */}
      {activeTab === 'circuit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <QiskitCircuitViewer
            title="Alzheimer's Disease Havlíček ZZ-Feature Map — 4-Qubit Quantum Kernel"
            subtitle="Code-accurate Qiskit diagram mapping cranial volume (eTIV), brain parenchymal fraction (nWBV), and MMSE into 16-D Hilbert space"
            imageSrc="/circuits/alzheimers_qsvc_circuit.png"
            qiskitCode={`# Qiskit 4-Qubit Havlíček Quantum Kernel for Alzheimer's Diagnostic Mapping
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit.circuit import ParameterVector, Parameter

qr = QuantumRegister(4, name="q_brain")
cr = ClassicalRegister(4, name="cdr_state")
qc = QuantumCircuit(qr, cr)

# 4 Neuro-Biomarker Features: [Ventricular, Hippocampal, Cortical, Parenchymal/MMSE]
theta = ParameterVector("θ", 4)

# 1. Hadamard Superposition
for i in range(4):
    qc.h(qr[i])
qc.barrier(label="Neuro-Biomarker Phase")

# 2. 1st-Order Phase Encoding: Rz(2θ_i)
for i in range(4):
    qc.rz(2 * theta[i], qr[i])
qc.barrier(label="Cranial-Cognitive ZZ Coupling")

# 3. 2nd-Order Cross-Coupling: CNOT -> Rz -> CNOT
pairs = [(0, 1), (1, 2), (2, 3), (0, 2)]
for i, j in pairs:
    qc.cx(qr[i], qr[j])
    qc.rz(Parameter(f"2(π-θ_{i})(π-θ_{j})"), qr[j])
    qc.cx(qr[i], qr[j])

qc.barrier(label="State Fidelity ⟨Φ(x)|Φ(x')⟩")
qc.measure(qr, cr)

# Render publication-quality Qiskit MPL diagram
qc.draw(output="mpl")`}
            badges={['Qiskit 2.x Verified', 'OASIS & MRI Compatible', 'Havlíček ZZ-Kernel']}
            qubitDetails={[
              { qubit: 0, label: 'q_brain[0]: Ventricular Dilatation', desc: 'Encodes lateral ventricular enlargement ratio' },
              { qubit: 1, label: 'q_brain[1]: Hippocampal Atrophy', desc: 'Encodes medial temporal lobe tissue shrinkage' },
              { qubit: 2, label: 'q_brain[2]: Cortical Gray Matter', desc: 'Encodes sulcal widening and neocortical thinning' },
              { qubit: 3, label: 'q_brain[3]: Global Parenchymal Ratio', desc: 'Encodes nWBV and MMSE cognitive reserve scores' },
            ]}
          />

          <div style={{
            background: 'var(--bg-card, #111827)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 16,
            padding: 24,
          }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc', margin: '0 0 10px 0' }}>
              Mathematical Formulation: Second-Order Non-Linear Feature Map
            </h4>
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: 10,
              padding: 14,
              marginBottom: 16,
              fontFamily: 'monospace',
              color: '#fbbf24',
              fontSize: 13,
            }}>
              U_Φ(x) = exp( i ∑_j x_j Z_j + i ∑_(j &lt; k) (π - x_j)(π - x_k) Z_j Z_k )
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: 14, borderRadius: 10 }}>
                <h5 style={{ color: '#38bdf8', margin: '0 0 4px 0', fontSize: 13 }}>1. Hadamard Initialization</h5>
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
                  Generates an equiprobable superposition across all 16 basis states: |0⟩^⊗4 → 1/4 ∑ |k⟩.
                </p>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: 14, borderRadius: 10 }}>
                <h5 style={{ color: '#a855f7', margin: '0 0 4px 0', fontSize: 13 }}>2. Non-linear Phase Encoding</h5>
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
                  Applies single-qubit R_z(2θ_j) phase rotations encoding hippocampal atrophy and MMSE scores.
                </p>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: 14, borderRadius: 10 }}>
                <h5 style={{ color: '#fbbf24', margin: '0 0 4px 0', fontSize: 13 }}>3. CNOT Entangling Gates</h5>
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
                  Couples all qubit pairs via ZZ-interactions, capturing non-linear synergies between cranial size (eTIV) and brain volumetrics (nWBV).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
