import { useEffect, useState } from 'react'
import { Calendar, MessageSquare, Search as SearchIcon, Sparkles, User, Users, Wrench } from 'lucide-react'
import { search, type SearchResults } from '../services/searchService'
import SearchResultItem from '../components/cards/SearchResultItem'
import EmptyState from '../components/common/EmptyState'
import LoadingState from '../components/common/LoadingState'
import { useApp } from '../context/AppContext'

const exampleQueries = [
  'I need help understanding recursion',
  'photography',
  'looking for a hackathon team',
  'CS 310',
]

export default function SearchPage() {
  const { currentUser } = useApp()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setResults(null)
      return
    }
    setLoading(true)
    const t = setTimeout(() => {
      search(query, currentUser.id).then((r) => {
        setResults(r)
        setLoading(false)
      })
    }, 250)
    return () => clearTimeout(t)
  }, [query, currentUser.id])

  const totalResults = results
    ? results.communities.length + results.posts.length + results.students.length + results.studyGroups.length + results.opportunities.length
    : 0

  return (
    <div className="space-y-5 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
          Search
        </h1>
        <p className="mt-1 text-sm text-gray-500">Search across communities, posts, people, study groups, and opportunities.</p>
      </div>

      <div className="relative">
        <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try: I need help understanding recursion"
          className="focus-ring w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-sm"
        />
      </div>

      {!query.trim() && (
        <div>
          <p className="mb-2 text-xs font-medium text-gray-400">Try searching for</p>
          <div className="flex flex-wrap gap-2">
            {exampleQueries.map((q) => (
              <button
                key={q}
                onClick={() => setQuery(q)}
                className="focus-ring rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-sm text-gray-600 hover:border-mason-green-300"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {query.trim() && loading && <LoadingState count={4} label="Searching" />}

      {query.trim() && !loading && results && (
        <div className="space-y-6">
          {results.semanticNote && (
            <div className="flex items-start gap-2 rounded-lg bg-mason-gold-50 p-3 text-xs text-mason-gold-800">
              <Sparkles size={14} className="mt-0.5 shrink-0" />
              <span>
                <strong className="font-semibold">SIMULATED semantic search.</strong> {results.semanticNote}
              </span>
            </div>
          )}

          {totalResults === 0 ? (
            <EmptyState title="No results found" description="Try different keywords, or browse Communities and Discover instead." />
          ) : (
            <>
              {results.studyGroups.length > 0 && (
                <ResultSection icon={Calendar} title="Study Groups">
                  {results.studyGroups.map((g) => (
                    <SearchResultItem key={g.id} to="/study-groups" icon={Calendar} title={g.title} subtitle={`${g.courseCode} · ${g.meetingTime}`} />
                  ))}
                </ResultSection>
              )}
              {results.students.length > 0 && (
                <ResultSection icon={User} title="People">
                  {results.students.map((s) => (
                    <SearchResultItem key={s.id} to={`/profile/${s.id}`} icon={User} title={s.displayName} subtitle={`${s.major} · ${s.year}`} />
                  ))}
                </ResultSection>
              )}
              {results.communities.length > 0 && (
                <ResultSection icon={Users} title="Communities">
                  {results.communities.map((c) => (
                    <SearchResultItem key={c.id} to={`/communities/${c.id}`} icon={Users} title={c.name} subtitle={c.description} meta={`${c.memberCount} members`} />
                  ))}
                </ResultSection>
              )}
              {results.posts.length > 0 && (
                <ResultSection icon={MessageSquare} title="Discussions">
                  {results.posts.map((p) => (
                    <SearchResultItem key={p.id} to={`/communities/${p.communityId}`} icon={MessageSquare} title={p.title} subtitle={p.body} />
                  ))}
                </ResultSection>
              )}
              {results.opportunities.length > 0 && (
                <ResultSection icon={Wrench} title="Opportunities">
                  {results.opportunities.map((o) => (
                    <SearchResultItem key={o.id} to={`/opportunities/${o.id}`} icon={Wrench} title={o.title} subtitle={o.description} />
                  ))}
                </ResultSection>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function ResultSection({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        <Icon size={14} className="text-gray-400" />
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</h2>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}
