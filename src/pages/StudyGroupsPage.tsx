import { useEffect, useState } from 'react'
import { Plus, Users } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { listStudyGroups, joinStudyGroup, getSeekersForCourse } from '../services/studyGroupService'
import { getStudentById } from '../data/students'
import { courseOptions } from '../data/options'
import StudyGroupCard from '../components/cards/StudyGroupCard'
import CreateStudyGroupModal from '../components/CreateStudyGroupModal'
import EmptyState from '../components/common/EmptyState'
import LoadingState from '../components/common/LoadingState'
import Avatar from '../components/common/Avatar'
import type { StudyGroup } from '../types'

export default function StudyGroupsPage() {
  const { currentUser } = useApp()
  const [groups, setGroups] = useState<StudyGroup[] | null>(null)
  const [courseFilter, setCourseFilter] = useState<string>('all')
  const [createOpen, setCreateOpen] = useState(false)

  const load = () => listStudyGroups().then(setGroups)

  useEffect(() => {
    load()
  }, [])

  const myCourseOptions = ['all', ...currentUser.courses, ...courseOptions.filter((c) => !currentUser.courses.includes(c))]
  const filtered = (groups ?? []).filter((g) => courseFilter === 'all' || g.courseCode === courseFilter)
  const seekers = courseFilter !== 'all' ? getSeekersForCourse(courseFilter) : []

  return (
    <div className="space-y-5 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Study Groups</h1>
          <p className="mt-1 text-sm text-gray-500">Find a group, or start one for your course.</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="focus-ring flex items-center justify-center gap-1.5 rounded-lg bg-mason-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-mason-green-700"
        >
          <Plus size={16} /> Start a group
        </button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto">
        {[...new Set(myCourseOptions)].map((c) => (
          <button
            key={c}
            onClick={() => setCourseFilter(c)}
            className={`focus-ring shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              courseFilter === c ? 'bg-mason-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-mason-green-300'
            }`}
          >
            {c === 'all' ? 'All courses' : c}
          </button>
        ))}
      </div>

      {seekers.length > 0 && (
        <div className="rounded-xl border border-mason-gold-200 bg-mason-gold-50 p-4">
          <p className="mb-2 text-sm font-medium text-mason-gold-800">
            {seekers.length} student{seekers.length > 1 ? 's are' : ' is'} currently looking for a {courseFilter} study partner
          </p>
          <div className="flex -space-x-2">
            {seekers.map((s) => {
              const student = getStudentById(s.studentId)
              if (!student) return null
              return <Avatar key={s.studentId} name={student.displayName} color={student.avatarColor} size="sm" className="ring-2 ring-mason-gold-50" />
            })}
          </div>
        </div>
      )}

      {!groups ? (
        <LoadingState count={3} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users size={28} />}
          title="No study groups are active for this course yet."
          description="Start one and other students will be able to find it."
          action={
            <button onClick={() => setCreateOpen(true)} className="focus-ring rounded-lg bg-mason-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-mason-green-700">
              Start one
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((g) => (
            <StudyGroupCard
              key={g.id}
              group={g}
              joined={g.memberIds.includes(currentUser.id)}
              onJoin={(id) => joinStudyGroup(id, currentUser.id).then(load)}
            />
          ))}
        </div>
      )}

      <CreateStudyGroupModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        defaultCourse={courseFilter !== 'all' ? courseFilter : currentUser.courses[0]}
        onCreated={load}
      />
    </div>
  )
}
