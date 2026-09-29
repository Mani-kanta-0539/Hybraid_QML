import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { GlobalNav } from './components/GlobalNav'
import { HomePage } from './pages/HomePage'
import { BreastCancerPage } from './pages/BreastCancerPage'
import { HeartDiseasePage } from './pages/HeartDiseasePage'
import { ResearchBenchmarkingPage } from './pages/ResearchBenchmarkingPage'
import { DatasetIngestionPage } from './pages/DatasetIngestionPage'
import { AlzheimersPage } from './pages/AlzheimersPage'
import { ErrorBoundary } from './components/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <GlobalNav />
            <main style={{ flex: 1 }}>
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/breast-cancer/*" element={<BreastCancerPage />} />
                  <Route path="/heart-disease/*" element={<HeartDiseasePage />} />
                  <Route path="/alzheimers/*" element={<AlzheimersPage />} />
                  <Route path="/benchmarks/*" element={<ResearchBenchmarkingPage />} />
                  <Route path="/ingestion/*" element={<DatasetIngestionPage />} />
                  {/* Catch-all fallback to avoid white page on unknown routes */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </ErrorBoundary>
            </main>
            <footer className="footer">
              <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontWeight: 800, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '1.05rem' }}>⚛️</span> HealthQure
                </span>
                <span>HealthQure Clinical Diagnostic Platform · Oncology · Cardiology · Neurology · IQM Garnet 20-Qubit QPU</span>
              </div>
            </footer>
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
