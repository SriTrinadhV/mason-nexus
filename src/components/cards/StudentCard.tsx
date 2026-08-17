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
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 transition hover:border-gray-300 hover:shadow-sm">
      <Link to={`/profile/${student.id}`} className="focus-ring flex items-center gap-3 rounded">
        <Avatar name={student.displayName} color={student.avatarColor} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-gray-900">{student.displayName}</p>
          <p className="truncate text-xs text-gray-500">
            {student.major} · {student.year}
          </p>
        </div>
      </Link>
      {reason && <p className="mt-3 text-xs font-medium text-mason-green-700">{reason}</p>}
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
