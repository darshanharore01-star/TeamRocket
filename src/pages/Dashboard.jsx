import { Link } from 'react-router-dom'
import { Check, ArrowRight } from 'lucide-react'
import {
  financialProfile,
  portfolio,
  portfolioHistory,
  milestones,
} from '../data/mockData.js'
import {
  formatINR,
  formatPct,
  milestoneProgress,
  planStatus,
} from '../utils/calculations.js'

function GrowthChart({ data }) {
  const w = 600
  const h = 220
  const pad = { l: 8, r: 8, t: 16, b: 28 }
  const max = Math.max(...data.map((d) => Math.max(d.value, d.contributed))) * 1.08
  const min = Math.min(...data.map((d) => Math.min(d.value, d.contributed))) * 0.92
  const x = (i) => pad.l + (i * (w - pad.l - pad.r)) / (data.length - 1)
  const y = (v) => pad.t + (1 - (v - min) / (max - min)) * (h - pad.t - pad.b)
  const line = (key) => data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d[key])}`).join(' ')

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="chart" role="img"
      aria-label="Chart of money put in versus estimated value over six months">
      <path d={line('contributed')} className="chart-line chart-line--base" />
      <path d={line('value')} className="chart-line chart-line--main" />
      {data.map((d, i) => (
        <g key={d.month}>
          <circle cx={x(i)} cy={y(d.value)} r="3.5" className="chart-dot" />
          <text x={x(i)} y={h - 8} textAnchor="middle" className="chart-label">{d.month}</text>
        </g>
      ))}
    </svg>
  )
}

export default function Dashboard() {
  const { currentValue, totalContributed } = portfolio
  const gain = currentValue - totalContributed
  const gainPct = (gain / totalContributed) * 100
  const { next, percent, remaining } = milestoneProgress(currentValue, milestones)
  const status = planStatus(financialProfile, currentValue)

  return (
    <section className="dash">
      <header className="dash-head">
        <h1 className="page-title">Hi {financialProfile.name}, here's where you stand</h1>
        <p className="page-sub">A calm summary - no trading screens, just what matters.</p>
      </header>

      {/* The one memorable element: the next step on the ladder */}
      <div className="card next-step">
        {next ? (
          <>
            <p className="next-kicker">Next milestone: {next.title}</p>
            <p className="next-amount">
              {formatINR(remaining)} <span>to reach {formatINR(next.target)}</span>
            </p>
            <div className="bar" role="progressbar" aria-valuenow={Math.round(percent)}
              aria-valuemin="0" aria-valuemax="100">
              <div className="bar-fill" style={{ width: `${percent}%` }} />
            </div>
            <p className="muted">{Math.round(percent)}% of the way from your last milestone</p>
          </>
        ) : (
          <p className="next-amount">All amount milestones reached 🎉</p>
        )}
      </div>

      <div className="stats">
        <div className="card stat">
          <span className="stat-label">Total put in</span>
          <span className="stat-value">{formatINR(totalContributed)}</span>
        </div>
        <div className="card stat">
          <span className="stat-label">Estimated value today</span>
          <span className="stat-value">{formatINR(currentValue)}</span>
          <span className={`stat-note ${gain >= 0 ? 'pos' : 'neg'}`}>
            {gain >= 0 ? '+' : '-'}{formatINR(Math.abs(gain))} ({formatPct(gainPct)})
          </span>
        </div>
        <div className="card stat">
          <span className="stat-label">Is your plan still on track?</span>
          <span className={`pill pill--${status.key}`}>{status.label}</span>
          <span className="stat-note">{status.message}</span>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <h2 className="card-title">Put in vs. estimated value</h2>
          <GrowthChart data={portfolioHistory} />
          <p className="legend">
            <span className="swatch swatch--main" /> Estimated value
            <span className="swatch swatch--base" /> Total put in
          </p>
        </div>

        <div className="card">
          <h2 className="card-title">Your goal ladder</h2>
          <ol className="ladder">
            {milestones.map((m) => {
              const done = m.target !== null && currentValue >= m.target
              const current = next && next.id === m.id
              return (
                <li key={m.id} className={`rung ${done ? 'done' : ''} ${current ? 'current' : ''}`}>
                  <span className="rung-dot">{done ? <Check size={14} strokeWidth={3} /> : null}</span>
                  <div>
                    <strong>{m.title}</strong>
                    <small>
                      {m.target !== null ? `${formatINR(m.target)} · ` : ''}
                      {m.description}
                    </small>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>

      <div className="card cta">
        <div>
          <strong>Life changed?</strong>
          <p className="muted">Update your income or goal date and the plan adjusts.</p>
        </div>
        <Link to="/goals" className="btn">
          Review my plan <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  )
}
