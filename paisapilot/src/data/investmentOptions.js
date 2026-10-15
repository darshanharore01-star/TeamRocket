// Person 2 owns this file.
//
// Options with a `scheme` get REAL past returns and worst falls from MFAPI.in at runtime
// (the fund is found by name search, so no scheme codes to maintain). The planner shows
// the matched fund name on each card: check it is the fund you meant, and adjust
// `query`/`include`/`exclude` here if not.
// Options without a `scheme` use the fixed rates below. Update them from a bank's website.

export const defaultProfile = {
  monthlyIncome: 8000,
  monthlyExpenses: 5000,
  existingSavings: 2000,
  monthlyContribution: 1000,
  goalAmount: 10000,
  goalMonths: 12,
  riskComfort: 'medium', // 'low' | 'medium' | 'high'
};

const DIRECT_GROWTH = ['direct', 'growth'];
const NOT_PAYOUT = ['idcw', 'dividend', 'bonus', 'payout'];

// riskLevel: 1 (very stable) to 5 (can fall a lot)
// minHorizonMonths: shortest period we consider sensible for this option
export const investmentOptions = [
  {
    id: 'savings',
    name: 'Savings account',
    riskLevel: 1,
    rate: 0.03, rateLow: 0.025, rateHigh: 0.035,
    rateNote: 'Typical bank rate. Replace with your bank\'s published rate.',
    minHorizonMonths: 0,
    liquidity: 'Withdraw any time',
    fees: 'Usually none',
    worstDrop: 0,
    summary: 'Your money stays safe and easy to reach. Growth is small.',
    unsuitableIf: 'You want your money to beat inflation over many years.',
  },
  {
    id: 'rd',
    name: 'Recurring deposit',
    riskLevel: 1,
    rate: 0.065, rateLow: 0.06, rateHigh: 0.07,
    rateNote: 'Typical bank rate. Replace with your bank\'s published rate.',
    minHorizonMonths: 6,
    liquidity: 'Locked until maturity; early exit may reduce interest',
    fees: 'Penalty on early exit',
    worstDrop: 0,
    summary: 'A fixed monthly deposit with a known return. Good for dated goals.',
    unsuitableIf: 'You might need the money before the deposit ends.',
  },
  {
    id: 'liquid',
    name: 'Liquid fund',
    riskLevel: 2,
    rate: 0.06, rateLow: 0.045, rateHigh: 0.07,
    scheme: { query: 'HDFC Liquid Fund', include: DIRECT_GROWTH, exclude: NOT_PAYOUT },
    minHorizonMonths: 3,
    liquidity: 'Usually 1 to 2 working days',
    fees: 'Small yearly fund fee',
    worstDrop: 2,
    summary: 'Lends to safe borrowers for short periods. Slightly more flexible than a deposit.',
    unsuitableIf: 'You need a guaranteed amount on a fixed date.',
  },
  {
    id: 'gold',
    name: 'Gold fund',
    riskLevel: 3,
    rate: 0.08, rateLow: 0.0, rateHigh: 0.12,
    scheme: { query: 'SBI Gold Fund', include: DIRECT_GROWTH, exclude: NOT_PAYOUT },
    minHorizonMonths: 36,
    liquidity: 'Usually 2 to 3 working days',
    fees: 'Yearly fund fee',
    worstDrop: 15,
    summary: 'Tracks gold prices. Often moves differently from shares, but it can stay flat for years.',
    unsuitableIf: 'You cannot stay invested for at least three years.',
  },
  {
    id: 'hybrid',
    name: 'Balanced (hybrid) fund',
    riskLevel: 3,
    rate: 0.09, rateLow: 0.03, rateHigh: 0.13,
    scheme: { query: 'HDFC Balanced Advantage Fund', include: DIRECT_GROWTH, exclude: NOT_PAYOUT },
    minHorizonMonths: 36,
    liquidity: 'Usually 2 to 3 working days',
    fees: 'Yearly fund fee',
    worstDrop: 15,
    summary: 'Mixes shares and bonds in one fund, so falls tend to be milder than a pure share fund.',
    unsuitableIf: 'You need the money soon or cannot handle seeing it dip.',
  },
  {
    id: 'index',
    name: 'Nifty 50 index fund',
    riskLevel: 5,
    rate: 0.11, rateLow: 0.03, rateHigh: 0.16,
    scheme: {
      query: 'UTI Nifty 50 Index Fund',
      include: DIRECT_GROWTH,
      exclude: [...NOT_PAYOUT, 'next', 'midcap', 'smallcap', 'momentum', 'quality', 'value', 'alpha', 'equal'],
    },
    minHorizonMonths: 60,
    liquidity: 'Usually 2 to 3 working days',
    fees: 'Low yearly fund fee',
    worstDrop: 30,
    summary: "Follows India's 50 largest listed companies. Highest growth potential and the biggest swings.",
    unsuitableIf: 'You need the money within five years or a 20-30% fall would force you to sell.',
  },
];

// Real falls the simulator can replay using the index fund's actual price history.
export const CRASHES = [
  { id: 'covid', label: 'COVID-19 crash, 2020', from: '2020-01-01', to: '2020-04-30' },
  { id: 'gfc', label: 'Global financial crisis, 2008', from: '2008-01-01', to: '2009-04-30' },
];

export const riskLabels = {
  low: 'I would be uncomfortable with any loss',
  medium: 'A small dip is fine if it can recover',
  high: 'I can handle large swings for higher growth',
};
