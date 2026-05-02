import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="navbar">
      <Link to="/dashboard" className="brand">
        Smart Lost & Found
      </Link>
      <div className="navbar-actions">
        {user ? <span>{user.name}</span> : <Link to="/login">Login</Link>}
        {user ? (
          <button type="button" className="ghost-button" onClick={logout}>
            Logout
          </button>
        ) : null}
      </div>
    </header>
  )
}
