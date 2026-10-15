// Person 1 — pure calculation helpers for onboarding & goal planning.
// Field names match the team's shared financialProfile object.
// All numbers are illustrative, not financial advice.

export const defaultProfile = {
  monthlyIncome: 8000,
  monthlyExpenses: 5000,
  existingSavings: 2000,
  monthlyContribution: 1000,
  goalAmount: 10000,
  goalMonths: 12,
  riskComfort: 'medium', // 'low' | 'medium' | 'high'
};

export const formatINR = (n) =>
  '₹' + Math.round(Number(n) || 0).toLocaleString('en-IN');

// Money left after essentials
export const getAvailable = (p) => Math.max(0, p.monthlyIncome - p.monthlyExpenses);

// Suggest setting aside ~60% of what is left, rounded down to ₹50,
// so there is room for surprises.
export const getSuggestedContribution = (p) =>
  Math.floor((getAvailable(p) * 0.6) / 50) * 50;

// Monthly amount needed to hit the goal by the deadline
export const getRequiredMonthly = (p) => {
  const gap = Math.max(0, p.goalAmount - p.existingSavings);
  return p.goalMonths > 0 ? Math.ceil(gap / p.goalMonths) : gap;
};

// Months to reach goal at a chosen monthly contribution (null if contribution is 0)
export const getMonthsToGoal = (p) => {
  const gap = Math.max(0, p.goalAmount - p.existingSavings);
  if (gap === 0) return 0;
  return p.monthlyContribution > 0 ? Math.ceil(gap / p.monthlyContribution) : null;
};

// 'on-track' | 'stretch' | 'off-track'
export function getFeasibility(p) {
  const required = getRequiredMonthly(p);
  const available = getAvailable(p);
  if (required <= p.monthlyContribution) return 'on-track';
  if (required <= available) return 'stretch';
  return 'off-track';
}

// Personalised milestones (illustrative order and amounts)
export function getMilestones(p) {
  const buffer = Math.max(500, Math.round((p.monthlyExpenses * 0.5) / 100) * 100);
  const items = [
    {
      id: 'buffer',
      title: 'Financial breathing room',
      detail: 'A starter buffer of about two weeks of essential expenses.',
      target: buffer,
    },
    {
      id: 'goal',
      title: 'Your short-term goal',
      detail: 'The amount you want to reach by your deadline.',
      target: p.goalAmount,
    },
    {
      id: 'habit',
      title: 'A regular investing habit',
      detail: 'Once your buffer is in place, explore a manageable monthly amount.',
      target: null,
    },
    {
      id: 'review',
      title: 'Review as life changes',
      detail: 'Revisit the plan when income, expenses or goals change.',
      target: null,
    },
  ];
  return items.map((m) => ({
    ...m,
    done: m.target !== null && p.existingSavings >= m.target,
  }));
}
