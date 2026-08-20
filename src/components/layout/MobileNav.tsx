import { NavLink } from 'react-router-dom'
import { Compass, Home, Search, User, Users } from 'lucide-react'

const navItems = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/communities', label: 'Communities', icon: Users },
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/profile/me', label: 'Profile', icon: User },
]

export default function MobileNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `focus-ring relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition ${
              isActive ? 'text-mason-green-700' : 'text-gray-500'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                aria-hidden="true"
                className={`absolute top-0 h-0.5 w-8 rounded-full bg-mason-green-600 transition-opacity ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <item.icon size={20} strokeWidth={isActive ? 2.4 : 2} />
              {item.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
