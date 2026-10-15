# Person 1 — Onboarding & Goal Planner

Files in this package (copy them into the shared repo, keeping the same folders):

- src/pages/GoalPlanner.jsx
- src/utils/goalCalculations.js
- src/styles/GoalPlanner.css

Notes for Person 3 (integration):
- `import GoalPlanner from './pages/GoalPlanner'` and route it at `/goals`.
- Optional props: `initialProfile` and `onProfileChange(profile)` to share the
  financialProfile (monthlyIncome, monthlyExpenses, existingSavings,
  monthlyContribution, goalAmount, goalMonths, riskComfort) with other pages.
- All CSS classes start with `gp-`, so nothing clashes with index.css.
- No extra npm packages needed.

To preview alone: in a scratch Vite React project, put these files in `src/`
and render `<GoalPlanner />` in App.jsx.
