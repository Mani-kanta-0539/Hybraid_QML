import React from 'react'

export function HomePage({ onSelectModule, onSelectSubTab }) {
  return (
    <div style={{ padding: '20px 0' }}>
      {/* Hero Banner */}
      <div className="card" style={{ padding: '40px 32px', textAlign: 'center', marginBottom: 32, background: 'linear-gradient(135deg, #091730 0%, #11264c 100%)', border: '1px solid #1e3a5f' }}>
        <div style={{ display: 'inline-block', background: 'rgba(37, 99, 235, 0.2)', border: '1px solid rgba(37, 99, 235, 0.4)', borderRadius: 20, padding: '4px 16px', fontSize: '0.85em', color: '#60a5fa', fontWeight: 700, marginBottom: 16 }}>
          ⚡ Next-Generation Quantum Medical AI Engine
        </div>
        <h1 style={{ fontSize: '2.4em', fontWeight: 800, color: '#f0f6ff', marginBottom: 14, letterSpacing: '-0.02em' }}>
          Quantum Healthcare Diagnostic Portal
        </h1>
        <p style={{ color: '#8facc8', fontSize: '1.1em', maxWidth: 840, margin: '0 auto 28px', lineHeight: 1.6 }}>
          Combining <b>Quantum Variational Circuits</b> and <b>Quantum Support Vector Classifiers (QSVC)</b> with classical deep neural networks to deliver high-precision clinical decision support for oncology and cardiology.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <span className="badge" style={{ background: '#0f1829', borderColor: '#1e3a5f', color: '#60a5fa' }}>
            ⚛️ PennyLane Quantum Kernels
          </span>
          <span className="badge" style={{ background: '#0f1829', borderColor: '#1e3a5f', color: '#34d399' }}>
            🔬 ResNet-18 + CLAHE Filtering
          </span>
          <span className="badge" style={{ background: '#0f1829', borderColor: '#1e3a5f', color: '#f472b6' }}>
            ⚡ 4 & 6-Qubit Hilbert Space Architectures
          </span>
          <span className="badge" style={{ background: '#0f1829', borderColor: '#1e3a5f', color: '#fbbf24' }}>
            🩺 ACC/AHA & Cleveland Clinical Schema
          </span>
        </div>
      </div>

      {/* Main Suite Selection Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 28 }}>
        {/* Breast Cancer Suite Card */}
        <div className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #1e3a5f', background: 'var(--bg-card)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ width: 52, height: 52, background: 'rgba(239, 68, 68, 0.15)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8em' }}>
                🩺
              </div>
              <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                Ultrasound Image AI
              </span>
            </div>

            <h2 style={{ fontSize: '1.5em', fontWeight: 700, marginBottom: 12, color: '#f0f6ff' }}>
              Breast Cancer Ultrasound Suite
            </h2>
            <p style={{ color: '#8facc8', fontSize: '0.96em', lineHeight: 1.6, marginBottom: 24 }}>
              Multi-subpage diagnostic suite featuring ultrasound image scanning, contrast-limited adaptive histogram equalization (CLAHE), 6-qubit data re-uploading quantum circuit visualization, and per-class validation recall.
            </p>

            <div style={{ background: '#070c16', border: '1px solid #1e3a5f', borderRadius: 10, padding: 16, marginBottom: 24 }}>
              <div style={{ fontSize: '0.85em', color: '#60a5fa', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Suite Sub-Modules:</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.84em', color: '#e2e8f0' }}>
                <div>• 📷 Ultrasound Scanner</div>
                <div>• ⚛️ 6-Qubit Architecture</div>
                <div>• 📊 Training Curves</div>
                <div>• ℹ️ Clinical Guidelines</div>
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
            onClick={() => {
              onSelectModule('breast')
              onSelectSubTab('breast', 'scanner')
            }}
          >
            Launch Breast Cancer Suite ➔
          </button>
        </div>

        {/* Heart Disease Suite Card */}
        <div className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #1e3a5f', background: 'var(--bg-card)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ width: 52, height: 52, background: 'rgba(245, 158, 11, 0.15)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8em' }}>
                ❤️
              </div>
              <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                Cardiovascular QSVC
              </span>
            </div>

            <h2 style={{ fontSize: '1.5em', fontWeight: 700, marginBottom: 12, color: '#f0f6ff' }}>
              Heart Disease QML Suite
            </h2>
            <p style={{ color: '#8facc8', fontSize: '0.96em', lineHeight: 1.6, marginBottom: 24 }}>
              Multi-subpage cardiovascular calculator ported from the Cleveland Heart Study QSVC repository. Evaluates patient risk using 4-qubit Havlíček ZZ-Feature Maps, CSV batch evaluation, and quantum state fidelity matrices.
            </p>

            <div style={{ background: '#070c16', border: '1px solid #1e3a5f', borderRadius: 10, padding: 16, marginBottom: 24 }}>
              <div style={{ fontSize: '0.85em', color: '#f59e0b', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Suite Sub-Modules:</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.84em', color: '#e2e8f0' }}>
                <div>• 🩺 Patient Assessment</div>
                <div>• 📁 CSV Batch Uploader</div>
                <div>• ⚛️ ZZ-Feature Map Circuit</div>
                <div>• 📈 Dataset Explorer</div>
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1em', background: 'linear-gradient(135deg, #d97706, #b45309)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
            onClick={() => {
              onSelectModule('heart')
              onSelectSubTab('heart', 'patient_form')
            }}
          >
            Launch Heart Disease Suite ➔
          </button>
        </div>
      </div>
    </div>
  )
}
