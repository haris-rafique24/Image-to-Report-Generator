import { useState } from 'react'
import axios from 'axios'
import ImageUploader from './components/ImageUploader.jsx'
import DomainSelector from './components/DomainSelector.jsx'
import ReportPanel from './components/ReportPanel.jsx'
import './App.css'

const API_BASE_URL =
  (import.meta.env.VITE_API_URL && String(import.meta.env.VITE_API_URL).replace(/\/$/, '')) ||
  (import.meta.env.DEV ? '' : '/api')

const DOMAINS = [
  { id: 'general',   label: 'General',    icon: '◎' },
  { id: 'medical',   label: 'Medical',    icon: '⊕' },
  { id: 'product',   label: 'Product QC', icon: '◈' },
  { id: 'satellite', label: 'Satellite',  icon: '◉' },
  { id: 'security',  label: 'Security',   icon: '⊛' },
]

export default function App() {
  const [domain, setDomain]   = useState('general')
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [report, setReport]   = useState(null)
  const [error, setError]     = useState(null)

  const handleFile = (file) => {
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
    setReport(null)
    setError(null)
  }

  const handleReset = () => {
    setImageFile(null)
    setPreview(null)
    setReport(null)
    setError(null)
  }

  const handleAnalyze = async () => {
    if (!imageFile) return
    setLoading(true)
    setReport(null)
    setError(null)

    const formData = new FormData()
    formData.append('file', imageFile)
    formData.append('domain', domain)

    try {
      const { data } = await axios.post(`${API_BASE_URL}/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setReport({ ...data.report, domain: data.domain, filename: data.filename })
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Unknown error'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-layout">
      {/* ── LEFT PANEL ─────────────────────────────── */}
      <div className="panel panel-left">
        <header className="panel-header">
          <div className="header-eyebrow">AI Vision System</div>
          <h1 className="header-title">Image <span className="accent">→</span> Report</h1>
        </header>

        <DomainSelector
          domains={DOMAINS}
          active={domain}
          onChange={setDomain}
        />

        <ImageUploader
          preview={preview}
          filename={imageFile?.name}
          onFile={handleFile}
          onReset={handleReset}
        />

        <div className="analyze-wrap">
          <button
            className={`analyze-btn ${loading ? 'loading' : ''}`}
            onClick={handleAnalyze}
            disabled={!imageFile || loading}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Analyzing…
              </>
            ) : imageFile ? (
              report ? 'Regenerate Report ↗' : 'Generate Report ↗'
            ) : (
              'Select an image first'
            )}
          </button>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────── */}
      <div className="panel panel-right">
        <ReportPanel report={report} loading={loading} error={error} />
      </div>
    </div>
  )
}
