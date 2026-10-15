// Person 2 (optional): live stock lookup via Alpha Vantage. Renders nothing without a key.
import { useState } from 'react';
import { getDailySeries, hasStockKey } from '../utils/stockApi';

export default function StockLookup() {
  const [symbol, setSymbol] = useState('');
  const [state, setState] = useState({ status: 'idle' });

  if (!hasStockKey) return null;

  async function lookup(e) {
    e.preventDefault();
    if (!symbol.trim()) return;
    setState({ status: 'loading' });
    try {
      const pts = await getDailySeries(symbol);
      setState({ status: 'ready', pts });
    } catch (err) {
      setState({ status: 'error', message: err.message });
    }
  }

  const pts = state.pts;
  const first = pts?.[0];
  const last = pts?.[pts.length - 1];
  const change = pts ? last.close / first.close - 1 : 0;

  return (
    <details className="pp2-panel" style={{ marginTop: '2rem' }}>
      <summary><strong>Optional: look up a stock or ETF</strong></summary>
      <p className="pp2-hint">
        Live data from Alpha Vantage. The free key allows about 25 lookups a day, and Indian
        symbols may return nothing. Prices are in the stock's own currency.
      </p>
      <form onSubmit={lookup} style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
        <label htmlFor="pp2-symbol" style={{ position: 'absolute', left: '-9999px' }}>Ticker symbol</label>
        <input
          id="pp2-symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)}
          placeholder="Ticker, for example IBM" className="pp2-input"
        />
        <button type="submit" className="pp2-choice" style={{ width: 'auto' }}>Look up</button>
      </form>

      {state.status === 'loading' && <p className="pp2-hint">Loading…</p>}
      {state.status === 'error' && <p className="pp2-caution">{state.message}</p>}
      {state.status === 'ready' && (
        <div className="pp2-projection" style={{ marginTop: '.75rem' }}>
          <small>Latest close on {last.date}</small>
          <strong>{last.close.toLocaleString('en-US', { maximumFractionDigits: 2 })}</strong>
          <small>
            {change >= 0 ? 'Up' : 'Down'} {(Math.abs(change) * 100).toFixed(1)}% since {first.date}
            {' '}(about the last {pts.length} trading days). Past movement does not predict the future.
          </small>
        </div>
      )}
    </details>
  );
}
