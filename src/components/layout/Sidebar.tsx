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

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `focus-ring group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    isActive ? 'bg-mason-green-50 text-mason-green-800' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
  }`

export default function Sidebar() {
  const { currentUser } = useApp()

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white px-4 py-6 lg:flex">
      <div className="mb-8 flex items-center gap-2.5 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-mason-green-600 text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
          M
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
          Mason Nexus
        </span>
      </div>

      <nav className="flex-1 space-y-1" aria-label="Primary">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={navLinkClass}>
            {({ isActive }) => (
              <>
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-mason-green-600 transition-opacity ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                <item.icon size={18} className={isActive ? 'text-mason-green-700' : 'text-gray-400 group-hover:text-gray-500'} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 space-y-1 border-t border-gray-100 pt-4">
        <NavLink to="/settings" className={navLinkClass}>
          {({ isActive }) => (
            <>
              <Settings size={18} className={isActive ? 'text-mason-green-700' : 'text-gray-400 group-hover:text-gray-500'} />
              Settings
            </>
          )}
        </NavLink>
        <NavLink to="/profile/me" className={navLinkClass}>
          <Avatar name={currentUser.displayName} color={currentUser.avatarColor} size="sm" />
          <span className="truncate">{currentUser.displayName}</span>
        </NavLink>
      </div>
    </aside>
  )
}
