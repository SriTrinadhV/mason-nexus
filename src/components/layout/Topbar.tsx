import { Link, useNavigate } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function Topbar() {
  const { unreadCount } = useApp()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-200 bg-white/85 px-4 py-3 backdrop-blur-md lg:px-8 lg:py-4">
      <Link to="/home" className="focus-ring flex items-center gap-2 lg:hidden">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-mason-green-600 text-xs font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
          M
        </div>
        <span className="text-[15px] font-semibold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
          Mason Commons
        </span>
      </Link>

      <button
        onClick={() => navigate('/search')}
        className="focus-ring ml-auto flex max-w-md flex-1 items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-400 transition hover:border-mason-green-200 hover:bg-white lg:ml-0"
      >
        <Search size={15} />
        <span className="hidden sm:inline">Search communities, people, study groups…</span>
        <span className="sm:hidden">Search</span>
      </button>

      <Link
        to="/notifications"
        className="focus-ring relative ml-auto rounded-full p-2.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 lg:ml-2"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-mason-green-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </Link>
    </header>
  )
}
