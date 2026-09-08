import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Scan, Heart, Cpu, ArrowRight, Zap, Shield, Activity, Brain, ExternalLink } from 'lucide-react'

export function HomePage() {
  const navigate = useNavigate()

  const modules = [
    {
      to: '/breast-cancer',
      colorClass: 'blue',
      iconColor: '#60a5fa',
      ctaColor: '#60a5fa',
      gradLine: 'linear-gradient(90deg, #2563eb, #7c3aed)',
      Icon: Scan,
      title: 'Breast Cancer Scanner',
      desc: 'Upload histopathology images for AI-powered classification into Normal, Benign, or Malignant using a Hybrid Quantum Neural Network with ResNet-18 backbone and 6-qubit PennyLane variational circuits.',
      tags: ['HybridQNN', 'ResNet-18', '6 Qubits', 'PennyLane', 'Image Upload', 'CLAHE'],
      cta: 'Open Scanner',
    },
    {
      to: '/heart-disease',
      colorClass: 'rose',
      iconColor: '#f87171',
      ctaColor: '#f87171',
      gradLine: 'linear-gradient(90deg, #e11d48, #f97316)',
      Icon: Heart,
      title: 'Heart Disease QML',
      desc: 'Enter 6 clinical biomarkers (Age, Sex, Cholesterol, BP, Angina, ST Depression) for Coronary Heart Disease risk assessment via a 4-qubit Quantum SVM using the Havlíček ZZ-Feature Map kernel.',
      tags: ['QSVC', 'ZZ-Feature Map', '4 Qubits', 'Batch Upload', 'ROC-AUC', 'PCA'],
      cta: 'Open Predictor',
    },
    {
      to: '/alzheimers',
      colorClass: 'amber',
      iconColor: '#fbbf24',
      ctaColor: '#fbbf24',
      gradLine: 'linear-gradient(90deg, #f59e0b, #d97706)',
      Icon: Brain,
      title: "Alzheimer's Disease QML",
      desc: 'Dual-modality NeuroScan diagnostic portal: Brain MRI scan analysis with neurodegenerative saliency heatmaps & OASIS clinical cognitive cohort assessment via 4-qubit Havlíček QSVC.',
      tags: ['Brain MRI', 'OASIS Cohort', '4-Qubit QSVC', 'CDR Risk', 'Saliency Heatmap', 'MMSE'],
      cta: 'Open Neuropredictor',
    },
  ]

  return (
    <div className="home-hero">
      {/* Hero Badge */}
      <div className="hero-badge animate-fade-in-up">
        <Cpu size={13} />
        Quantum + Classical AI · Research Platform
      </div>

      {/* Title */}
      <h1 className="hero-title animate-fade-in-up-delay">
        Quantum-Powered<br />Medical Diagnostics
      </h1>

      {/* Subtitle */}
      <p className="hero-subtitle animate-fade-in-up-delay-2">
        A hybrid quantum-classical AI platform for clinical-grade diagnostics.
        Leveraging PennyLane quantum kernels and deep neural networks to predict
        cancer and coronary heart disease with high confidence.
      </p>

      {/* Module Cards — click opens the page */}
      <div className="module-cards-grid animate-fade-in-up-delay-2">
        {modules.map((mod) => {
          const Icon = mod.Icon
          return (
            <div
              key={mod.to}
              className={`module-card ${mod.colorClass}`}
              onClick={() => navigate(mod.to)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && navigate(mod.to)}
              style={{ cursor: 'pointer' }}
            >
              <div className={`module-card-icon ${mod.colorClass}`}>
                <Icon size={26} />
              </div>
              <h2>{mod.title}</h2>
              <p>{mod.desc}</p>
              <div className="module-card-tags">
                {mod.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
              </div>
              <div className="module-card-cta" style={{ color: mod.ctaColor }}>
                {mod.cta} <ArrowRight size={16} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        {[
          { val: '4–6', lbl: 'Qubits per Model' },
          { val: '3',   lbl: 'Clinical AI Modules' },
          { val: 'QML', lbl: 'Quantum Machine Learning' },
          { val: '3',   lbl: 'Cancer Classes' },
        ].map((s, i) => (
          <div key={i} className="stat-item" style={i > 0 ? { borderLeft: '1px solid var(--border)', paddingLeft: 40 } : {}}>
            <span className="val">{s.val}</span>
            <span className="lbl">{s.lbl}</span>
          </div>
        ))}
      </div>

      {/* Feature Highlights */}
      <div style={{
        marginTop: 64,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: 14,
        width: '100%',
        maxWidth: 860,
      }}>
        {[
          { icon: <Zap size={18} />,      title: 'Quantum Advantage',   desc: 'PennyLane ZZ-Feature Map maps clinical data into Hilbert space for non-linear classification.' },
          { icon: <Shield size={18} />,   title: 'Clinical-Grade Output', desc: 'ROC-AUC metrics, confusion matrices, and ACC/AHA-referenced clinical recommendations.' },
          { icon: <Activity size={18} />, title: 'Real-time Inference',  desc: 'Live FastAPI quantum backend with sub-second response times for patient assessments.' },
          { icon: <Brain size={18} />,    title: 'Deep Learning Fusion', desc: 'ResNet-18 extracts image features fused with 6-qubit variational quantum circuits.' },
        ].map((f, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: 18,
            display: 'flex',
            gap: 14,
            alignItems: 'flex-start',
            transition: 'border-color 0.2s, transform 0.2s',
          }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: 'rgba(37,99,235,0.12)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {f.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
