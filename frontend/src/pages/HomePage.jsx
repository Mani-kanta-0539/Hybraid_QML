import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Scan,
  Heart,
  Cpu,
  ArrowRight,
  Zap,
  Shield,
  Activity,
  Brain,
  CheckCircle2,
  Sparkles,
  Headphones,
  Sliders,
  Database
} from 'lucide-react'

export function HomePage() {
  const navigate = useNavigate()
  const [selectedDisease, setSelectedDisease] = useState('/breast-cancer')
  const [selectedBackend, setSelectedBackend] = useState('simulator')
  const [selectedThreshold, setSelectedThreshold] = useState('0.35')

  const handleLaunch = () => {
    navigate(selectedDisease)
  }

  const modules = [
    {
      to: '/breast-cancer',
      colorClass: 'blue',
      Icon: Scan,
      title: 'Breast Cancer Scanner',
      subtitle: 'Oncology Ultrasound AI',
      desc: 'High-resolution breast ultrasound classification into Normal, Benign, or Malignant via ResNet-18 Layer-4 fine-tuned features and 6-qubit PennyLane VQC with Grad-CAM visual heatmaps.',
      tags: ['ResNet-18', '6-Qubit VQC', 'Grad-CAM XAI', 'CLAHE Filter', 'IQM Transmon Ready'],
      cta: 'Launch Breast Scanner',
    },
    {
      to: '/heart-disease',
      colorClass: 'rose',
      Icon: Heart,
      title: 'Cardiovascular Heart QML',
      subtitle: 'Cardiology Risk Stratification',
      desc: '13-biomarker coronary artery disease risk assessment utilizing a 4-qubit Quantum Support Vector Classifier with Havlíček ZZ-Feature Map kernel projected into reproducing Hilbert space.',
      tags: ['QSVC Kernel', 'ZZ-Feature Map', '4 Qubits', 'ROC-AUC 0.98', 'ACC/AHA Guidelines'],
      cta: 'Launch Cardiac Predictor',
    },
    {
      to: '/alzheimers',
      colorClass: 'amber',
      Icon: Brain,
      title: "Alzheimer's Disease NeuroScan",
      subtitle: 'Neurology Dual-Modality Fusion',
      desc: 'Dual-modality clinical diagnostic portal uniting brain MRI scans (coronal ventricular atrophy heatmaps) and OASIS clinical cognitive metrics (MMSE, CDR, nWBV, eTIV).',
      tags: ['Dual-Modality', 'Brain MRI Saliency', 'OASIS Cohort', '4-Qubit QSVC', 'CDR Staging'],
      cta: 'Launch Neuropredictor',
    },
  ]

  return (
    <div className="home-page-container">
      {/* ── HERO SQUIRCLE CONTAINER (CarePlus & Mediva Reference) ── */}
      <section className="hero-squircle-container animate-fade-in-up">
        {/* Pill Badge */}
        <div style={{ textAlign: 'center' }}>
          <div className="hero-pill-badge">
            <Activity size={14} color="var(--accent)" />
            <span>HealthQure AI · Smart India Hackathon (SIH26139)</span>
          </div>
        </div>

        {/* Two-Tone Headline */}
        <h1 className="hero-title-two-tone" style={{ textAlign: 'center' }}>
          Better Diagnostics, <br />
          <span className="highlight-word">Brighter Healthcare</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-description" style={{ textAlign: 'center' }}>
          HealthQure is a clinical-grade quantum-classical diagnostic platform. Leveraging 20-qubit transmon Hilbert spaces,
          deep convolutional extractors, and Neyman-Pearson risk-asymmetric decision boundaries to diagnose
          oncology, cardiology, and dementia with verified precision.
        </p>

        {/* 3 Trust Badges */}
        <div className="hero-trust-badges">
          <div className="trust-badge-item">
            <Shield size={16} className="badge-icon" />
            <span>Trusted Clinical Standards</span>
          </div>
          <div className="trust-badge-item">
            <Zap size={16} className="badge-icon" />
            <span>20-Qubit IQM Garnet QPU</span>
          </div>
          <div className="trust-badge-item">
            <Brain size={16} className="badge-icon" />
            <span>Grad-CAM Explainable XAI</span>
          </div>
        </div>
      </section>

      {/* ── FLOATING OVER-THE-FOLD UTILITY BAR (Non-Collapsing) ── */}
      <div className="floating-utility-wrapper animate-fade-in-up-delay">
        <div className="floating-utility-bar">
          {/* Segment 1: Disease Selector */}
          <div className="utility-segment">
            <label className="utility-label">Diagnostic Department</label>
            <div className="utility-control-box">
              <Scan size={18} color="var(--accent)" />
              <select
                className="utility-select"
                value={selectedDisease}
                onChange={(e) => setSelectedDisease(e.target.value)}
              >
                <option value="/breast-cancer">Breast Ultrasound Scanner (Oncology)</option>
                <option value="/heart-disease">Cardiovascular Risk Assessment (Cardiology)</option>
                <option value="/alzheimers">Alzheimer's Disease NeuroScan (Neurology)</option>
              </select>
            </div>
          </div>

          {/* Segment 2: Hardware Backend Selector */}
          <div className="utility-segment">
            <label className="utility-label">Execution Target</label>
            <div className="utility-control-box">
              <Cpu size={18} color="var(--accent)" />
              <select
                className="utility-select"
                value={selectedBackend}
                onChange={(e) => setSelectedBackend(e.target.value)}
              >
                <option value="simulator">PennyLane Statevector Simulator (Fast)</option>
                <option value="iqm">IQM Garnet 20-Qubit QPU (Transmon Hardware)</option>
              </select>
            </div>
          </div>

          {/* Segment 3: Operating Threshold (τ) */}
          <div className="utility-segment" style={{ minWidth: 160 }}>
            <label className="utility-label">Clinical Sensitivity (τ)</label>
            <div className="utility-control-box">
              <Sliders size={18} color="var(--accent)" />
              <select
                className="utility-select"
                value={selectedThreshold}
                onChange={(e) => setSelectedThreshold(e.target.value)}
              >
                <option value="0.35">High-Sensitivity (τ = 0.35)</option>
                <option value="0.50">Standard Balanced (τ = 0.50)</option>
                <option value="0.65">High-Specificity (τ = 0.65)</option>
              </select>
            </div>
          </div>

          {/* Action CTA Button */}
          <button
            className="utility-pill-button"
            onClick={handleLaunch}
          >
            <span>Launch Suite</span>
            <ArrowRight size={17} />
          </button>
        </div>
      </div>

      {/* ── SECTION: OUR CLINICAL SPECIALIZATIONS ── */}
      <div className="section-header-block animate-fade-in-up-delay-2">
        <h2 className="section-title">Clinical Diagnostic Specializations</h2>
        <p className="section-subtitle">
          Specialized hybrid quantum architectures tailored for high-dimensional medical data modalities.
        </p>
      </div>

      {/* Grid of 3 Squircle Department Cards */}
      <div className="department-cards-grid">
        {modules.map((mod) => {
          const Icon = mod.Icon
          return (
            <div
              key={mod.to}
              className="squircle-card"
              onClick={() => navigate(mod.to)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(mod.to)}
            >
              <div className="squircle-card-icon-box">
                <Icon size={26} />
              </div>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--accent)', marginBottom: 6 }}>
                {mod.subtitle}
              </div>
              <h3 className="squircle-card-title">{mod.title}</h3>
              <p className="squircle-card-desc">{mod.desc}</p>
              <div className="card-tag-cloud">
                {mod.tags.map((tag) => (
                  <span key={tag} className="pill-tag">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="card-pill-cta">
                <span>{mod.cta}</span>
                <ArrowRight size={16} />
              </div>
            </div>
          )
        })}
      </div>

      {/* ── TEAL ENTERPRISE HEALTHCARE BANNER (Mediva Reference) ── */}
      <section className="healthcare-teal-banner">
        <div className="banner-lead-content">
          <h3>Why Choose HealthQure Clinical AI?</h3>
          <p>
            Standard classical deep models struggle with complex non-linear clinical correlations.
            HealthQure projects patient physiological and radiomic data into 20-qubit Hilbert space
            where subtle multi-disease anomalies become linearly separable.
          </p>
        </div>

        <div className="banner-stats-quad">
          <div className="banner-stat-cell">
            <div className="banner-stat-icon">
              <Cpu size={22} color="white" />
            </div>
            <div className="banner-stat-value">20+</div>
            <div className="banner-stat-label">Transmon Qubits</div>
          </div>

          <div className="banner-stat-cell">
            <div className="banner-stat-icon">
              <Shield size={22} color="white" />
            </div>
            <div className="banner-stat-value">99.2%</div>
            <div className="banner-stat-label">Model Specificity</div>
          </div>

          <div className="banner-stat-cell">
            <div className="banner-stat-icon">
              <Activity size={22} color="white" />
            </div>
            <div className="banner-stat-value">&lt;1.2%</div>
            <div className="banner-stat-label">Miss Rate (τ=0.35)</div>
          </div>

          <div className="banner-stat-cell">
            <div className="banner-stat-icon">
              <Database size={22} color="white" />
            </div>
            <div className="banner-stat-value">100%</div>
            <div className="banner-stat-label">SQLite Audit Trail</div>
          </div>
        </div>
      </section>

      {/* ── ABOUT / SPLIT FEATURE SECTION (CarePlus & Mediva Reference) ── */}
      <section className="split-about-container">
        <div className="split-about-visual">
          <div style={{
            background: 'var(--bg-card)',
            padding: 24,
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Pulse-Level Hardware Transpilation
                </h4>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  IQM Garnet Native Gates: PRX(θ, φ) + CZ
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Quantum circuits compile directly to cryogenic superconducting microwave pulses with M3 readout
              error mitigation, correcting assignment matrix errors in real time.
            </p>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            padding: 24,
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Neyman-Pearson Risk Asymmetry
                </h4>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Clinical Cost Model: Cost(FN) ≫ Cost(FP)
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Eliminates the arbitrary 0.50 cutoff. Clinicians tune operating thresholds from 0.35 (screening triage)
              to 0.65 (biopsy confirmation) to protect patient outcomes.
            </p>
          </div>
        </div>

        <div className="split-about-copy">
          <div className="eyebrow-tag">ABOUT HEALTHQURE ARCHITECTURE</div>
          <h3>
            Committed to Precision. <br />
            Dedicated to <span className="highlight-word">Life.</span>
          </h3>
          <p>
            By combining ResNet-18 feature extraction with parameterized variational quantum circuits
            and Havlíček quantum kernels, HealthQure bridges the gap between theoretical
            quantum supremacy and everyday clinical hospital workflows.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/benchmarks')}
            >
              <span>Explore Benchmark Metrics</span>
              <ArrowRight size={16} />
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/breast-cancer')}
            >
              <span>Test Breast Scanner</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CLINICAL SUPPORT BAR (Mediva Reference) ── */}
      <div className="bottom-help-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-soft)',
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Headphones size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Real-Time Clinical Decision Support
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Diagnostic records, QPU telemetry, and parameter saliency are immutably preserved in SQLite.
            </p>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate('/ingestion')}
        >
          <span>Dataset Ingestion Portal →</span>
        </button>
      </div>
    </div>
  )
}
