import { NavLink } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/lost-items', label: 'Lost Items' },
  { to: '/found-items', label: 'Found Items' },
  { to: '/matches', label: 'Matches' },
  { to: '/claims', label: 'Claims' },
  { to: '/notifications', label: 'Notifications' },
]

export function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Primary navigation">
      {links.map((link) => (
        <NavLink key={link.to} to={link.to}>
          {link.label}
        </NavLink>
      ))}
    </aside>
  )
}
