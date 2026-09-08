import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GlobalNav } from './components/GlobalNav'
import { HomePage } from './pages/HomePage'
import { BreastCancerPage } from './pages/BreastCancerPage'
import { HeartDiseasePage } from './pages/HeartDiseasePage'
import { ResearchBenchmarkingPage } from './pages/ResearchBenchmarkingPage'
import { DatasetIngestionPage } from './pages/DatasetIngestionPage'
import { AlzheimersPage } from './pages/AlzheimersPage'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <GlobalNav />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/breast-cancer/*" element={<BreastCancerPage />} />
            <Route path="/heart-disease/*" element={<HeartDiseasePage />} />
            <Route path="/alzheimers/*" element={<AlzheimersPage />} />
            <Route path="/benchmarks/*" element={<ResearchBenchmarkingPage />} />
            <Route path="/ingestion/*" element={<DatasetIngestionPage />} />
          </Routes>
        </main>
        <footer className="footer">
          <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>⚛️ Quantum Healthcare AI Portal</span>
            <span>Hybrid Quantum-Classical Diagnostic Platform · Breast Cancer · Coronary Heart Disease · Alzheimer's Disease</span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}
