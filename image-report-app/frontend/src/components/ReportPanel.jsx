import { useState } from 'react'
import './ReportPanel.css'

function ConfidenceBar({ label, score }) {
  const pct = Math.round(score * 100)
  return (
    <div className="conf-bar">
      <span className="conf-label">{label}</span>
      <div className="conf-track">
        <div className="conf-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="conf-val">{pct}%</span>
    </div>
  )
}

export default function ReportPanel({ report, loading, error }) {
  const [copied, setCopied] = useState(false)

  const copyReport = () => {
    navigator.clipboard.writeText(JSON.stringify(report, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="report-panel">
      <div className="report-header">
        <div>
          <div className="report-eyebrow">Output</div>
          <div className="report-title">Analysis Report</div>
        </div>
        {report && (
          <button className="copy-btn" onClick={copyReport}>
            {copied ? 'copied ✓' : 'copy report'}
          </button>
        )}
      </div>

      <div className="report-body">
        {/* Loading */}
        {loading && (
          <div className="loader">
            <div className="dots">
              <div className="dot" />
              <div className="dot" />
              <div className="dot" />
            </div>
            <div className="loader-text">analyzing image · generating report</div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="error-box">⚠ {error}</div>
        )}

        {/* Empty */}
        {!loading && !error && !report && (
          <div className="empty-state">
            <div className="empty-icon">◎</div>
            <div className="empty-text">
              Upload an image and select<br />
              a domain to generate a<br />
              structured analysis report
            </div>
          </div>
        )}

        {/* Report */}
        {!loading && !error && report && (
          <div className="report-content">

            <section className="rpt-section">
              <div className="section-label">
                Domain
                <span className="domain-badge">{report.domain}</span>
              </div>
              <div className="rpt-title">{report.title}</div>
              <div className="tags-row">
                {(report.tags || []).map(t => (
                  <span key={t} className="tag-chip">{t}</span>
                ))}
              </div>
            </section>

            <section className="rpt-section">
              <div className="section-label">Summary</div>
              <p className="rpt-text">{report.summary}</p>
            </section>

            <section className="rpt-section">
              <div className="section-label">Key Findings</div>
              <div className="findings-grid">
                {(report.findings || []).map((f, i) => (
                  <div key={i} className={`finding-chip ${i < 2 ? 'highlight' : ''}`}>
                    {f}
                  </div>
                ))}
              </div>
            </section>

            <section className="rpt-section">
              <div className="section-label">Confidence Scores</div>
              {(report.confidence_scores || []).map((c, i) => (
                <ConfidenceBar key={i} label={c.label} score={c.score} />
              ))}
            </section>

            <section className="rpt-section">
              <div className="section-label">Recommendations</div>
              <p className="rpt-text">{report.recommendations}</p>
            </section>

          </div>
        )}
      </div>
    </div>
  )
}
