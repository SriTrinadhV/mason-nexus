import { NavLink } from 'react-router-dom'
import { Compass, Home, Search, Settings, Users } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Avatar from '../common/Avatar'

const navItems = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/communities', label: 'Communities', icon: Users },
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/search', label: 'Search', icon: Search },
]

export default function Sidebar() {
  const { currentUser } = useApp()

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-200 bg-white px-3 py-5 lg:flex">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-mason-green-600 text-sm font-bold text-white">
          M
        </div>
        <span className="font-semibold text-gray-900">Mason Commons</span>
      </div>

      <nav className="flex-1 space-y-1" aria-label="Primary">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `focus-ring flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive ? 'bg-mason-green-50 text-mason-green-800' : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 space-y-1 border-t border-gray-100 pt-4">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `focus-ring flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive ? 'bg-mason-green-50 text-mason-green-800' : 'text-gray-600 hover:bg-gray-50'
            }`
          }
        >
          <Settings size={18} />
          Settings
        </NavLink>
        <NavLink
          to="/profile/me"
          className={({ isActive }) =>
            `focus-ring flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive ? 'bg-mason-green-50 text-mason-green-800' : 'text-gray-600 hover:bg-gray-50'
            }`
          }
        >
          <Avatar name={currentUser.displayName} color={currentUser.avatarColor} size="sm" />
          <span className="truncate">{currentUser.displayName}</span>
        </NavLink>
      </div>
    </aside>
  )
}
