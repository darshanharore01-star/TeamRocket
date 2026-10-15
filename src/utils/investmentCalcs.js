// Person 2 owns this file. Pure functions only, so they are easy to test and reuse.

export const formatINR = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

// Monthly deposits at the start of each month, compounded monthly.
export function futureValue(monthly, months, annualRate, startingAmount = 0) {
  const r = annualRate / 12;
  let v = startingAmount;
  for (let i = 0; i < months; i++) v = (v + monthly) * (1 + r);
  return v;
}

export function projectOption(option, monthly, months, startingAmount = 0) {
  return {
    low: futureValue(monthly, months, option.rateLow, startingAmount),
    expected: futureValue(monthly, months, option.rate, startingAmount),
    high: futureValue(monthly, months, option.rateHigh, startingAmount),
    contributed: monthly * months + startingAmount,
  };
}

// Narrow the catalogue to three options. Horizon caps risk; comfort sets the target.
export function pickOptions(options, months, riskComfort) {
  const comfortTarget = { low: 1.5, medium: 3, high: 4.5 }[riskComfort] ?? 3;
  const horizonCap = months <= 12 ? 1.5 : months <= 36 ? 2.5 : 5;
  const target = Math.min(comfortTarget, horizonCap);

  return options
    .filter((o) => o.minHorizonMonths <= months)
    .map((o) => ({ ...o, distance: Math.abs(o.riskLevel - target) }))
    .sort((a, b) => a.distance - b.distance || a.riskLevel - b.riskLevel)
    .slice(0, 3)
    .sort((a, b) => a.riskLevel - b.riskLevel);
}

export function whyThisPlan(months, riskComfort) {
  if (months <= 12) {
    return 'Your goal is within a year, so keeping your money safe and reachable matters more than growth.';
  }
  if (months <= 36) {
    return 'With one to three years to go, we lean towards stable options and avoid anything that could fall sharply close to your deadline.';
  }
  if (riskComfort === 'low') {
    return 'You have time, but you prefer small dips, so the shortlist stays on the steadier side.';
  }
  return 'You have a long horizon, so options that can dip and recover are worth considering alongside steadier ones.';
}

// ---- Market-crash simulator ----

// A price path is 13 monthly prices (month 0 to month 12) relative to the price at the low point.
export const linearPath = (change) => Array.from({ length: 13 }, (_, i) => 1 + (change * i) / 12);

export const SCENARIOS = [
  { id: 'recover', label: 'Market recovers to its earlier level', path: (d) => linearPath(d / (1 - d)) },
  { id: 'flat', label: 'Market stays where it is', path: () => linearPath(0) },
  { id: 'fall', label: 'Market falls another 10%', path: () => linearPath(-0.1) },
];

export const RESPONSES = [
  {
    id: 'hold',
    label: 'Keep the investment',
    meaning:
      'You avoid turning a paper loss into a real one, but you also add nothing new. The investment can still fall further.',
  },
  {
    id: 'continue',
    label: 'Continue planned contributions',
    meaning:
      'Each new deposit buys at the lower price, which helps if prices recover and hurts if they keep falling. Only sensible if the money is not needed soon.',
  },
  {
    id: 'reduce',
    label: 'Reduce or pause contributions',
    meaning:
      "You limit how much more money is exposed. You also buy fewer units at today's lower price, so you gain less if the market recovers.",
  },
  {
    id: 'sell',
    label: 'Sell some or all',
    meaning:
      'You lock in the current loss and stop further losses. You also miss any recovery, and you need a plan for when to invest again.',
  },
];

export function simulateResponse({ invested, dropPct, monthly, response, pricePath }) {
  const valueNow = invested * (1 - dropPct / 100);
  const monthlyIn = response === 'continue' ? monthly : response === 'reduce' ? monthly / 2 : 0;

  if (response === 'sell') {
    return { valueNow, value: valueNow, putIn: invested, gain: valueNow - invested };
  }

  const endPrice = pricePath[12];
  let value = valueNow * endPrice;
  // Each monthly deposit buys at that month's price and is worth (endPrice / buyPrice) at the end.
  for (let i = 0; i < 12; i++) value += (monthlyIn * endPrice) / pricePath[i];

  const putIn = invested + monthlyIn * 12;
  return { valueNow, value, putIn, gain: value - putIn };
}
