// Shared calculation helpers. Keep functions pure (no side effects) so any
// module can import and reuse them.

export const formatINR = (n) => '₹' + Math.round(n).toLocaleString('en-IN')

export const formatPct = (n, digits = 1) => `${n >= 0 ? '+' : ''}${n.toFixed(digits)}%`

// Money left after essential expenses.
export function monthlySurplus(profile) {
  return Math.max(0, profile.monthlyIncome - profile.monthlyExpenses)
}

// Monthly amount needed to reach a goal with no growth assumed.
export function requiredMonthly(goalAmount, months, startingAmount = 0) {
  if (months <= 0) return 0
  return Math.max(0, (goalAmount - startingAmount) / months)
}

// Future value of regular monthly contributions at an assumed annual return (%).
export function futureValue(monthly, annualRatePct, months, startingAmount = 0) {
  const r = annualRatePct / 100 / 12
  if (r === 0) return startingAmount + monthly * months
  const growth = Math.pow(1 + r, months)
  return startingAmount * growth + monthly * ((growth - 1) / r)
}

// Value of a holding after a percentage fall (e.g. 15 => -15%).
export function applyDrawdown(value, dropPct) {
  return value * (1 - dropPct / 100)
}

// First milestone with an amount target that hasn't been reached yet.
export function nextMilestone(currentValue, milestones) {
  return milestones.find((m) => m.target !== null && currentValue < m.target) || null
}

// 0-100 progress between the previous reached target and the next one.
export function milestoneProgress(currentValue, milestones) {
  const next = nextMilestone(currentValue, milestones)
  if (!next) return { next: null, percent: 100, remaining: 0 }
  const previousTargets = milestones
    .filter((m) => m.target !== null && m.target <= currentValue)
    .map((m) => m.target)
  const floor = previousTargets.length ? Math.max(...previousTargets) : 0
  const percent = ((currentValue - floor) / (next.target - floor)) * 100
  return {
    next,
    percent: Math.min(100, Math.max(0, percent)),
    remaining: next.target - currentValue,
  }
}

// Is the current plan still aligned with the goal? (simple, no-growth check)
export function planStatus(profile, currentValue) {
  const projected = currentValue + profile.monthlyContribution * profile.goalMonths
  const ratio = projected / profile.goalAmount
  if (ratio >= 1) {
    return { key: 'on-track', label: 'On track', message: 'Your current contributions are enough to reach your goal in time.' }
  }
  if (ratio >= 0.8) {
    return { key: 'close', label: 'Slightly behind', message: 'A small increase in contributions or a later date would close the gap.' }
  }
  return { key: 'behind', label: 'Needs a review', message: 'Adjust your monthly amount or goal date in the Goal planner.' }
}
