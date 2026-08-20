import { Clock, MapPin, Users } from 'lucide-react'
import type { StudyGroup } from '../../types'
import Tag from '../common/Tag'

export default function StudyGroupCard({
  group,
  joined,
  onJoin,
}: {
  group: StudyGroup
  joined: boolean
  onJoin?: (id: string) => void
}) {
  const isFull = group.memberIds.length >= group.capacity

  return (
    <div className="card-hover flex flex-col p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <Tag tone="green" className="mb-2">
            {group.courseCode}
          </Tag>
          <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
            {group.title}
          </h3>
        </div>
      </div>
      <p className="line-clamp-2 mb-3 text-sm text-gray-600">{group.description}</p>
      <div className="mb-3 space-y-1.5 text-sm text-gray-600">
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-gray-400" /> {group.meetingTime}
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin size={14} className="text-gray-400" /> {group.location}
        </div>
        <div className="flex items-center gap-1.5">
          <Users size={14} className="text-gray-400" /> {group.memberIds.length}/{group.capacity} members
        </div>
      </div>
      {onJoin && (
        <button
          onClick={() => onJoin(group.id)}
          disabled={joined || isFull}
          className={`focus-ring mt-auto rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed ${
            joined
              ? 'bg-mason-green-50 text-mason-green-700 ring-1 ring-inset ring-mason-green-200'
              : isFull
                ? 'bg-gray-100 text-gray-400'
                : 'bg-mason-green-600 text-white hover:bg-mason-green-700'
          }`}
        >
          {joined ? 'You’re in this group' : isFull ? 'Group is full' : 'Join group'}
        </button>
      )}
    </div>
  )
}
