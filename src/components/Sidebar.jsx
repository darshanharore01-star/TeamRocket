import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Target, TrendingUp, Activity } from 'lucide-react'

const links = [
  { to: '/', label: 'My money', hint: 'Progress at a glance', icon: LayoutDashboard, end: true },
  { to: '/goals', label: 'Goal planner', hint: 'What you can set aside', icon: Target },
  { to: '/investments', label: 'Investment planner', hint: 'Compare your options', icon: TrendingUp },
  { to: '/simulator', label: 'When markets fall', hint: 'Practise the decision', icon: Activity },
]

export default function Sidebar({ open, onNavigate }) {
  return (
    <nav className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Main">
      <ul>
        {links.map(({ to, label, hint, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>
                <strong>{label}</strong>
                <small>{hint}</small>
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
