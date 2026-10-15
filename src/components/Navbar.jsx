import { Link } from 'react-router-dom'
import { Menu, X, Navigation } from 'lucide-react'
import { financialProfile } from '../data/mockData.js'

export default function Navbar({ menuOpen, onToggleMenu }) {
  const initial = financialProfile.name.charAt(0)

  return (
    <header className="navbar">
      <button
        className="icon-btn menu-toggle"
        onClick={onToggleMenu}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <Link to="/" className="brand" aria-label="PaisaPilot home">
        <span className="brand-mark">
          <Navigation size={16} strokeWidth={2.5} />
        </span>
        <span className="brand-name">PaisaPilot</span>
      </Link>

      <div className="navbar-right">
        <span className="profile-name">{financialProfile.name}</span>
        <span className="avatar" aria-hidden="true">{initial}</span>
      </div>
    </header>
  )
}
