import './DomainSelector.css'

export default function DomainSelector({ domains, active, onChange }) {
  return (
    <div className="domain-row">
      {domains.map(d => (
        <button
          key={d.id}
          className={`domain-btn ${active === d.id ? 'active' : ''}`}
          onClick={() => onChange(d.id)}
          title={d.label}
        >
          <span className="domain-icon">{d.icon}</span>
          {d.label}
        </button>
      ))}
    </div>
  )
}
