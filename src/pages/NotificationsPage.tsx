import { Bell } from 'lucide-react'
import { useApp } from '../context/AppContext'
import NotificationItem from '../components/cards/NotificationItem'
import EmptyState from '../components/common/EmptyState'

export default function NotificationsPage() {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useApp()

  return (
    <div className="max-w-2xl space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
            Notifications
          </h1>
          <p className="mt-1 text-sm text-gray-500">{unreadCount > 0 ? `${unreadCount} unread` : 'You\'re all caught up'}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllNotificationsRead} className="focus-ring rounded-lg px-3 py-1.5 text-sm font-medium text-mason-green-700 hover:bg-mason-green-50">
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={<Bell size={28} />} title="No notifications yet" description="We'll let you know when something relevant happens." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} onRead={markNotificationRead} />
          ))}
        </div>
      )}
    </div>
  )
}
