// Shared simulated data. All modules should use these field names.
// Values are illustrative only - not a recommended financial plan.

export const financialProfile = {
  name: 'Aarav',
  monthlyIncome: 8000,
  monthlyExpenses: 5000,
  existingSavings: 2000,
  monthlyContribution: 1000,
  goalAmount: 10000,
  goalMonths: 12,
  riskComfort: 'moderate', // 'low' | 'moderate' | 'high'
}

// Six months of simulated contributions and (assumed) monthly returns in %.
const contributions = [800, 1000, 1000, 500, 1000, 1000]
const monthlyReturnPct = [0.6, -0.8, 1.1, 0.4, -0.3, 0.9]
const monthLabels = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']

function buildHistory() {
  let contributed = financialProfile.existingSavings
  let value = financialProfile.existingSavings
  return contributions.map((amount, i) => {
    contributed += amount
    value = (value + amount) * (1 + monthlyReturnPct[i] / 100)
    return { month: monthLabels[i], contributed, value: Math.round(value) }
  })
}

export const portfolioHistory = buildHistory()

const last = portfolioHistory[portfolioHistory.length - 1]
export const portfolio = {
  totalContributed: last.contributed,
  currentValue: last.value,
}

// Personalised goal ladder. `target: null` means the milestone is about a habit, not an amount.
export const milestones = [
  {
    id: 1,
    title: 'Financial breathing room',
    description: 'A starter emergency buffer based on your essential expenses.',
    target: 2000,
  },
  {
    id: 2,
    title: 'A meaningful short-term goal',
    description: 'A laptop, course fees or another specific expense.',
    target: 10000,
  },
  {
    id: 3,
    title: 'Establish an investing habit',
    description: 'A manageable, regular contribution after essentials and emergency savings.',
    target: null,
  },
  {
    id: 4,
    title: 'Grow with changing circumstances',
    description: 'Revisit the plan when income, expenses or goals change.',
    target: null,
  },
]
