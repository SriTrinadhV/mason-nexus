import { Link } from 'react-router-dom'
import { Calendar, CheckCircle2, MessageSquare, Sparkles, UserPlus, Users, Wrench } from 'lucide-react'
import type { AppNotification } from '../../types'

const typeIcon: Record<AppNotification['type'], React.ElementType> = {
  reply: MessageSquare,
  study_group: Calendar,
  community_recommendation: Sparkles,
  collaboration_interest: UserPlus,
  opportunity_match: Wrench,
  community_joined: Users,
  interest_recorded: CheckCircle2,
}

export default function NotificationItem({
  notification,
  onRead,
}: {
  notification: AppNotification
  onRead: (id: string) => void
}) {
  const Icon = typeIcon[notification.type]
  const content = (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 transition ${
        notification.read
          ? 'border-gray-100 bg-white hover:border-gray-200'
          : 'border-mason-green-200 bg-mason-green-50/50 hover:border-mason-green-300'
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ${
          notification.read ? 'bg-white text-gray-400 ring-gray-100' : 'bg-white text-mason-green-700 ring-mason-green-100'
        }`}
      >
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${notification.read ? 'font-medium text-gray-700' : 'font-semibold text-gray-900'}`}>{notification.title}</p>
        <p className="mt-0.5 text-sm text-gray-500">{notification.body}</p>
        <p className="mt-1 text-xs text-gray-400">{notification.createdAt}</p>
      </div>
      {!notification.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-mason-green-500" aria-label="Unread" />}
    </div>
  )

  if (notification.linkTo) {
    return (
      <Link to={notification.linkTo} onClick={() => onRead(notification.id)} className="focus-ring block rounded-xl">
        {content}
      </Link>
    )
  }
  return (
    <button onClick={() => onRead(notification.id)} className="focus-ring block w-full text-left rounded-xl">
      {content}
    </button>
  )
}
