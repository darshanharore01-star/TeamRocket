// Person 2 (optional): stock lookup via Alpha Vantage.
// The free key allows about 25 requests a day, so every result is cached for the session.
// Put the key in .env as VITE_ALPHAVANTAGE_KEY (never commit it).

const KEY = import.meta.env.VITE_ALPHAVANTAGE_KEY;

export const hasStockKey = Boolean(KEY);

// Returns [{ date: 'YYYY-MM-DD', close }], oldest first (about the last 100 trading days).
export async function getDailySeries(symbol) {
  if (!KEY) throw new Error('No Alpha Vantage key set');
  const sym = symbol.trim().toUpperCase();
  const cacheKey = `pp2:av:${sym}`;
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch { /* ignore */ }

  const url =
    `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(sym)}` +
    `&outputsize=compact&apikey=${KEY}`;
  const json = await (await fetch(url)).json();

  const series = json['Time Series (Daily)'];
  if (!series) {
    // Rate-limit notices and bad symbols still arrive as normal 200 responses
    throw new Error(json.Note || json.Information || json['Error Message'] || 'No data returned for this symbol');
  }
  const points = Object.entries(series)
    .map(([date, v]) => ({ date, close: parseFloat(v['4. close']) }))
    .sort((a, b) => a.date.localeCompare(b.date));
  try { sessionStorage.setItem(cacheKey, JSON.stringify(points)); } catch { /* ignore */ }
  return points;
}
