import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { discoverPeople, type PeopleMatch } from '../services/peopleService'
import StudentCard from '../components/cards/StudentCard'
import LoadingState from '../components/common/LoadingState'
import EmptyState from '../components/common/EmptyState'

type FilterKey = 'all' | 'classes' | 'interests' | 'skills'

export default function PeoplePage() {
  const { currentUser } = useApp()
  const [people, setPeople] = useState<PeopleMatch[] | null>(null)
  const [filter, setFilter] = useState<FilterKey>('all')

  useEffect(() => {
    discoverPeople(currentUser).then(setPeople)
  }, [currentUser])

  const filtered = (people ?? []).filter((m) => {
    if (filter === 'classes') return m.sharedClasses.length > 0
    if (filter === 'interests') return m.sharedInterests.length > 0
    if (filter === 'skills') return m.sharedSkills.length > 0
    return true
  })

  return (
    <div className="space-y-5 pb-8">
      <Link to="/discover" className="focus-ring inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800">
        <ArrowLeft size={15} /> Discover
      </Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
          People
        </h1>
        <p className="mt-1 text-sm text-gray-500">Students who share your classes, interests, skills, or communities.</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(
          [
            { id: 'all', label: 'All' },
            { id: 'classes', label: 'Shared classes' },
            { id: 'interests', label: 'Shared interests' },
            { id: 'skills', label: 'Shared skills' },
          ] as { id: FilterKey; label: string }[]
        ).map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`focus-ring rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              filter === f.id ? 'bg-mason-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-mason-green-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!people ? (
        <LoadingState count={4} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No matches here yet" description="Try a different filter, or add more to your profile in Settings." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <StudentCard key={m.student.id} student={m.student} reason={m.reasonText} />
          ))}
        </div>
      )}
    </div>
  )
}
