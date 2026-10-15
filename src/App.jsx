import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import GoalPlanner from './pages/GoalPlanner.jsx'
import InvestmentPlanner from './pages/InvestmentPlanner.jsx'
import Simulator from './pages/Simulator.jsx'

// Person 3 owns routing. Persons 1 & 2 only need to export a default component
// from their page file - no changes to this file are required.
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/goals" element={<GoalPlanner />} />
        <Route path="/investments" element={<InvestmentPlanner />} />
        <Route path="/simulator" element={<Simulator />} />
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  )
}
