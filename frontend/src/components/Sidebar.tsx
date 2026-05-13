import { NavLink } from 'react-router-dom'
import { Bell, ClipboardCheck, Handshake, Inbox, LayoutDashboard, PackageSearch, Plus, Search } from 'lucide-react'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition',
    isActive ? 'bg-[#1a56db] text-white shadow-[0_8px_20px_rgba(26,86,219,0.18)]' : 'text-[#434654] dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-[#003fb1] dark:hover:text-blue-400',
  ].join(' ')

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/lost-items', label: 'Lost items', icon: Search },
  { to: '/found-items', label: 'Found items', icon: Inbox },
  { to: '/matches', label: 'Matches', icon: Handshake },
  { to: '/claims', label: 'Claims', icon: ClipboardCheck },
  { to: '/notifications', label: 'Notifications', icon: Bell },
]

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen flex-col bg-[#faf8ff] dark:bg-gray-900 px-5 py-6 lg:flex transition-colors">
      <div className="mb-10 flex items-center gap-3 px-1">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#dbe1ff] dark:bg-blue-900/30 text-[#003fb1] dark:text-blue-400">
          <PackageSearch className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#003fb1] dark:text-blue-400">FoundTrust</h2>
          <p className="text-sm font-medium text-[#737686] dark:text-gray-400">Operational Portal</p>
        </div>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClass}>
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <NavLink
        to="/lost-items/new"
        className="mt-6 flex h-12 items-center justify-center gap-2 rounded-lg bg-[#003fb1] px-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(0,63,177,0.2)] transition hover:bg-[#1a56db]"
      >
        <Plus className="h-5 w-5" />
        Report New Item
      </NavLink>
    </aside>
  )
}
