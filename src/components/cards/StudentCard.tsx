import { Link } from 'react-router-dom'
import type { Student } from '../../types'
import Avatar from '../common/Avatar'
import Tag from '../common/Tag'

export default function StudentCard({
  student,
  reason,
  availableFor,
}: {
  student: Student
  reason?: string
  availableFor?: string[]
}) {
  return (
    <div className="card-hover flex flex-col p-4">
      <Link to={`/profile/${student.id}`} className="focus-ring flex items-center gap-3 rounded">
        <Avatar name={student.displayName} color={student.avatarColor} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
            {student.displayName}
          </p>
          <p className="truncate text-xs text-gray-500">
            {student.major} · {student.year}
          </p>
        </div>
      </Link>
      {reason && (
        <p className="mt-3 rounded-lg bg-mason-green-50/70 px-2.5 py-1.5 text-xs font-medium text-mason-green-800">{reason}</p>
      )}
      {(availableFor ?? student.availableFor).length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-medium text-gray-400">Available for</p>
          <div className="flex flex-wrap gap-1.5">
            {(availableFor ?? student.availableFor).map((a) => (
              <Tag key={a} tone="green">
                {a}
              </Tag>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
