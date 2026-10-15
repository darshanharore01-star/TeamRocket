 feature/investments
// Person 2: Investment Planner page (route: /investments)
import { useMemo, useState } from 'react';
import '../styles/investment.css';
import { defaultProfile, riskLabels } from '../data/investmentOptions';
import { formatINR, pickOptions, projectOption, whyThisPlan } from '../utils/investmentCalcs';
import { useLiveOptions } from '../utils/useLiveOptions';
import StockLookup from '../components/StockLookup';

const monthYear = (ts) =>
  new Date(ts).toLocaleDateString('en-IN', { month: 'short', year: 'numeric', timeZone: 'UTC' });

function RiskMeter({ level }) {
  return (
    <div className="pp2-meter" aria-label={`Risk level ${level} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`dot ${n <= level ? 'on' : ''}`} />
      ))}
      <span>Risk {level}/5</span>
    </div>
  );
}

const STATUS_TEXT = {
  loading: 'Loading real fund data…',
  live: 'Returns and falls below come from real fund prices (AMFI data via MFAPI.in).',
  partial: 'Some funds loaded real data. The rest use illustrative numbers, marked on each card.',
  offline: 'Could not reach the fund data service, so every number is illustrative.',
};

// Optional `profile` prop lets Person 3 pass the shared financialProfile later.
export default function InvestmentPlanner({ profile = defaultProfile }) {
  const freeMoney = Math.max(profile.monthlyIncome - profile.monthlyExpenses, 100);
  const [monthly, setMonthly] = useState(Math.min(profile.monthlyContribution, freeMoney));
  const [months, setMonths] = useState(profile.goalMonths);
  const [risk, setRisk] = useState(profile.riskComfort);

  const { options, status } = useLiveOptions();
  const shortlist = useMemo(() => pickOptions(options, months, risk), [options, months, risk]);

  return (
    <section className="pp2">
      <h1>Choose where your money goes</h1>
      <p className="pp2-lede">
        Three options that fit your timeline and comfort with risk. Change the sliders to see how
        the shortlist and the projections move.
      </p>

      <p className={`pp2-banner ${status}`} role="status">{STATUS_TEXT[status]}</p>

      <div className="pp2-panel pp2-controls">
        <div className="pp2-field">
          <label htmlFor="pp2-monthly">
            <span>Monthly amount</span>
            <span>{formatINR(monthly)}</span>
          </label>
          <input
            id="pp2-monthly" type="range" min="100" max={freeMoney} step="100"
            value={monthly} onChange={(e) => setMonthly(Number(e.target.value))}
          />
          <p className="pp2-hint">Money left after essentials: {formatINR(freeMoney)} a month.</p>
        </div>

        <div className="pp2-field">
          <label htmlFor="pp2-months">
            <span>Time until you need it</span>
            <span>{months} months</span>
          </label>
          <input
            id="pp2-months" type="range" min="3" max="120" step="1"
            value={months} onChange={(e) => setMonths(Number(e.target.value))}
          />
          <p className="pp2-hint">Shorter timelines favour safer options.</p>
        </div>

        <div className="pp2-field">
          <label htmlFor="pp2-risk"><span>If your money fell 10-20%</span></label>
          <select id="pp2-risk" value={risk} onChange={(e) => setRisk(e.target.value)}>
            {Object.entries(riskLabels).map(([key, text]) => (
              <option key={key} value={key}>{text}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="pp2-why"><strong>Why this shortlist?</strong> {whyThisPlan(months, risk)}</p>

      <h2>Your shortlist</h2>
      <div className="pp2-cards">
        {shortlist.map((option) => {
          const p = projectOption(option, monthly, months, 0);
          const onTrack = p.expected >= profile.goalAmount;
          const basis = option.live ? `past ${option.basisYears}-year return` : 'assumed rate';
          return (
            <article key={option.id} className="pp2-panel pp2-card">
              <h3>{option.name}</h3>
              <RiskMeter level={option.riskLevel} />
              <p>{option.summary}</p>

              <div className="pp2-projection">
                <small>Possible value after {months} months</small>
                <strong>{formatINR(p.expected)}</strong>
                <small>
                  Range {formatINR(p.low)} to {formatINR(p.high)} · you put in {formatINR(p.contributed)}
                </small>
                <small>Assumes {(option.rate * 100).toFixed(1)}% a year ({basis}).</small>
              </div>

              <p className={`pp2-status ${onTrack ? 'ok' : 'short'}`}>
                {onTrack
                  ? `Meets your ${formatINR(profile.goalAmount)} goal in the expected case`
                  : `Falls short of your ${formatINR(profile.goalAmount)} goal in the expected case`}
              </p>

              <dl className="pp2-facts">
                <dt>Access</dt><dd>{option.liquidity}</dd>
                <dt>Costs</dt><dd>{option.fees}</dd>
                <dt>Worst fall</dt>
                <dd>
                  {option.worstDrop === 0
                    ? 'No fall expected'
                    : `${option.live ? 'Down' : 'Around'} ${option.worstDrop}% ${option.live ? 'at its worst so far' : 'in a bad year'}`}
                </dd>
              </dl>

              <p className="pp2-caution">Might not suit you if: {option.unsuitableIf}</p>

              <p className="pp2-source">
                {option.live
                  ? `Real data: ${option.schemeName}, up to ${monthYear(option.asOf)}.`
                  : option.rateNote || 'Illustrative assumption, not live data.'}
              </p>
            </article>
          );
        })}
      </div>

      <StockLookup />

      <p className="pp2-disclaimer">
        Past returns do not predict future returns. Projections are estimates, not promises or
        personal investment advice, and investments can lose value. Check current rates and costs
        before investing.
      </p>
    </section>
  );
}
