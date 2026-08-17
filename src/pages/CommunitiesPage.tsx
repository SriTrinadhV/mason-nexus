import { useEffect, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useApp } from '../context/AppContext'
import CommunityCard from '../components/cards/CommunityCard'
import EmptyState from '../components/common/EmptyState'
import LoadingState from '../components/common/LoadingState'
import CreateCommunityModal from '../components/CreateCommunityModal'
import { listCommunities } from '../services/communityService'
import type { Community, CommunityCategory } from '../types'

const categoryTabs: { id: CommunityCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'class', label: 'Classes' },
  { id: 'club', label: 'Clubs' },
  { id: 'interest', label: 'Interests' },
]

export default function CommunitiesPage() {
  const { currentUser, joinCommunity, leaveCommunity } = useApp()
  const [category, setCategory] = useState<CommunityCategory | 'all'>('all')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Community[] | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    setResults(null)
    const t = setTimeout(() => {
      listCommunities({ category: category === 'all' ? undefined : category, query: query || undefined }).then(setResults)
    }, 150)
    return () => clearTimeout(t)
  }, [category, query])

  return (
    <div className="space-y-5 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communities</h1>
          <p className="mt-1 text-sm text-gray-500">Classes, clubs, and interest groups across GMU.</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="focus-ring flex items-center justify-center gap-1.5 rounded-lg bg-mason-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-mason-green-700"
        >
          <Plus size={16} /> Create Community
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search communities..."
            className="focus-ring w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {categoryTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategory(tab.id)}
              className={`focus-ring shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                category === tab.id ? 'bg-mason-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-mason-green-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {!results ? (
        <LoadingState count={4} label="Loading communities" />
      ) : results.length === 0 ? (
        <EmptyState
          title="No communities match your search"
          description="Try a different search term, or create a new community."
          action={
            <button
              onClick={() => setCreateOpen(true)}
              className="focus-ring rounded-lg bg-mason-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-mason-green-700"
            >
              Create Community
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((c) => (
            <CommunityCard
              key={c.id}
              community={c}
              joined={currentUser.communities.includes(c.id)}
              onJoinToggle={(id) => (currentUser.communities.includes(id) ? leaveCommunity(id) : joinCommunity(id))}
            />
          ))}
        </div>
      )}

      <CreateCommunityModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
