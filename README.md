# PaisaPilot

Minimalist, student-first financial planning prototype (React + Vite, simulated data, no backend).

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed in the terminal (usually http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Team ownership

| Files | Owner |
| --- | --- |
| `pages/GoalPlanner.jsx` | Person 1 |
| `pages/InvestmentPlanner.jsx`, `pages/Simulator.jsx` | Person 2 |
| `pages/Dashboard.jsx`, `components/*`, `App.jsx`, `main.jsx`, `index.css`, `package.json` | Person 3 |
| `data/mockData.js`, `utils/calculations.js` | Shared - agree on changes before editing |

## Routes

`/` Dashboard · `/goals` Goal Planner · `/investments` Investment Planner · `/simulator` Simulator

## Rules for page owners

- Export a default React component from your page file.
- Use the shared CSS classes/tokens in `index.css` (`.card`, `.btn`, `.page-title`, `.grid-2`, `--ink`, `--saffron` ...). Do not add a separate theme.
- Use the field names in `data/mockData.js` (`monthlyIncome`, `monthlyExpenses`, `existingSavings`, `monthlyContribution`, `goalAmount`, `goalMonths`).
- Add new math to `utils/calculations.js` as pure functions.

All figures are simulated. This is an educational prototype, not investment advice.
