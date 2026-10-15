# PaisaPilot: Person 2 module (Investment Planner + Market Simulator)

## What is in this zip

    src/pages/InvestmentPlanner.jsx    route /investments
    src/pages/Simulator.jsx            route /simulator
    src/components/StockLookup.jsx     optional live stock lookup (Alpha Vantage)
    src/data/investmentOptions.js      the six options, fund names to look up, crash periods
    src/utils/investmentCalcs.js       projections, shortlist logic, simulator maths
    src/utils/mfApi.js                 real fund data from MFAPI.in (no key needed)
    src/utils/stockApi.js              Alpha Vantage helper (needs the key in .env)
    src/utils/useLiveOptions.js        React hook that loads the real data
    src/styles/investment.css          styles, every class starts with pp2-
    .env.example                       copy to .env and add your key

All new files, so nothing conflicts with Person 1 or Person 3. Both pages work without props;
later Person 3 can pass the shared profile: <InvestmentPlanner profile={financialProfile} />.

## Where the data comes from

- Index, balanced, liquid and gold options: real past returns and worst falls computed from
  daily fund prices (NAVs) via https://api.mfapi.in (free, no key, AMFI data). Funds are found
  by name search at runtime and the card shows the exact fund it matched.
- Savings account and recurring deposit: no free API exists. Fixed rates in investmentOptions.js,
  marked on the card. Replace them with a bank's published rate.
- Simulator: "Real: COVID-19 crash" and "Real: 2008" replay the actual Nifty 50 index fund prices,
  including what really happened in the following 12 months.
- Stock lookup (optional): Alpha Vantage, about 25 requests a day on the free key.
- If any call fails, the app falls back to the illustrative numbers and says so on screen.
- Results are cached in the browser for a day.

## First run: 3 checks (this code was not tested against the live internet)

1. `npm run dev`, open /investments. The banner should say "Returns and falls below come from
   real fund prices". If it says "illustrative", open the browser console (F12) and look at the
   Network tab for api.mfapi.in errors.
2. Read the "Real data: ..." line on each card. If a fund name is not the one you want, edit
   `query`, `include` or `exclude` for that option in investmentOptions.js.
3. Open /simulator. You should see "Real: COVID-19 crash, 2020" buttons. If not, the matched index
   fund may be too new to cover that date. Change its query to an older Nifty 50 index fund.

## Alpha Vantage key

    cp .env.example .env        # then paste your key into .env
    echo ".env" >> .gitignore   # if it is not already ignored

Restart `npm run dev` after creating .env. Vite bundles VITE_ variables into the public site,
so on a deployed site anyone can read the key. Fine for a free hackathon key; otherwise move the
call into a serverless function. On Vercel, add the same variable under Project, Settings,
Environment Variables.

## Git: push your work on your own branch

    git clone https://github.com/darshanharore01-star/TeamRocket.git
    cd TeamRocket
    git checkout main
    git pull origin main
    git checkout -b feature/investments

Copy the folders from this zip into the repo's src/ folder, then:

    npm install
    npm run dev
    git add src .env.example
    git commit -m "Add investment planner and market simulator with real fund data"
    git push -u origin feature/investments

Run `git status` before committing and make sure .env is NOT listed. Then open a Pull Request
from feature/investments into main on GitHub; Person 3 merges it.

## Publish publicly (after everything is merged into main)

1. `npm run build` must pass on main.
2. vercel.com, sign in with GitHub, Add New, Project, import TeamRocket, Deploy.
3. If refreshing /simulator shows a 404, add vercel.json in the project root (Person 3):
   {"rewrites":[{"source":"/(.*)","destination":"/"}]}
