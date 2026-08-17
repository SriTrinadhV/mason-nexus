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
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 transition hover:border-gray-300 hover:shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <Tag tone="green" className="mb-2">
            {group.courseCode}
          </Tag>
          <h3 className="font-semibold text-gray-900">{group.title}</h3>
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
          className="focus-ring mt-auto rounded-lg bg-mason-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-mason-green-700 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
        >
          {joined ? 'You’re in this group' : isFull ? 'Group is full' : 'Join group'}
        </button>
      )}
    </div>
  )
}
