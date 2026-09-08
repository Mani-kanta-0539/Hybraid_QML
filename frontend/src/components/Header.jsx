import React from 'react'

export function Header({ activeModule, activeSubTab, onSelectModule, onSelectSubTab }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand" onClick={() => onSelectModule('home')} style={{ cursor: 'pointer' }}>
          <div className="header-logo">⚛️</div>
          <div>
            <div className="header-title">Quantum Health AI Portal</div>
            <div className="header-subtitle">Advanced Multi-Disease Hybrid Quantum Diagnostics</div>
          </div>
        </div>

        {/* Top Level Suite Switcher */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            className={`nav-tab ${activeModule === 'home' ? 'active' : ''}`}
            onClick={() => onSelectModule('home')}
          >
            🏠 Home Hub
          </button>

          <button
            className={`nav-tab ${activeModule === 'breast' ? 'active' : ''}`}
            onClick={() => {
              onSelectModule('breast')
              if (!activeSubTab.breast) onSelectSubTab('breast', 'scanner')
            }}
          >
            🩺 Breast Cancer AI
          </button>

          <button
            className={`nav-tab ${activeModule === 'heart' ? 'active' : ''}`}
            onClick={() => {
              onSelectModule('heart')
              if (!activeSubTab.heart) onSelectSubTab('heart', 'patient_form')
            }}
          >
            ❤️ Heart Disease QML
          </button>
        </div>
      </div>

      {/* Sub-Navigation Bar for active module */}
      {activeModule === 'breast' && (
        <div style={{ background: '#0a1224', borderTop: '1px solid #1e3a5f', padding: '8px 24px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 12 }}>
            {[
              { id: 'scanner', label: '📷 Ultrasound Image Scanner' },
              { id: 'architecture', label: '⚛️ 6-Qubit Quantum Architecture' },
              { id: 'metrics', label: '📊 Model Performance & Curves' },
              { id: 'about', label: 'ℹ️ Clinical Overview & Rules' },
            ].map(sub => (
              <button
                key={sub.id}
                style={{
                  background: activeSubTab.breast === sub.id ? '#1e3a5f' : 'transparent',
                  color: activeSubTab.breast === sub.id ? '#60a5fa' : '#8facc8',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontSize: '0.85em',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => onSelectSubTab('breast', sub.id)}
              >
                {sub.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeModule === 'heart' && (
        <div style={{ background: '#0a1224', borderTop: '1px solid #1e3a5f', padding: '8px 24px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { id: 'patient_form', label: '🩺 Clinical Patient Assessment' },
              { id: 'batch_upload', label: '📁 CSV Batch Data Uploader' },
              { id: 'architecture', label: '⚛️ ZZ-Feature Map Architecture' },
              { id: 'dataset_explore', label: '📈 Dataset & Metrics Explorer' },
            ].map(sub => (
              <button
                key={sub.id}
                style={{
                  background: activeSubTab.heart === sub.id ? '#1e3a5f' : 'transparent',
                  color: activeSubTab.heart === sub.id ? '#f59e0b' : '#8facc8',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontSize: '0.85em',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => onSelectSubTab('heart', sub.id)}
              >
                {sub.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
