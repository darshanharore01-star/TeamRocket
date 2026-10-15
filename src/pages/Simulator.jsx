feature/investments
// Person 2: Market-crash simulator (route: /simulator)
// Replays a hypothetical fall, or a real one (COVID-19 2020, 2008) using real index-fund prices.
import { useEffect, useState } from 'react';
import '../styles/investment.css';
import { CRASHES, defaultProfile, investmentOptions } from '../data/investmentOptions';
import { findCrash, loadFundHistory } from '../utils/mfApi';
import { RESPONSES, SCENARIOS, formatINR, linearPath, simulateResponse } from '../utils/investmentCalcs';

const monthYear = (ts) =>
  new Date(ts).toLocaleDateString('en-IN', { month: 'short', year: 'numeric', timeZone: 'UTC' });

export default function Simulator({ profile = defaultProfile }) {
  const [invested, setInvested] = useState(10000);
  const [hypoDrop, setHypoDrop] = useState(15);
  const [mode, setMode] = useState('hypothetical'); // 'hypothetical' or a crash id
  const [response, setResponse] = useState('hold');
  const [needsMoney, setNeedsMoney] = useState(false);

  const [crashes, setCrashes] = useState([]);
  const [fundName, setFundName] = useState('');
  const [dataStatus, setDataStatus] = useState('loading'); // loading | ready | empty | offline

  useEffect(() => {
    let cancelled = false;
    const indexOption = investmentOptions.find((o) => o.id === 'index');
    loadFundHistory(indexOption.scheme)
      .then(({ schemeName, history }) => {
        if (cancelled) return;
        const found = CRASHES.map((c) => ({ ...c, ...findCrash(history, c.from, c.to) })).filter((c) => c.path);
        setCrashes(found);
        setFundName(schemeName);
        setDataStatus(found.length ? 'ready' : 'empty');
      })
      .catch(() => !cancelled && setDataStatus('offline'));
    return () => {
      cancelled = true;
    };
  }, []);

  const crash = crashes.find((c) => c.id === mode);
  const dropPct = crash ? crash.dropPct : hypoDrop;
  const valueNow = invested * (1 - dropPct / 100);
  const monthly = profile.monthlyContribution;
  const current = RESPONSES.find((r) => r.id === response);

  const scenarios = crash
    ? [
        { id: 'actual', label: 'What actually happened over the next 12 months', path: crash.path },
        { id: 'flat', label: 'Market stays where it is', path: linearPath(0) },
        { id: 'fall', label: 'Market falls another 10%', path: linearPath(-0.1) },
      ]
    : SCENARIOS.map((s) => ({ ...s, path: s.path(dropPct / 100) }));

  const results = scenarios.map((s) => ({
    ...s,
    ...simulateResponse({ invested, dropPct, monthly, response, pricePath: s.path }),
  }));
  const maxValue = Math.max(...results.map((r) => r.value), invested);

  return (
    <section className="pp2">
      <h1>When markets fall</h1>
      <p className="pp2-lede">
        Pick a fall, then choose how you would respond. See what could happen a year later under
        different paths. Nobody can predict which one will happen.
      </p>

      <div className="pp2-choices" role="group" aria-label="Type of fall">
        <button type="button" className="pp2-choice" aria-pressed={mode === 'hypothetical'}
          onClick={() => setMode('hypothetical')}>
          Hypothetical fall
        </button>
        {crashes.map((c) => (
          <button key={c.id} type="button" className="pp2-choice" aria-pressed={mode === c.id}
            onClick={() => setMode(c.id)}>
            Real: {c.label}
          </button>
        ))}
      </div>
      <p className={`pp2-banner ${dataStatus === 'ready' ? 'live' : dataStatus}`} role="status">
        {dataStatus === 'loading' && 'Loading real market history…'}
        {dataStatus === 'ready' && 'Real crashes use actual prices of a Nifty 50 index fund (MFAPI.in).'}
        {dataStatus === 'empty' && 'This fund has no history covering the listed crashes, so only hypothetical falls are available.'}
        {dataStatus === 'offline' && 'Could not load real market history, so only hypothetical falls are available.'}
      </p>

      <div className="pp2-panel pp2-controls" style={{ marginTop: '1rem' }}>
        <div className="pp2-field">
          <label htmlFor="pp2-invested">
            <span>Amount invested</span><span>{formatINR(invested)}</span>
          </label>
          <input id="pp2-invested" type="range" min="1000" max="100000" step="1000"
            value={invested} onChange={(e) => setInvested(Number(e.target.value))} />
        </div>

        {crash ? (
          <div className="pp2-field">
            <label><span>Real fall</span><span>{dropPct}%</span></label>
            <p className="pp2-hint">
              {fundName} fell {dropPct}% from {monthYear(crash.peakDate)} to {monthYear(crash.troughDate)}.
              Imagine you invested at the peak. You are now at the low point, worth {formatINR(valueNow)}.
            </p>
          </div>
        ) : (
          <div className="pp2-field">
            <label htmlFor="pp2-drop">
              <span>Market fall</span><span>{dropPct}%</span>
            </label>
            <input id="pp2-drop" type="range" min="5" max="50" step="5"
              value={hypoDrop} onChange={(e) => setHypoDrop(Number(e.target.value))} />
            <p className="pp2-hint">
              Your {formatINR(invested)} is now worth {formatINR(valueNow)}, before costs and taxes.
            </p>
          </div>
        )}
      </div>

      <h2>How would you respond?</h2>
      <div className="pp2-choices" role="group" aria-label="Your response">
        {RESPONSES.map((r) => (
          <button key={r.id} type="button" className="pp2-choice"
            aria-pressed={response === r.id} onClick={() => setResponse(r.id)}>
            {r.label}
          </button>
        ))}
      </div>

      <div className="pp2-panel" style={{ marginTop: '1rem' }}>
        <strong>What this means</strong>
        <p style={{ margin: '.4rem 0 0', lineHeight: 1.5 }}>{current.meaning}</p>

        <label className="pp2-toggle">
          <input type="checkbox" checked={needsMoney} onChange={(e) => setNeedsMoney(e.target.checked)} />
          <span>I need some of this money within 3 months (for example, college fees).</span>
        </label>
        {needsMoney && (
          <p className="pp2-caution" style={{ marginTop: '.75rem' }}>
            Your own situation has changed, not just the market. Money needed soon should not be
            exposed to further falls, so selling the part you need can be reasonable even if the
            market later recovers.
          </p>
        )}
      </div>

      <h2>One year later</h2>
      <div className="pp2-panel">
        <div className="pp2-bars">
          {results.map((r) => (
            <div key={r.id} className="pp2-bar-row">
              <div className="label">
                <span>{r.label}</span>
                <strong>
                  {formatINR(r.value)}{' '}
                  <span style={{ fontWeight: 400 }}>
                    ({r.gain >= 0 ? '+' : '-'}{formatINR(Math.abs(r.gain))} vs money put in)
                  </span>
                </strong>
              </div>
              <div className="pp2-track">
                <div
                  className={`pp2-fill ${r.value < r.putIn ? 'below' : ''}`}
                  style={{ width: `${(r.value / maxValue) * 100}%` }}
                />
                <div className="pp2-marker" style={{ left: `${(r.putIn / maxValue) * 100}%` }} title="Money put in" />
              </div>
            </div>
          ))}
        </div>
        <p className="pp2-legend">
          The dark line marks the money you put in. A bar that stops short of it, in orange,
          means a loss on that path.
        </p>

        <div className="pp2-split">
          <div>
            <h4>What changed</h4>
            <ul>
              <li>The price of your investment, down {dropPct}%.</li>
              <li>Your paper value, now {formatINR(valueNow)}.</li>
            </ul>
          </div>
          <div>
            <h4>What has not changed</h4>
            <ul>
              <li>Your goal and when you need the money.</li>
              <li>Your income and monthly expenses, unless you tick the box above.</li>
            </ul>
          </div>
        </div>
      </div>

      <p className="pp2-disclaimer">
        Educational simulation only. It ignores fees and tax, and one real crash is one example,
        not a forecast. No response is right for everyone, and the app cannot predict the market.
      </p>
    </section>
  );

