// Person 2: real fund data from MFAPI.in (free, no API key, data sourced from AMFI).
// Everything here degrades gracefully: if a call fails, callers fall back to illustrative numbers.

const BASE = 'https://api.mfapi.in/mf';
const DAY = 24 * 3600 * 1000;
const YEAR = 365.25 * DAY;
const CACHE_TTL = DAY; // NAVs update once a day, so one fetch per day is enough

// ---------- tiny localStorage cache (safe if storage is blocked or full) ----------
function readCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { t, v } = JSON.parse(raw);
    return Date.now() - t < CACHE_TTL ? v : null;
  } catch {
    return null;
  }
}
function writeCache(key, v) {
  try {
    localStorage.setItem(key, JSON.stringify({ t: Date.now(), v }));
  } catch {
    /* storage full or blocked: ignore */
  }
}

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MFAPI request failed (${res.status})`);
  return res.json();
}

// MFAPI dates look like "28-03-2025"
const parseDate = (s) => {
  const [d, m, y] = s.split('-');
  return Date.UTC(+y, +m - 1, +d);
};

// ---------- fetching ----------

// Find a scheme by name. `include` words must all appear; `exclude` words must not.
export async function resolveScheme({ query, include = [], exclude = [] }) {
  const key = `pp2:scheme:${query}`;
  const cached = readCache(key);
  if (cached) return cached;

  const list = await getJSON(`${BASE}/search?q=${encodeURIComponent(query)}`);
  const ok = (name) => {
    const n = name.toLowerCase();
    return include.every((w) => n.includes(w)) && !exclude.some((w) => n.includes(w));
  };
  const match = list.find((s) => ok(s.schemeName));
  if (!match) throw new Error(`No fund matched "${query}"`);
  writeCache(key, match);
  return match;
}

// Returns [[timestampMs, nav], ...] oldest first.
export async function getNavHistory(schemeCode) {
  const key = `pp2:nav:${schemeCode}`;
  const cached = readCache(key);
  if (cached) return cached;

  const json = await getJSON(`${BASE}/${schemeCode}`);
  const history = json.data
    .map((p) => [parseDate(p.date), parseFloat(p.nav)])
    .filter((p) => p[1] > 0)
    .sort((a, b) => a[0] - b[0]);
  if (history.length < 30) throw new Error('Not enough NAV history');
  writeCache(key, history);
  return history;
}

export async function loadFundHistory(schemeConfig) {
  const scheme = await resolveScheme(schemeConfig);
  const history = await getNavHistory(scheme.schemeCode);
  return { schemeName: scheme.schemeName, schemeCode: scheme.schemeCode, history };
}

// ---------- statistics ----------

// Last data point on or before ts, or null if ts is before the history starts.
export function navAt(history, ts) {
  if (!history.length || ts < history[0][0]) return null;
  let lo = 0;
  let hi = history.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (history[mid][0] <= ts) lo = mid;
    else hi = mid - 1;
  }
  return history[lo];
}

export function cagr(history, years) {
  const end = history[history.length - 1];
  const start = navAt(history, end[0] - years * YEAR);
  if (!start) return null;
  const span = (end[0] - start[0]) / YEAR;
  if (span < years * 0.9) return null;
  return Math.pow(end[1] / start[1], 1 / span) - 1;
}

// Biggest fall from any earlier peak, as a fraction (0.35 = 35%).
export function maxDrawdown(history) {
  let peak = history[0][1];
  let worst = 0;
  for (const [, nav] of history) {
    peak = Math.max(peak, nav);
    worst = Math.min(worst, nav / peak - 1);
  }
  return -worst;
}

function rollingCagrs(history, years) {
  const out = [];
  for (let i = 0; i < history.length; i += 21) {
    const end = history[i];
    const start = navAt(history, end[0] - years * YEAR);
    if (!start) continue;
    const span = (end[0] - start[0]) / YEAR;
    if (span < years * 0.9) continue;
    out.push(Math.pow(end[1] / start[1], 1 / span) - 1);
  }
  return out.sort((a, b) => a - b);
}

const percentile = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];

// Turn a NAV history into the numbers the planner uses.
export function summarize(history) {
  const end = history[history.length - 1];
  const basisYears = [5, 3, 1].find((y) => cagr(history, y) !== null);
  if (!basisYears) throw new Error('History too short to estimate a return');
  const rate = cagr(history, basisYears);

  const spanYears = (end[0] - history[0][0]) / YEAR;
  const window = spanYears >= 6 ? 3 : 1;
  const rolls = rollingCagrs(history, window);
  const rateLow = rolls.length >= 10 ? Math.min(percentile(rolls, 0.1), rate) : null;
  const rateHigh = rolls.length >= 10 ? Math.max(percentile(rolls, 0.9), rate) : null;

  return { rate, rateLow, rateHigh, basisYears, worstDrop: maxDrawdown(history) * 100, asOf: end[0] };
}

// Replace an option's illustrative numbers with real ones. Options without a `scheme` pass through.
export async function loadLiveOption(option) {
  if (!option.scheme) return option;
  const { schemeName, schemeCode, history } = await loadFundHistory(option.scheme);
  const s = summarize(history);
  return {
    ...option,
    rate: s.rate,
    rateLow: s.rateLow ?? option.rateLow,
    rateHigh: s.rateHigh ?? option.rateHigh,
    worstDrop: Math.round(s.worstDrop),
    basisYears: s.basisYears,
    asOf: s.asOf,
    schemeName,
    schemeCode,
    live: true,
  };
}

// ---------- real crash replay ----------

// Biggest peak-to-trough fall inside [fromISO, toISO], plus what the fund did in the
// 12 months after the low point (as prices relative to the low, 13 monthly points).
export function findCrash(history, fromISO, toISO) {
  const from = Date.parse(fromISO);
  const to = Date.parse(toISO);
  const win = history.filter((p) => p[0] >= from && p[0] <= to);
  if (win.length < 10) return null;

  let peak = win[0];
  let best = { drop: 0, peak: win[0], trough: win[0] };
  for (const p of win) {
    if (p[1] > peak[1]) peak = p;
    const drop = 1 - p[1] / peak[1];
    if (drop > best.drop) best = { drop, peak, trough: p };
  }
  if (best.drop < 0.05) return null;

  const lastTs = history[history.length - 1][0];
  const path = [];
  for (let i = 0; i <= 12; i++) {
    const ts = best.trough[0] + i * 30.4375 * DAY;
    if (ts > lastTs) return null;
    path.push(navAt(history, ts)[1] / best.trough[1]);
  }

  return {
    dropPct: Math.round(best.drop * 1000) / 10,
    peakDate: best.peak[0],
    troughDate: best.trough[0],
    path,
  };
}
