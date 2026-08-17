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
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `focus-ring flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
              isActive ? 'text-mason-green-700' : 'text-gray-500'
            }`
          }
        >
          <item.icon size={20} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
