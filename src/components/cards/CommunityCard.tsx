import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import type { Community } from '../../types'
import Tag from '../common/Tag'
import { getCommunityAccent } from '../../utils/colorMap'

export default function CommunityCard({
  community,
  joined,
  onJoinToggle,
  reason,
}: {
  community: Community
  joined: boolean
  onJoinToggle?: (id: string) => void
  reason?: string
}) {
  const accent = getCommunityAccent(community.color)

  return (
    <div className="card-hover flex flex-col p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <Link to={`/communities/${community.id}`} className="focus-ring rounded min-w-0">
          <div className={`mb-2 inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${accent.badge}`}>
            {community.category}
          </div>
          <h3 className="truncate font-semibold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
            {community.name}
          </h3>
        </Link>
        {onJoinToggle && (
          <button
            onClick={() => onJoinToggle(community.id)}
            className={`focus-ring shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              joined
                ? 'bg-mason-green-50 text-mason-green-700 ring-1 ring-inset ring-mason-green-200 hover:bg-mason-green-100'
                : 'bg-mason-green-600 text-white hover:bg-mason-green-700'
            }`}
          >
            {joined ? 'Joined' : 'Join'}
          </button>
        )}
      </div>
      <p className="line-clamp-2 mb-3 text-sm text-gray-600">{community.description}</p>
      {reason && (
        <p className="mb-3 text-xs font-medium text-mason-green-700">{reason}</p>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
          <Users size={13} /> {community.memberCount}
        </span>
        {community.tags.slice(0, 2).map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
    </div>
  )
}
