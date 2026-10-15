import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Sidebar from './Sidebar.jsx'

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <div className="shell">
      <Navbar menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((o) => !o)} />
      <div className="shell-body">
        <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
        {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} />}
        <main className="main" id="main">
          <div className="page">
            <Outlet />
          </div>
          <p className="disclaimer">
            Educational prototype with simulated data. Projected returns are uncertain,
            investments can lose value, and nothing here is personalised investment advice.
          </p>
        </main>
      </div>
    </div>
  )
}
