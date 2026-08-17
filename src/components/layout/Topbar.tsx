import { Link, useNavigate } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function Topbar() {
  const { unreadCount } = useApp()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-6">
      <Link to="/home" className="focus-ring flex items-center gap-2 lg:hidden">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-mason-green-600 text-xs font-bold text-white">
          M
        </div>
        <span className="font-semibold text-gray-900">Mason Commons</span>
      </Link>

      <button
        onClick={() => navigate('/search')}
        className="focus-ring ml-auto flex flex-1 max-w-md items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-400 hover:border-gray-300 lg:ml-0"
      >
        <Search size={15} />
        <span className="hidden sm:inline">Search communities, people, study groups…</span>
        <span className="sm:hidden">Search</span>
      </button>

      <Link
        to="/notifications"
        className="focus-ring relative ml-auto rounded-full p-2 text-gray-500 hover:bg-gray-100 lg:ml-2"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-mason-gold-500 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </Link>
    </header>
  )
}
