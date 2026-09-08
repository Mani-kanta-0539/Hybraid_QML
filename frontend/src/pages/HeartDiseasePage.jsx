import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Activity, Cpu, BarChart3, Database, FileSpreadsheet, RefreshCw,
  CheckCircle2, AlertCircle, ArrowLeft, Heart, Play, Stethoscope,
  Info, User, UserCheck, AlertTriangle, CheckCircle, Layers,
  Compass, ShieldAlert, ShieldCheck, Award, Zap, Search, Filter,
  HeartPulse, Upload, Download, Eye
} from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ReferenceLine
} from 'recharts'
import { QiskitCircuitViewer } from '../components/QiskitCircuitViewer'
import { RecentRunsTable } from '../components/RecentRunsTable'

const API = 'http://127.0.0.1:8000'

/* ── Dynamic Design System Tokens ────────────────────────────── */
const T = {
  bg:        'var(--bg-primary)',
  card:      'var(--bg-card)',
  card2:     'var(--bg-secondary)',
  border:    'var(--border)',
  borderLt:  'var(--border-light)',
  text:      'var(--text-primary)',
  textSec:   'var(--text-secondary)',
  textMuted: 'var(--text-muted)',
  accent:    'var(--accent)',
}

/* ── PCA / Scaler constants ───────────────────────────────────── */
const SCALER_MEAN  = [53.7884, 0.6429, 243.5893, 128.8357, 0.6161, 1.7833]
const SCALER_SCALE = [8.4175,  0.4792,  38.6091,  16.6391,  0.4863, 1.0525]
const PCA_COMPONENTS = [
  [ 0.2620,  0.0222,  0.3297,  0.2472,  0.6073,  0.6263],
  [-0.1726, -0.4704, -0.4681,  0.7270,  0.0202,  0.0288],
  [ 0.2613,  0.7610, -0.5584,  0.1922,  0.0532,  0.0303],
  [ 0.8909, -0.3690, -0.1455, -0.1134, -0.1786, -0.0652],
]
const PCA_VARIANCE = [34.99, 19.89, 16.56, 15.40]
const QUBIT_META = [
  { qubit: 0, name: '|q₀⟩', title: 'Ischemic Stress Axis (PC1)',         driver: 'ST Depression (0.63) + Exercise Angina (0.61)', color: '#818cf8' },
  { qubit: 1, name: '|q₁⟩', title: 'Hemodynamic Load Axis (PC2)',         driver: 'Resting BP (0.73) & Cholesterol (-0.47)',       color: '#38bdf8' },
  { qubit: 2, name: '|q₂⟩', title: 'Endocrine & Lipid Axis (PC3)',        driver: 'Biological Sex (0.76) vs. Cholesterol (-0.56)', color: '#c084fc' },
  { qubit: 3, name: '|q₃⟩', title: 'Chronological Vascular Axis (PC4)',   driver: 'Patient Age (0.89)',                            color: '#fbbf24' },
]

function computeQuantumAngles(input) {
  const vals = [input.age, input.sex, input.cholesterol, input.resting_bp, input.exercise_angina, input.st_depression]
  const scaled = vals.map((v, i) => (v - SCALER_MEAN[i]) / SCALER_SCALE[i])
  return PCA_COMPONENTS.map(pc => {
    const dot = pc.reduce((s, w, i) => s + w * scaled[i], 0)
    return (Math.atan2(Math.sin(dot), Math.cos(dot)) + Math.PI) % Math.PI
  })
}

/* ── Shared squircle card wrapper ────────────────────────────── */
const DCard = ({ children, style = {} }) => (
  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 'var(--radius-xl)', padding: 24, boxShadow: 'var(--shadow-md)', ...style }}>
    {children}
  </div>
)

/* ── Status Badge ─────────────────────────────────────────────── */
function StatusBadge({ status, children }) {
  const map = {
    good:     { bg: 'rgba(16,185,129,0.12)', color: '#34d399', border: 'rgba(16,185,129,0.3)' },
    warn:     { bg: 'rgba(245,158,11,0.12)',  color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
    danger:   { bg: 'rgba(239,68,68,0.12)',   color: '#f87171', border: 'rgba(239,68,68,0.3)' },
    info:     { bg: 'rgba(37,99,235,0.12)',   color: '#93c5fd', border: 'rgba(37,99,235,0.3)' },
    purple:   { bg: 'rgba(168,85,247,0.12)',  color: '#c084fc', border: 'rgba(168,85,247,0.3)' },
  }
  const s = map[status] || map.info
  return (
    <span style={{ fontSize: '0.69rem', fontWeight: 700, padding: '2px 9px', borderRadius: 100, background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  )
}

/* ─── INPUT HELPERS ───────────────────────────────────────────── */
const inputStyle = {
  width: '100%',
  fontFamily: 'JetBrains Mono, monospace',
  fontWeight: 700,
  fontSize: '0.95rem',
  border: `2px solid ${T.border}`,
  borderRadius: 10,
  padding: '9px 48px 9px 12px',
  outline: 'none',
  color: T.text,
  background: T.card2,
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}

const fieldBox = {
  padding: 16,
  background: T.card2,
  borderRadius: 12,
  border: `1px solid ${T.border}`,
}

const fieldLabel = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 10,
}

const numLabel = {
  width: 18, height: 18, borderRadius: '50%',
  background: 'rgba(37,99,235,0.3)', color: '#93c5fd',
  fontSize: '0.65rem', fontWeight: 800,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  marginRight: 6, flexShrink: 0,
}

const labelText = {
  fontSize: '0.76rem', fontWeight: 800, color: T.text,
  display: 'flex', alignItems: 'center',
}

const hintText = { fontSize: '0.69rem', color: T.textMuted, marginTop: 5, lineHeight: 1.5 }

/* ═══════════════════════════════════════════════════════════════
   PATIENT FORM
══════════════════════════════════════════════════════════════ */
function HeartPatientForm({ input, onChange, onSubmit, loading, modelType = 'qsvc', onModelTypeChange }) {
  const PRESETS = [
    { label: 'Low Risk', sub: 'Age 34, F, normal lipids', values: { age: 34, sex: 0, cholesterol: 172, resting_bp: 112, exercise_angina: 0, st_depression: 0.1 } },
    { label: 'Borderline', sub: 'Age 52, M, pre-HTN', values: { age: 52, sex: 1, cholesterol: 226, resting_bp: 128, exercise_angina: 0, st_depression: 0.8 } },
    { label: 'High Risk', sub: 'Age 62, M, angina present', values: { age: 62, sex: 1, cholesterol: 275, resting_bp: 150, exercise_angina: 1, st_depression: 2.5 } },
    { label: 'Acute', sub: 'Age 68, M, ST 3.4 mm', values: { age: 68, sex: 1, cholesterol: 255, resting_bp: 144, exercise_angina: 1, st_depression: 3.4 } },
  ]

  const ageS  = input.age < 45  ? 'good'   : input.age < 60  ? 'warn' : 'danger'
  const cholS = input.cholesterol < 200 ? 'good' : input.cholesterol < 240 ? 'warn' : 'danger'
  const bpS   = input.resting_bp < 120  ? 'good' : input.resting_bp < 130  ? 'warn' : 'danger'
  const angS  = input.exercise_angina === 0 ? 'good' : 'danger'
  const stS   = input.st_depression < 1.0   ? 'good' : input.st_depression < 2.0 ? 'warn' : 'danger'

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <DCard style={{ padding: 20 }}>
        {/* Model Architecture Selector */}
        <div style={{ marginBottom: 16, background: '#0a1220', border: `1px solid ${T.border}`, borderRadius: 12, padding: 14 }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#93c5fd', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Cpu size={15} color="#60a5fa" /> Quantum Model Architecture & Hardware Engine:
          </label>
          <select
            value={modelType}
            onChange={(e) => onModelTypeChange && onModelTypeChange(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: `1px solid ${modelType === 'iqm' ? '#3b82f6' : T.border}`,
              background: T.card2,
              color: T.text,
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          >
            <option value="qsvc">⚡ Havlíček ZZ-Kernel QSVC (4-Qubit Simulator — 16D Hilbert Space)</option>
            <option value="iqm">🌐 Real Quantum Hardware: IQM Garnet 20-Qubit QPU (Transmon PRX/CZ + M3 QEM)</option>
          </select>
          <div style={{ fontSize: '0.70rem', color: T.textMuted, marginTop: 6, lineHeight: 1.4 }}>
            {modelType === 'iqm'
              ? '💡 Real Hardware Execution: Transpiled to native PRX/CZ pulses on IQM Garnet 20-qubit superconducting transmon topology with M3 readout mitigation.'
              : '💡 Simulator Mode: Fast PennyLane statevector simulation with second-order ZZ non-linear feature maps.'}
          </div>
        </div>

        {/* Header */}
        <div style={{ borderBottom: `1px solid ${T.border}`, paddingBottom: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Stethoscope size={17} color="#93c5fd" />
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: T.text }}>Enter Clinical Data Values</span>
            <StatusBadge status="info">6 Biomarkers</StatusBadge>
          </div>
          <p style={{ fontSize: '0.77rem', color: T.textSec, lineHeight: 1.6, margin: 0 }}>
            Enter patient demographics and cardiovascular indicators. Click <strong style={{ color: T.text }}>Run Prediction</strong> to evaluate CAD risk via {modelType === 'iqm' ? 'IQM Garnet QPU' : '4-qubit QSVC'}.
          </p>

          {/* Quick Fill */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: '0.69rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Quick Fill — Sample Values</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {PRESETS.map((p, i) => {
                const colors = ['#2563eb', '#d97706', '#dc2626', '#7c3aed']
                return (
                  <button key={i} type="button" onClick={() => onChange(p.values)}
                    style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: `1px solid ${T.border}`, background: T.card2, cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s', fontFamily: 'inherit' }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = colors[i]; e.currentTarget.style.background = `${colors[i]}18` }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.card2 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: colors[i], marginBottom: 2 }}>{p.label}</div>
                    <div style={{ fontSize: '0.68rem', color: T.textMuted }}>{p.sub}</div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Age & Sex Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* Age */}
          <div style={fieldBox}>
            <div style={fieldLabel}>
              <span style={labelText}><span style={numLabel}>1</span>Patient Age</span>
              <StatusBadge status={ageS}>{input.age < 45 ? '< 45 yrs' : input.age < 60 ? '45–59 yrs' : '≥ 60 yrs'}</StatusBadge>
            </div>
            <div style={{ position: 'relative' }}>
              <input type="number" min="18" max="100" step="1" required placeholder="e.g. 58"
                value={input.age === 0 ? '' : input.age}
                onChange={e => onChange({ age: e.target.value === '' ? 0 : Number(e.target.value) })}
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.2)' }}
                onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none' }}
              />
              <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', fontWeight: 700, color: T.textMuted }}>yrs</span>
            </div>
          </div>

          {/* Sex */}
          <div style={fieldBox}>
            <div style={fieldLabel}>
              <span style={labelText}><span style={numLabel}>2</span>Biological Sex</span>
              <StatusBadge status="info">{input.sex === 1 ? 'Male (1)' : 'Female (0)'}</StatusBadge>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { val: 1, label: 'Male (1)', sub: 'Higher early CAD risk', icon: <User size={12} />, color: '#818cf8' },
                { val: 0, label: 'Female (0)', sub: 'Estrogenic CV protection', icon: <UserCheck size={12} />, color: '#c084fc' },
              ].map(opt => (
                <button key={opt.val} type="button" onClick={() => onChange({ sex: opt.val })}
                  style={{ padding: '9px 8px', borderRadius: 10, border: `2px solid ${input.sex === opt.val ? opt.color : T.border}`, background: input.sex === opt.val ? `${opt.color}18` : T.card2, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', fontFamily: 'inherit' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: opt.color, display: 'flex', alignItems: 'center', gap: 4 }}>{opt.icon}{opt.label}</div>
                  <div style={{ fontSize: '0.64rem', color: T.textMuted, marginTop: 2 }}>{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cholesterol */}
        <div style={{ ...fieldBox, marginTop: 12 }}>
          <div style={fieldLabel}>
            <span style={labelText}><span style={numLabel}>3</span>Serum Cholesterol</span>
            <StatusBadge status={cholS}>{input.cholesterol < 200 ? 'Desirable' : input.cholesterol < 240 ? 'Borderline' : 'High Risk'}</StatusBadge>
          </div>
          <div style={{ position: 'relative' }}>
            <input type="number" min="50" max="600" step="1" required placeholder="e.g. 215"
              value={input.cholesterol === 0 ? '' : input.cholesterol}
              onChange={e => onChange({ cholesterol: e.target.value === '' ? 0 : Number(e.target.value) })}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.2)' }}
              onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none' }}
            />
            <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', fontWeight: 700, color: T.textMuted }}>mg/dL</span>
          </div>
          <div style={hintText}>Desirable &lt;200 · Borderline 200–239 · High Risk ≥240</div>
        </div>

        {/* Blood Pressure */}
        <div style={{ ...fieldBox, marginTop: 12 }}>
          <div style={fieldLabel}>
            <span style={labelText}><span style={numLabel}>4</span>Resting Blood Pressure</span>
            <StatusBadge status={bpS}>{input.resting_bp < 120 ? 'Normal' : input.resting_bp < 130 ? 'Elevated' : 'Hypertensive'}</StatusBadge>
          </div>
          <div style={{ position: 'relative' }}>
            <input type="number" min="50" max="300" step="1" required placeholder="e.g. 125"
              value={input.resting_bp === 0 ? '' : input.resting_bp}
              onChange={e => onChange({ resting_bp: e.target.value === '' ? 0 : Number(e.target.value) })}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.2)' }}
              onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none' }}
            />
            <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', fontWeight: 700, color: T.textMuted }}>mm Hg</span>
          </div>
          <div style={hintText}>Normal &lt;120 · Elevated 120–129 · Hypertensive ≥130</div>
        </div>

        {/* Exercise Angina */}
        <div style={{ ...fieldBox, marginTop: 12 }}>
          <div style={fieldLabel}>
            <span style={labelText}><span style={numLabel}>5</span>Exercise-Induced Angina</span>
            <StatusBadge status={angS}>{input.exercise_angina === 0 ? 'No Angina' : 'Angina Present'}</StatusBadge>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { val: 0, label: '0 — No Angina', sub: 'No chest pain during exertion', color: '#34d399', dangerColor: false },
              { val: 1, label: '1 — Angina Present', sub: 'Ischemic chest pain on exertion', color: '#f87171', dangerColor: true },
            ].map(opt => (
              <button key={opt.val} type="button" onClick={() => onChange({ exercise_angina: opt.val })}
                style={{ padding: '12px 14px', borderRadius: 12, border: `2px solid ${input.exercise_angina === opt.val ? opt.color : T.border}`, background: input.exercise_angina === opt.val ? `${opt.color}18` : T.card2, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', fontFamily: 'inherit' }}>
                <div style={{ fontSize: '0.77rem', fontWeight: 700, color: opt.color }}>{opt.label}</div>
                <div style={{ fontSize: '0.67rem', color: T.textMuted, marginTop: 4, lineHeight: 1.4 }}>{opt.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ST Depression */}
        <div style={{ ...fieldBox, marginTop: 12 }}>
          <div style={fieldLabel}>
            <span style={labelText}><span style={numLabel}>6</span>ST Depression (Oldpeak)</span>
            <StatusBadge status={stS}>{input.st_depression < 1.0 ? 'Normal' : input.st_depression < 2.0 ? 'Borderline' : 'Ischemia'}</StatusBadge>
          </div>
          <div style={{ position: 'relative' }}>
            <input type="number" min="0" max="10" step="0.1" required placeholder="e.g. 1.2"
              value={input.st_depression === 0 && input.st_depression !== 0 ? '' : input.st_depression}
              onChange={e => onChange({ st_depression: e.target.value === '' ? 0 : Number(e.target.value) })}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.2)' }}
              onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none' }}
            />
            <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', fontWeight: 700, color: T.textMuted }}>mm</span>
          </div>
          <div style={hintText}>Normal &lt;1.0 mm · Borderline 1.0–1.9 mm · Significant Ischemia ≥2.0 mm</div>
        </div>

        {/* Summary Box */}
        <div style={{ marginTop: 14, background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: 12, padding: 14 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#93c5fd', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Info size={13} /> Clinical Values Summary
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              ['Age', `${input.age} yrs`], ['Sex', input.sex === 1 ? 'Male (1)' : 'Female (0)'],
              ['Cholesterol', `${input.cholesterol} mg/dL`], ['Blood Pressure', `${input.resting_bp} mm Hg`],
              ['Angina', `Value ${input.exercise_angina}`], ['ST Depression', `${(input.st_depression || 0).toFixed(1)} mm`],
            ].map(([k, v], i) => (
              <div key={i} style={{ background: T.card2, borderRadius: 8, border: `1px solid ${T.border}`, padding: '6px 10px' }}>
                <div style={{ fontSize: '0.63rem', color: T.textMuted }}>{k}</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: T.text, fontFamily: 'JetBrains Mono, monospace' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading}
          style={{ marginTop: 16, width: '100%', padding: '15px 24px', background: loading ? 'rgba(37,99,235,0.5)' : 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', border: 'none', color: '#fff', borderRadius: 14, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontFamily: 'inherit', boxShadow: loading ? 'none' : '0 4px 20px rgba(37,99,235,0.4)', transition: 'all 0.2s' }}>
          {loading ? (
            <>
              <span style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'block' }} />
              <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                {modelType === 'iqm' ? 'TRANSPILING & SUBMITTING TO IQM QPU...' : 'COMPUTING QUANTUM PREDICTION...'}
              </span>
            </>
          ) : (
            <>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Play size={18} color="white" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                  {modelType === 'iqm' ? 'RUN ON IQM GARNET QPU' : 'RUN QUANTUM PREDICTION'}
                </div>
                <div style={{ fontSize: '0.69rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                  {modelType === 'iqm' ? '20-Qubit Transmon PRX/CZ · M3 Mitigation · Espoo, Finland' : '4-Qubit QSVC · ZZ-Feature Map · CAD Risk Assessment'}
                </div>
              </div>
            </>
          )}
        </button>
      </DCard>
    </form>
  )
}

/* ═══════════════════════════════════════════════════════════════
   RESULT CARD
══════════════════════════════════════════════════════════════ */
function HeartResultCard({ result, patientInput }) {
  if (!result) {
    return (
      <DCard style={{ padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(37,99,235,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Heart size={26} color="#60a5fa" />
        </div>
        <p style={{ fontSize: '0.85rem', color: T.textMuted, textAlign: 'center', maxWidth: 260 }}>
          Enter clinical values and click <strong style={{ color: T.textSec }}>Run Prediction</strong> to evaluate Coronary Artery Disease risk.
        </p>
      </DCard>
    )
  }

  const isPos = result.prediction === 1 || result.cad_status === 'POSITIVE'
  const probPct = ((result.chd_probability || 0) * 100).toFixed(1)
  const cadLabel = result.cad_diagnosis || (isPos ? 'CAD Positive' : 'CAD Negative')
  const riskLvl  = result.risk_level || (isPos ? 'HIGH' : 'LOW')
  const mainColor = isPos ? '#f87171' : '#34d399'
  const iconBg    = isPos ? 'rgba(239,68,68,0.15)'  : 'rgba(16,185,129,0.15)'

  const pi = patientInput || {}
  const stats = [
    { label: 'Age', val: `${pi.age} yrs`, ref: '< 45 yrs', s: pi.age >= 60 ? 'danger' : pi.age >= 45 ? 'warn' : 'good' },
    { label: 'Sex', val: pi.sex === 1 ? 'Male (1)' : 'Female (0)', ref: '1=M 0=F', s: 'info' },
    { label: 'Cholesterol', val: `${pi.cholesterol} mg/dL`, ref: '< 200 mg/dL', s: pi.cholesterol >= 240 ? 'danger' : pi.cholesterol >= 200 ? 'warn' : 'good' },
    { label: 'Resting BP', val: `${pi.resting_bp} mm Hg`, ref: '< 120 mm Hg', s: pi.resting_bp >= 130 ? 'danger' : pi.resting_bp >= 120 ? 'warn' : 'good' },
    { label: 'Angina', val: pi.exercise_angina === 1 ? '1: Present' : '0: Absent', ref: 'Absent (0)', s: pi.exercise_angina === 1 ? 'danger' : 'good' },
    { label: 'ST Depression', val: `${(pi.st_depression || 0).toFixed(1)} mm`, ref: '< 1.0 mm', s: pi.st_depression >= 2.0 ? 'danger' : pi.st_depression >= 1.0 ? 'warn' : 'good' },
  ]

  return (
    <DCard style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Primary Banner */}
      <div style={{ background: iconBg, border: `1px solid ${mainColor}40`, borderRadius: 14, padding: 18, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: iconBg, border: `1px solid ${mainColor}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {isPos ? <AlertTriangle size={28} color={mainColor} /> : <CheckCircle size={28} color={mainColor} />}
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.textMuted, marginBottom: 3 }}>
              Quantum QSVC Diagnosis · <span style={{ color: mainColor }}>{riskLvl} Risk</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: mainColor, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{cadLabel}</div>
            <div style={{ fontSize: '0.75rem', color: T.textSec, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              {isPos ? <ShieldAlert size={13} color={mainColor} /> : <ShieldCheck size={13} color={mainColor} />}
              {isPos ? 'CAD detected — Ischemic markers exceed clinical threshold.' : 'CAD Ruled Out — Biomarkers within healthy reference range.'}
            </div>
          </div>
        </div>
        <div style={{ background: T.card2, borderRadius: 12, padding: '10px 16px', textAlign: 'right', border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: '0.7rem', color: T.textMuted, fontWeight: 600 }}>CHD Probability</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: mainColor, fontFamily: 'JetBrains Mono, monospace' }}>{probPct}%</div>
          <div style={{ fontSize: '0.66rem', color: T.textMuted, fontFamily: 'JetBrains Mono, monospace' }}>
            Margin: {result.decision_margin > 0 ? `+${(result.decision_margin||0).toFixed(3)}` : (result.decision_margin||0).toFixed(3)}
          </div>
        </div>
      </div>

      {/* Clinical Table */}
      <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', background: T.card2, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={14} color="#93c5fd" />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: T.text }}>Clinical Values vs. Reference Standards</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
          <thead>
            <tr style={{ background: T.card2 }}>
              {['Parameter', 'Your Value', 'Reference', 'Status'].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: T.textMuted, borderBottom: `1px solid ${T.border}`, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stats.map((s, i) => (
              <tr key={i} style={{ borderBottom: i < stats.length - 1 ? `1px solid ${T.border}` : 'none', background: s.s === 'danger' ? 'rgba(239,68,68,0.04)' : 'transparent' }}>
                <td style={{ padding: '8px 12px', fontWeight: 600, color: T.text }}>{s.label}</td>
                <td style={{ padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: T.text }}>{s.val}</td>
                <td style={{ padding: '8px 12px', color: T.textMuted }}>{s.ref}</td>
                <td style={{ padding: '8px 12px' }}><StatusBadge status={s.s}>{s.s === 'good' ? '✓ Normal' : s.s === 'warn' ? '⚠ Elevated' : s.s === 'danger' ? '✗ High Risk' : '— Info'}</StatusBadge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Probability Gradient Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.77rem', fontWeight: 600, color: T.textSec, marginBottom: 6 }}>
          <span>Ischemia Likelihood Gradient</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', color: mainColor, fontWeight: 800 }}>{probPct}%</span>
        </div>
        <div style={{ height: 10, background: T.card2, borderRadius: 5, overflow: 'hidden', border: `1px solid ${T.border}` }}>
          <div style={{ height: '100%', width: `${Math.max(3, Math.min(99, Number(probPct)))}%`, background: isPos ? 'linear-gradient(90deg,#f59e0b,#ef4444)' : 'linear-gradient(90deg,#10b981,#34d399)', borderRadius: 5, transition: 'width 0.8s cubic-bezier(.4,0,.2,1)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.64rem', color: T.textMuted, marginTop: 4 }}>
          <span>0% Negligible</span><span>50% Equivocal</span><span>100% Confirmed</span>
        </div>
      </div>

      {/* Qubit Angles */}
      {result.quantum_encoding?.qubit_mapping && (
        <div>
          <div style={{ fontSize: '0.77rem', fontWeight: 700, color: T.textSec, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 7 }}>
            <Compass size={14} color="#818cf8" /> 4-Qubit State Space Angles [θ₀–θ₃]
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {result.quantum_encoding.qubit_mapping.map(qm => {
              const pct = ((qm.angle_rad / Math.PI) * 100).toFixed(0)
              const qColor = QUBIT_META[qm.qubit]?.color || '#818cf8'
              return (
                <div key={qm.qubit} style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 10, padding: 10 }}>
                  <div style={{ fontSize: '0.73rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: qColor, marginBottom: 4 }}>|q_{qm.qubit}⟩</div>
                  <div style={{ fontSize: '0.67rem', color: T.textMuted, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{qm.feature}</div>
                  <div style={{ height: 4, background: T.border, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: qColor, borderRadius: 2, transition: 'width 0.6s ease' }} />
                  </div>
                  <div style={{ fontSize: '0.65rem', color: T.textMuted, fontFamily: 'JetBrains Mono, monospace', marginTop: 4 }}>{qm.angle_rad.toFixed(3)} rad</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Clinical Interpretation */}
      {result.clinical_interpretation && (
        <div style={{ background: 'rgba(37,99,235,0.07)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 12, padding: 14, display: 'flex', gap: 10, fontSize: '0.8rem', color: T.textSec, lineHeight: 1.6 }}>
          <Info size={16} color="#93c5fd" style={{ flexShrink: 0, marginTop: 2 }} />
          <div><strong style={{ color: T.text }}>Interpretation: </strong>{result.clinical_interpretation}</div>
        </div>
      )}

      {/* Real Hardware Telemetry with M3 QEM */}
      {result.hardware_telemetry && (
        <div style={{ background: '#070c18', border: '1px solid #3b82f640', borderRadius: 10, padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Cpu size={14} /> Real Hardware Telemetry: {result.hardware_telemetry.backend}
            </span>
            <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: 4, background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)', fontWeight: 700 }}>
              M3 QEM Active
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 6, fontSize: '0.72rem', color: T.textSec, marginBottom: 6 }}>
            <div>Job ID: <b style={{ color: '#f1f5f9' }}>{(result.hardware_telemetry.job_id || '').slice(0, 8)}...</b></div>
            <div>Qubits: <b style={{ color: '#f1f5f9' }}>{result.hardware_telemetry.qubits_used} Transmons</b></div>
            <div>Shots: <b style={{ color: '#f1f5f9' }}>{result.hardware_telemetry.shots}</b></div>
            <div>QPU Latency: <b style={{ color: '#60a5fa' }}>{result.hardware_telemetry.physical_latency_ms} ms</b></div>
          </div>
          <div style={{ fontSize: '0.70rem', color: '#94a3b8', fontStyle: 'italic', borderTop: '1px dashed #1e3a5f', paddingTop: 4 }}>
            📡 {result.hardware_telemetry.status_note}
          </div>
        </div>
      )}
    </DCard>
  )
}

/* ═══════════════════════════════════════════════════════════════
   METRICS VIEW
══════════════════════════════════════════════════════════════ */
function HeartMetricsView({ metrics, onRetrain, isTraining }) {
  if (!metrics) return (
    <DCard style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 36, height: 36, border: `3px solid ${T.border}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: T.textMuted, fontSize: '0.85rem' }}>Loading model metrics from backend...</p>
    </DCard>
  )

  const cm = metrics.confusion_matrix || [[0,0],[0,0]]
  const [tn, fp, fn, tp] = [cm[0]?.[0]??0, cm[0]?.[1]??0, cm[1]?.[0]??0, cm[1]?.[1]??0]
  const precision   = (tp+fp > 0 ? tp/(tp+fp) : 0).toFixed(3)
  const recall      = (tp+fn > 0 ? tp/(tp+fn) : 0).toFixed(3)
  const specificity = (tn+fp > 0 ? tn/(tn+fp) : 0).toFixed(3)
  const rocData = (metrics.roc_curve || []).map(p => ({ fpr: p.fpr, tpr: p.tpr }))

  const topMetrics = [
    { label: 'ROC-AUC SCORE', val: metrics.roc_auc.toFixed(3), icon: <Award size={15} color="#818cf8" />, color: '#818cf8', sub: 'Discrimination power' },
    { label: 'TEST ACCURACY', val: `${(metrics.accuracy*100).toFixed(1)}%`, icon: <ShieldCheck size={15} color="#34d399" />, color: '#34d399', sub: 'Stratified split' },
    { label: 'F1-SCORE',      val: metrics.f1_score.toFixed(3), icon: <Zap size={15} color="#fbbf24" />, color: '#fbbf24', sub: 'Harmonic P/R mean' },
    { label: 'SUPPORT VECTORS', val: metrics.n_support_vectors, icon: <Layers size={15} color="#c084fc" />, color: '#c084fc', sub: 'Quantum boundary pts' },
  ]

  const cmCells = [
    { label: 'True Negative (TN)', val: tn, sub: 'Correctly low-risk', color: '#34d399', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
    { label: 'False Positive (FP)', val: fp, sub: 'Type I error', color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
    { label: 'False Negative (FN)', val: fn, sub: 'Type II error', color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
    { label: 'True Positive (TP)', val: tp, sub: 'Confirmed CHD', color: '#818cf8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.3)' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
        {topMetrics.map((m, i) => (
          <DCard key={i} style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem', fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              {m.label}{m.icon}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: m.color, fontFamily: 'JetBrains Mono, monospace' }}>{m.val}</div>
            <div style={{ fontSize: '0.7rem', color: T.textMuted, fontWeight: 600, marginTop: 4 }}>{m.sub}</div>
          </DCard>
        ))}
      </div>

      {/* ROC + Confusion */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 22 }}>
        {/* ROC */}
        <DCard style={{ padding: 22 }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: T.text, margin: '0 0 4px' }}>ROC Evaluation Curve</h3>
          <p style={{ fontSize: '0.73rem', color: T.textMuted, marginBottom: 18 }}>TPR vs. FPR · AUC = {metrics.roc_auc.toFixed(3)}</p>
          {rocData.length > 0 ? (
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rocData} margin={{ top: 5, right: 18, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                  <XAxis dataKey="fpr" type="number" domain={[0,1]} tickCount={6} tick={{ fontSize: 10, fill: T.textMuted }} />
                  <YAxis dataKey="tpr" type="number" domain={[0,1]} tickCount={6} tick={{ fontSize: 10, fill: T.textMuted }} />
                  <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, color: T.text, fontSize: '0.72rem' }}
                    content={({ payload }) => payload?.[0] ? (
                      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: '6px 10px', fontFamily: 'monospace', fontSize: '0.72rem', color: T.text }}>
                        <div>FPR: {payload[0].payload.fpr.toFixed(3)}</div>
                        <div>TPR: {payload[0].payload.tpr.toFixed(3)}</div>
                      </div>
                    ) : null} />
                  <ReferenceLine stroke={T.border} strokeDasharray="4 4" segment={[{x:0,y:0},{x:1,y:1}]} />
                  <Line type="monotone" dataKey="tpr" stroke="#818cf8" strokeWidth={2.5} dot={{ r: 2, fill: '#818cf8' }} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textMuted, fontSize: '0.85rem' }}>No ROC data yet.</div>
          )}
        </DCard>

        {/* Confusion Matrix */}
        <DCard style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: T.text, margin: '0 0 4px' }}>Confusion Matrix</h3>
            <p style={{ fontSize: '0.73rem', color: T.textMuted, margin: 0 }}>Predicted vs. Actual CHD Classification</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {cmCells.map((c, i) => (
              <div key={i} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: c.color, marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: c.color, fontFamily: 'JetBrains Mono, monospace', margin: '4px 0' }}>{c.val}</div>
                <div style={{ fontSize: '0.64rem', color: T.textMuted }}>{c.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, borderTop: `1px solid ${T.border}`, paddingTop: 12, textAlign: 'center' }}>
            {[['Precision (PPV)', precision, '#34d399'], ['Sensitivity', recall, '#fbbf24'], ['Specificity', specificity, '#c084fc']].map(([k, v, c]) => (
              <div key={k}>
                <div style={{ fontSize: '0.67rem', color: T.textMuted }}>{k}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: c, fontSize: '0.92rem', marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
          {onRetrain && (
            <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.73rem', color: T.textMuted }}>Refresh model optimization?</span>
              <button onClick={onRetrain} disabled={isTraining}
                style={{ padding: '6px 14px', fontSize: '0.75rem', fontWeight: 700, color: '#93c5fd', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', opacity: isTraining ? 0.6 : 1 }}>
                {isTraining ? 'Computing...' : 'Retrain QSVC'}
              </button>
            </div>
          )}
        </DCard>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   DATASET VIEW
══════════════════════════════════════════════════════════════ */
function HeartDatasetView({ dataset }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const records = dataset?.sample_records || []
  const total = dataset?.total_records || records.length
  const pos   = dataset?.positive_count || records.filter(r => r.chd_risk === 1).length
  const neg   = dataset?.negative_count || records.filter(r => r.chd_risk === 0).length

  const filtered = records.filter(r => {
    if (filter === 'high' && r.chd_risk !== 1) return false
    if (filter === 'low'  && r.chd_risk !== 0) return false
    if (search) {
      const s = search.toLowerCase()
      return `${r.cholesterol}${r.resting_bp}${r.st_depression}`.includes(s)
    }
    return true
  })

  return (
    <DCard style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, borderBottom: `1px solid ${T.border}`, paddingBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Database size={17} color="#818cf8" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: T.text, margin: 0 }}>Coronary Heart Disease Clinical Dataset</h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: T.textMuted, margin: 0 }}>Cleveland & Framingham Heart Study cardiovascular indicators</p>
        </div>
        <div style={{ display: 'flex', gap: 10, fontSize: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { label: `Total: ${total}`, color: T.textSec, bg: T.card2, border: T.border },
            { label: `CAD+: ${pos}`, color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
            { label: `CAD−: ${neg}`, color: '#34d399', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
          ].map((b, i) => (
            <span key={i} style={{ padding: '5px 12px', borderRadius: 8, background: b.bg, border: `1px solid ${b.border}`, color: b.color, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{b.label}</span>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} color={T.textMuted} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input type="text" placeholder="Search records..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: 32, paddingRight: 10, paddingTop: 7, paddingBottom: 7, fontSize: '0.78rem', border: `1px solid ${T.border}`, borderRadius: 10, outline: 'none', color: T.text, background: T.card2, fontFamily: 'inherit', boxSizing: 'border-box' }} />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: '7px 10px', fontSize: '0.75rem', color: T.textSec, outline: 'none', fontFamily: 'inherit', background: T.card2 }}>
          <option value="all">All Patients</option>
          <option value="high">CAD Positive</option>
          <option value="low">CAD Negative</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: T.textMuted, fontSize: '0.85rem' }}>No dataset loaded. Start the backend to fetch clinical cohort data.</div>
      ) : (
        <div style={{ overflowX: 'auto', border: `1px solid ${T.border}`, borderRadius: 10 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ background: T.card2 }}>
                {['#', 'Age', 'Sex', 'Cholesterol', 'Resting BP', 'Angina', 'ST Depression', 'Diagnosis'].map(h => (
                  <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontWeight: 600, color: T.textMuted, borderBottom: `1px solid ${T.border}`, fontSize: '0.71rem', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 15).map((r, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${T.border}`, transition: 'background 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '8px 12px', color: T.textMuted, fontFamily: 'monospace' }}>#{(i+1).toString().padStart(3,'0')}</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: T.text }}>{r.age ? Math.round(r.age) : '—'}</td>
                  <td style={{ padding: '8px 12px' }}>
                    <StatusBadge status={r.sex === 1 ? 'info' : 'purple'}>{r.sex === 1 ? 'M (1)' : r.sex === 0 ? 'F (0)' : '—'}</StatusBadge>
                  </td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: T.text }}>{r.cholesterol} <span style={{ color: T.textMuted, fontSize: '0.67rem' }}>mg/dL</span></td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: T.text }}>{r.resting_bp} <span style={{ color: T.textMuted, fontSize: '0.67rem' }}>mmHg</span></td>
                  <td style={{ padding: '8px 12px' }}>
                    {r.exercise_angina === 1
                      ? <StatusBadge status="danger">Yes</StatusBadge>
                      : <StatusBadge status="good">No</StatusBadge>}
                  </td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: T.text }}>{r.st_depression.toFixed(2)} mm</td>
                  <td style={{ padding: '8px 12px' }}>
                    {r.chd_risk === 1
                      ? <StatusBadge status="danger">CAD Positive</StatusBadge>
                      : <StatusBadge status="good">CAD Negative</StatusBadge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ fontSize: '0.68rem', color: T.textMuted, display: 'flex', justifyContent: 'space-between' }}>
        <span>Showing {Math.min(15, filtered.length)} of {filtered.length} records</span>
        <span>Standardized via StandardScaler + PCA (4 components)</span>
      </div>
    </DCard>
  )
}

/* ═══════════════════════════════════════════════════════════════
   BATCH UPLOADER
══════════════════════════════════════════════════════════════ */
const SAMPLE_CSV = `patient_id,patient_name,cholesterol,resting_bp,exercise_angina,st_depression
PT-01,Johnathan Davis,285,152,1,2.8
PT-02,Eleanor Vance,175,114,0,0.2
PT-03,Marcus Sterling,240,138,1,1.9
PT-04,Clara Henderson,188,118,0,0.1
PT-05,Arthur Pendelton,310,165,1,3.6
PT-06,Sophia Martinez,210,124,0,0.5`

function BatchUploader() {
  const [dragActive, setDragActive] = useState(false)
  const [fileName, setFileName] = useState(null)
  const [parsedPatients, setParsedPatients] = useState([])
  const [batchResults, setBatchResults] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const fileRef = useRef()

  const parseCSV = (text, name) => {
    setError(null); setBatchResults(null)
    const lines = text.trim().split(/\r\n|\n/)
    if (lines.length < 2) { setError('File needs a header and at least one row.'); return }
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const cholIdx   = headers.findIndex(h => h.includes('chol') || h.includes('serum'))
    const bpIdx     = headers.findIndex(h => h.includes('bp') || h.includes('blood') || h.includes('press'))
    const anginaIdx = headers.findIndex(h => h.includes('angina') || h.includes('exang'))
    const stIdx     = headers.findIndex(h => h.includes('st') || h.includes('depression') || h.includes('oldpeak'))
    const idIdx     = headers.findIndex(h => h.includes('id'))
    const nameIdx   = headers.findIndex(h => h.includes('name'))
    if ([cholIdx, bpIdx, anginaIdx, stIdx].includes(-1)) { setError('Missing required columns: Cholesterol, BP, Angina, ST Depression.'); return }
    const patients = []
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue
      const cols = lines[i].split(',').map(c => c.trim().replace(/['"]+/g, ''))
      const angina = ['1','yes','true','positive'].includes(cols[anginaIdx]?.toLowerCase()) ? 1 : 0
      const chol = parseFloat(cols[cholIdx]), bp = parseFloat(cols[bpIdx]), st = parseFloat(cols[stIdx])
      if (isNaN(chol) || isNaN(bp) || isNaN(st)) continue
      patients.push({ id: idIdx !== -1 && cols[idIdx] ? cols[idIdx] : `PT-${i.toString().padStart(3,'0')}`, name: nameIdx !== -1 && cols[nameIdx] ? cols[nameIdx] : `Patient #${i}`, cholesterol: chol, resting_bp: bp, exercise_angina: angina, st_depression: st })
    }
    if (!patients.length) { setError('No valid patient records found.'); return }
    setFileName(name); setParsedPatients(patients)
  }

  const handleFile = f => {
    const reader = new FileReader()
    reader.onload = e => parseCSV(e.target.result, f.name)
    reader.readAsText(f)
  }

  const runBatch = async () => {
    setIsProcessing(true); setBatchResults(null)
    try {
      const results = await Promise.all(
        parsedPatients.map(async p => {
          const res = await axios.post(`${API}/predict/heart`, { age: 54, sex: 1, cholesterol: p.cholesterol, resting_bp: p.resting_bp, exercise_angina: p.exercise_angina, st_depression: p.st_depression })
          return { ...p, result: res.data }
        })
      )
      setBatchResults(results)
    } catch { setError('Batch inference failed. Check backend.') }
    finally { setIsProcessing(false) }
  }

  const downloadCSV = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'cad_sample.csv'; a.click()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <DCard style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <FileSpreadsheet size={17} color="#818cf8" />
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: T.text, margin: 0 }}>Batch Cohort CSV/JSON Classification</h2>
        </div>
        <p style={{ fontSize: '0.78rem', color: T.textSec, marginBottom: 20, lineHeight: 1.6 }}>
          Upload a CSV or JSON file with multiple patient records for automated batch QSVC quantum inference.
        </p>

        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '10px 14px', borderRadius: 10, fontSize: '0.8rem', marginBottom: 16 }}>⚠️ {error}</div>}

        {/* Dropzone */}
        <div
          onDragEnter={() => setDragActive(true)} onDragLeave={() => setDragActive(false)}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]) }}
          onClick={() => fileRef.current.click()}
          style={{ border: `2px dashed ${dragActive ? '#818cf8' : T.border}`, borderRadius: 14, padding: '40px 20px', textAlign: 'center', cursor: 'pointer', background: dragActive ? 'rgba(129,140,248,0.07)' : T.card2, transition: 'all 0.2s' }}>
          <input ref={fileRef} type="file" accept=".csv,.json" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
          <Upload size={30} color={dragActive ? '#818cf8' : T.textMuted} style={{ margin: '0 auto 12px', display: 'block' }} />
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: T.textSec, marginBottom: 4 }}>Drop CSV or JSON file here</div>
          <div style={{ fontSize: '0.73rem', color: T.textMuted }}>or click to browse · Required: cholesterol, resting_bp, angina, st_depression</div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
          <button onClick={() => parseCSV(SAMPLE_CSV, 'demo_cohort.csv')}
            style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(129,140,248,0.3)', background: 'rgba(129,140,248,0.1)', color: '#a5b4fc', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            ⚡ Load Demo Cohort (6 Patients)
          </button>
          <button onClick={downloadCSV}
            style={{ padding: '8px 16px', borderRadius: 10, border: `1px solid ${T.border}`, background: T.card2, color: T.textSec, fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={13} /> Download Sample CSV
          </button>
        </div>
      </DCard>

      {parsedPatients.length > 0 && (
        <DCard style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Eye size={15} color="#818cf8" />
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: T.text, margin: 0 }}>
                {parsedPatients.length} Patients · <em style={{ color: '#a5b4fc', fontStyle: 'normal' }}>{fileName}</em>
              </h3>
            </div>
            <button onClick={runBatch} disabled={isProcessing}
              style={{ padding: '9px 20px', borderRadius: 10, background: isProcessing ? 'rgba(37,99,235,0.4)' : 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', fontWeight: 700, fontSize: '0.8rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8, opacity: isProcessing ? 0.7 : 1 }}>
              {isProcessing ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'block' }} />Computing Kernels...</> : <><Cpu size={14} />Run Batch QSVC</>}
            </button>
          </div>

          <div style={{ overflowX: 'auto', border: `1px solid ${T.border}`, borderRadius: 10 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: T.card2 }}>
                  {['Patient ID', 'Name', 'Cholesterol', 'Resting BP', 'Angina', 'ST Dep.', ...(batchResults ? ['CAD Risk %', 'Status'] : [])].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: T.textMuted, borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap', fontSize: '0.71rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedPatients.map((p, i) => {
                  const res = batchResults?.[i]?.result
                  const riskPct = res?.risk_percentage
                  const riskLvl = res?.risk_level
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: T.textMuted }}>{p.id}</td>
                      <td style={{ padding: '8px 12px', color: T.text, fontWeight: 600 }}>{p.name}</td>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: T.text }}>{p.cholesterol}</td>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: T.text }}>{p.resting_bp}</td>
                      <td style={{ padding: '8px 12px' }}>{p.exercise_angina === 1 ? <StatusBadge status="danger">Yes</StatusBadge> : <StatusBadge status="good">No</StatusBadge>}</td>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: T.text }}>{p.st_depression}</td>
                      {batchResults && <>
                        <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 800, color: riskLvl === 'HIGH' ? '#f87171' : riskLvl === 'MODERATE' ? '#fbbf24' : '#34d399' }}>{riskPct !== undefined ? `${riskPct}%` : '—'}</td>
                        <td style={{ padding: '8px 12px' }}>{riskLvl && <StatusBadge status={riskLvl === 'HIGH' ? 'danger' : riskLvl === 'MODERATE' ? 'warn' : 'good'}>{riskLvl}</StatusBadge>}</td>
                      </>}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {batchResults && (
            <div style={{ marginTop: 14, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: '0.8rem', color: '#34d399', fontWeight: 600 }}>
              ✓ Batch complete! {batchResults.filter(r => r.result?.risk_level === 'HIGH').length} high-risk patient(s) identified out of {batchResults.length}.
            </div>
          )}
        </DCard>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CIRCUITS VIEW
══════════════════════════════════════════════════════════════ */
function CircuitsView({ patientInput }) {
  const angles = useMemo(() => computeQuantumAngles(patientInput), [patientInput])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Qubit Axes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
        {QUBIT_META.map((q, i) => {
          const angle = angles[i]
          const pct = ((angle / Math.PI) * 100).toFixed(0)
          return (
            <DCard key={q.qubit} style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${q.color}18`, border: `1px solid ${q.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, fontSize: '0.82rem', color: q.color }}>{q.name}</div>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: T.text }}>{q.title}</div>
                  <div style={{ fontSize: '0.67rem', color: T.textMuted }}>PC {i+1} · Variance: {PCA_VARIANCE[i]}%</div>
                </div>
              </div>
              <div style={{ fontSize: '0.7rem', color: T.textSec, marginBottom: 12, lineHeight: 1.5 }}>
                <strong style={{ color: T.textSec }}>Driver: </strong>{q.driver}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 4 }}>
                <span style={{ color: T.textMuted }}>Rotation Angle θ</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: q.color }}>{angle.toFixed(4)} rad ({((angle / Math.PI) * 180).toFixed(1)}°)</span>
              </div>
              <div style={{ height: 6, background: T.border, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: q.color, borderRadius: 3, transition: 'width 0.6s ease' }} />
              </div>
            </DCard>
          )
        })}
      </div>

      {/* Circuit Schematic */}
      <QiskitCircuitViewer
        title="Havlíček ZZ-Feature Map Circuit — 4-Qubit Quantum Kernel"
        subtitle="Code-accurate Qiskit diagram showing second-order non-linear ZZ phase entanglement and depth-2 expansions"
        imageSrc="/circuits/heart_disease_qsvc_circuit.png"
        qiskitCode={`# 4-Qubit Havlíček ZZ-Feature Map Quantum Kernel
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit.circuit import ParameterVector, Parameter

qr = QuantumRegister(4, name="q")
cr = ClassicalRegister(4, name="kernel_eval")
qc = QuantumCircuit(qr, cr)

# 4 Clinical Biomarker Components (PCA)
x = ParameterVector("x", 4)

# 1. Hadamard Initialization Layer
for i in range(4):
    qc.h(qr[i])
qc.barrier(label="1st-Order Phase")

# 2. 1st-Order Phase Encoding: Rz(2x_i)
for i in range(4):
    qc.rz(2 * x[i], qr[i])
qc.barrier(label="2nd-Order ZZ Entanglement")

# 3. 2nd-Order Cross-Entanglement: CX -> Rz -> CX
pairs = [(0, 1), (1, 2), (2, 3), (0, 3), (0, 2), (1, 3)]
for i, j in pairs:
    qc.cx(qr[i], qr[j])
    qc.rz(Parameter(f"2(π-x_{i})(π-x_{j})"), qr[j])
    qc.cx(qr[i], qr[j])

qc.barrier(label="Depth-2 Expansion")
for i in range(4):
    qc.h(qr[i])
    qc.rz(2 * x[i], qr[i])

qc.barrier(label="|Φ(x)⟩ Projection")
qc.measure(qr, cr)

# Draw with Qiskit MPL
qc.draw(output="mpl")`}
        badges={['Qiskit 2.x Verified', 'Havlíček ZZ-Kernel', '16-D Hilbert Space']}
        qubitDetails={[
          { qubit: 0, label: 'q[0]: Ischemia Axis', desc: `Angle: ${angles[0].toFixed(3)} rad · ST depression + exercise angina` },
          { qubit: 1, label: 'q[1]: Hemodynamic Load', desc: `Angle: ${angles[1].toFixed(3)} rad · Resting systolic blood pressure` },
          { qubit: 2, label: 'q[2]: Metabolic/Sex Axis', desc: `Angle: ${angles[2].toFixed(3)} rad · Serum cholesterol & patient biological sex` },
          { qubit: 3, label: 'q[3]: Vascular Age Factor', desc: `Angle: ${angles[3].toFixed(3)} rad · Chronological vascular decay score` },
        ]}
      />

      {/* Kernel Equations */}
      <DCard style={{ padding: 24 }}>
        <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: T.text, marginBottom: 16 }}>Quantum Fidelity Kernel & SVM Decision Boundary</h3>
        {[
          'K(xᵢ, xⱼ) = |⟨ψ(xᵢ) | ψ(xⱼ)⟩|²',
          'f(x) = ∑ αᵢ yᵢ |⟨ψ(x) | ψ(xᵢ)⟩|² + b',
        ].map((eq, i) => (
          <div key={i} style={{ background: T.card2, borderRadius: 10, padding: '14px 18px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.88rem', color: '#34d399', textAlign: 'center', border: `1px solid ${T.border}`, marginBottom: i === 0 ? 10 : 0 }}>{eq}</div>
        ))}
        <p style={{ fontSize: '0.78rem', color: T.textSec, marginTop: 16, lineHeight: 1.7 }}>
          The 4 PCA-reduced angles (θ₀–θ₃) encode 6 clinical biomarkers into a 16-dimensional quantum Hilbert space ℋ ∈ ℂ¹⁶.
          The ZZ-Feature Map creates non-linear entangled two-qubit interactions via CNOT gates, allowing the QSVC to
          separate CAD Positive and Negative classes beyond classical linear boundaries.
        </p>
      </DCard>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   FULL PAGE
══════════════════════════════════════════════════════════════ */
const TABS = [
  { id: 'predict',  label: 'Clinical Prediction', icon: Activity },
  { id: 'batch',    label: 'Batch CSV Upload',     icon: FileSpreadsheet },
  { id: 'metrics',  label: 'Model Performance',    icon: BarChart3 },
  { id: 'dataset',  label: 'Clinical Dataset',     icon: Database },
  { id: 'circuits', label: 'Quantum Circuits',     icon: Cpu },
]

export function HeartDiseasePage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('predict')
  const [modelType, setModelType] = useState('qsvc')
  const [recentRunsTrigger, setRecentRunsTrigger] = useState(0)
  const [patientInput, setPatientInput] = useState({ age: 58, sex: 1, cholesterol: 245, resting_bp: 135, exercise_angina: 1, st_depression: 1.8 })
  const [predResult, setPredResult] = useState(null)
  const [modelStatus, setModelStatus] = useState(null)
  const [dataset, setDataset] = useState(undefined)
  const [predicting, setPredicting] = useState(false)
  const [retraining, setRetraining] = useState(false)
  const [notif, setNotif] = useState(null)

  const showNotif = (type, msg) => { setNotif({ type, msg }); setTimeout(() => setNotif(null), 4000) }

  useEffect(() => {
    axios.get(`${API}/metrics/heart`).then(r => setModelStatus(r.data)).catch(() => {})
    axios.get(`${API}/dataset`).then(r => setDataset(r.data)).catch(() => setDataset(null))
  }, [])

  const runPrediction = async (input) => {
    setPredicting(true)
    try {
      const res = await axios.post(`${API}/predict/heart?model_type=${modelType}`, {
        age: input.age,
        sex: input.sex,
        cholesterol: input.cholesterol,
        resting_bp: input.resting_bp,
        exercise_angina: input.exercise_angina,
        st_depression: input.st_depression
      })
      setPredResult(res.data)
      setRecentRunsTrigger(prev => prev + 1)
      showNotif('success', `Diagnostic run completed on ${modelType === 'iqm' ? 'IQM Garnet QPU' : 'Havlíček QSVC'}!`)
    } catch (e) {
      showNotif('error', e.response?.data?.detail || 'Quantum inference failed. Is the backend running?')
    } finally { setPredicting(false) }
  }

  const handleRetrain = async () => {
    setRetraining(true)
    try {
      const res = await axios.post(`${API}/train/heart`, { n_samples: 180 })
      if (res.data?.metrics) showNotif('success', `Retrained! ROC-AUC: ${res.data.metrics.roc_auc.toFixed(3)}`)
      const m = await axios.get(`${API}/metrics/heart`)
      setModelStatus(m.data)
    } catch { showNotif('error', 'Retraining failed. Check backend.') }
    finally { setRetraining(false) }
  }

  return (
    <div className="page-container">
      {/* Toast */}
      {notif && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, padding: '12px 18px', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem', fontWeight: 600, background: notif.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: notif.type === 'success' ? '#34d399' : '#f87171', border: `1px solid ${notif.type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}` }}>
          {notif.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          {notif.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-icon blue" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
          <Heart size={24} />
        </div>
        <div className="page-header-text">
          <h1>Heart Disease QML Engine</h1>
          <p>Quantum SVM · 4-Qubit PennyLane · Havlíček ZZ-Feature Map · Real IQM Garnet QPU · SQLite Storage</p>
        </div>
        <div style={{ display: 'flex', gap: 10, marginLeft: 'auto', alignItems: 'center', flexWrap: 'wrap' }}>
          {modelStatus?.roc_auc && (
            <div style={{ padding: '6px 14px', background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.3)', borderRadius: 10, fontSize: '0.75rem', fontWeight: 700, color: '#a5b4fc', fontFamily: 'JetBrains Mono, monospace' }}>
              AUC: {modelStatus.roc_auc.toFixed(3)}
            </div>
          )}
          <button onClick={handleRetrain} disabled={retraining}
            style={{ padding: '8px 14px', borderRadius: 10, background: T.card2, border: `1px solid ${T.border}`, color: T.textSec, fontSize: '0.78rem', fontWeight: 700, cursor: retraining ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, opacity: retraining ? 0.6 : 1, transition: 'all 0.2s' }}>
            <RefreshCw size={13} style={{ animation: retraining ? 'spin 0.8s linear infinite' : 'none' }} />
            {retraining ? 'Training...' : 'Retrain'}
          </button>
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => navigate('/')}>
            <ArrowLeft size={14} /> Home
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="sub-tabs">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button key={tab.id} className={`sub-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              <Icon size={14} />{tab.label}
            </button>
          )
        })}
      </div>

      {/* Predict Tab */}
      {activeTab === 'predict' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
            <HeartPatientForm
              input={patientInput}
              onChange={vals => setPatientInput(prev => ({ ...prev, ...vals }))}
              onSubmit={e => { e.preventDefault(); runPrediction(patientInput) }}
              loading={predicting}
              modelType={modelType}
              onModelTypeChange={setModelType}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <HeartResultCard result={predResult} patientInput={patientInput} />
              {predResult && (
                <DCard style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.2)' }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#a5b4fc' }}>Explore Quantum Circuit Embeddings</div>
                    <div style={{ fontSize: '0.72rem', color: T.textMuted, marginTop: 2 }}>View the 4-qubit ZZ-Feature Map and live qubit state angles</div>
                  </div>
                  <button onClick={() => setActiveTab('circuits')}
                    style={{ padding: '8px 16px', background: 'rgba(129,140,248,0.2)', border: '1px solid rgba(129,140,248,0.4)', color: '#a5b4fc', borderRadius: 10, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Cpu size={14} /> Open Circuits
                  </button>
                </DCard>
              )}
            </div>
          </div>

          {/* SQLite Diagnostics Persistent History Table */}
          <RecentRunsTable
            disease="heart_disease"
            title="Recent Cardiovascular Diagnostic Runs (SQLite Persistent)"
            refreshTrigger={recentRunsTrigger}
          />
        </div>
      )}

      {activeTab === 'batch'    && <BatchUploader />}
      {activeTab === 'metrics'  && <HeartMetricsView metrics={modelStatus} onRetrain={handleRetrain} isTraining={retraining} />}
      {activeTab === 'dataset'  && <HeartDatasetView dataset={dataset} />}
      {activeTab === 'circuits' && <CircuitsView patientInput={patientInput} />}
    </div>
  )
}
