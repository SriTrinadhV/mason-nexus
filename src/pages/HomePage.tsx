import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Radio, Sparkles, TrendingUp, UserPlus, Users } from 'lucide-react'
import { useApp } from '../context/AppContext'
import IntentSelector, { intentIcon } from '../components/IntentSelector'
import NexusPoll from '../components/NexusPoll'
import RecommendationCard from '../components/cards/RecommendationCard'
import CommunityCard from '../components/cards/CommunityCard'
import StudentCard from '../components/cards/StudentCard'
import StudyGroupCard from '../components/cards/StudyGroupCard'
import OpportunityCard from '../components/cards/OpportunityCard'
import EmptyState from '../components/common/EmptyState'
import LoadingState from '../components/common/LoadingState'
import { getForYouFeedAsync, getIntentResultsAsync, type IntentResults } from '../services/recommendationService'
import { getNexusNowPulseAsync, getYourNextConnectionAsync, type NexusNowPulse } from '../services/nexusNowService'
import type { PeopleMatch } from '../services/peopleService'
import { joinStudyGroup } from '../services/studyGroupService'
import { getCommunityById } from '../data/communities'
import { getIntentOption } from '../data/intents'
import type { Intent, Recommendation } from '../types'

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function HomePage() {
  const { currentUser, joinCommunity } = useApp()
  const [intent, setIntent] = useState<Intent | null>(null)
  const [feed, setFeed] = useState<Recommendation[] | null>(null)
  const [pulse, setPulse] = useState<NexusNowPulse | null>(null)
  const [connections, setConnections] = useState<PeopleMatch[] | null>(null)
  const [intentResults, setIntentResults] = useState<IntentResults | null>(null)
  const [loadingIntent, setLoadingIntent] = useState(false)

  useEffect(() => {
    getForYouFeedAsync(currentUser).then(setFeed)
    getNexusNowPulseAsync().then(setPulse)
    getYourNextConnectionAsync(currentUser).then(setConnections)
  }, [currentUser])

  useEffect(() => {
    if (!intent) {
      setIntentResults(null)
      return
    }
    setLoadingIntent(true)
    getIntentResultsAsync(currentUser, intent).then((r) => {
      setIntentResults(r)
      setLoadingIntent(false)
    })
  }, [intent, currentUser])

  const refreshIntentResults = () => {
    if (!intent) return
    getIntentResultsAsync(currentUser, intent).then(setIntentResults)
  }

  const firstName = currentUser.name.split(' ')[0]
  const myCommunities = currentUser.communities.map(getCommunityById).filter((c): c is NonNullable<typeof c> => !!c)

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
          {greeting()}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-gray-500">Here's what's relevant to you right now.</p>
      </div>

      <IntentSelector value={intent} onChange={(i) => setIntent(i === intent ? null : i)} />

      {intent && (
        <IntentPanel
          intent={intent}
          loading={loadingIntent}
          results={intentResults}
          onClose={() => setIntent(null)}
          onRefresh={refreshIntentResults}
        />
      )}

      {!intent && (
        <>
          <NexusNowSection pulse={pulse} connections={connections} />

          <section>
            <SectionHeader icon={Sparkles} title="For You" subtitle="Recommendations based on what you've shared" />
            {!feed ? (
              <LoadingState count={3} label="Loading recommendations" />
            ) : feed.length === 0 ? (
              <EmptyState title="Nothing new yet" description="Complete your profile in Settings to unlock better recommendations." />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {feed.map((r) => (
                  <RecommendationCard key={r.id} recommendation={r} />
                ))}
              </div>
            )}
          </section>

          <section>
            <SectionHeader icon={Users} title="Your Communities" subtitle="Spaces you're already part of" />
            {myCommunities.length === 0 ? (
              <EmptyState
                title="You haven't joined any communities yet"
                description="Browse classes, clubs, and interest groups to find where you belong."
                action={
                  <Link to="/communities" className="focus-ring rounded-lg bg-mason-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-mason-green-700">
                    Browse communities
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {myCommunities.map((c) => (
                  <CommunityCard key={c.id} community={c} joined onJoinToggle={() => joinCommunity(c.id)} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="mb-3.5 flex items-center gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-mason-green-50 text-mason-green-700">
        <Icon size={16} />
      </div>
      <div>
        <h2 className="font-semibold tracking-tight text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
          {title}
        </h2>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  )
}

/**
 * NEXUS NOW — the campus pulse. This is the first thing a signed-in student
 * sees: what's trending, what's timely and actionable, a two-second campus
 * question, and a small number of genuinely relevant people to connect
 * with. Every card links into a real, existing surface (a community, a
 * study group, an opportunity, a profile) — nothing here is a dead end.
 */
function NexusNowSection({ pulse, connections }: { pulse: NexusNowPulse | null; connections: PeopleMatch[] | null }) {
  return (
    <section className="rounded-2xl border border-mason-green-200 bg-mason-green-50/30 p-4 sm:p-6">
      <div className="mb-4 flex items-start gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-mason-green-700 ring-1 ring-mason-green-100">
          <Radio size={18} strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="font-semibold tracking-tight text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
            Nexus Now
          </h2>
          <p className="text-xs text-gray-500">What's happening around Mason right now</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PulseList
          icon={TrendingUp}
          title="Trending at Mason"
          items={pulse?.trending}
          emptyText="Nothing trending yet — check back soon."
        />
        <PulseList
          icon={Radio}
          title="Happening Now"
          items={pulse?.happeningNow}
          emptyText="No timely activity right now."
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <NexusPoll />
        <NextConnection connections={connections} />
      </div>
    </section>
  )
}

function PulseList({
  icon: Icon,
  title,
  items,
  emptyText,
}: {
  icon: React.ElementType
  title: string
  items?: Recommendation[]
  emptyText: string
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-gray-700">
        <Icon size={15} />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {!items ? (
        <LoadingState count={2} label={`Loading ${title.toLowerCase()}`} />
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 bg-white px-3 py-4 text-center text-xs text-gray-400">{emptyText}</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <RecommendationCard key={item.id} recommendation={item} />
          ))}
        </div>
      )}
    </div>
  )
}

function NextConnection({ connections }: { connections: PeopleMatch[] | null }) {
  return (
    <div className="card flex h-full flex-col p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-mason-green-50 text-mason-green-700">
          <UserPlus size={16} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Your Next Connection</h3>
          <p className="text-xs text-gray-500">People you may genuinely want to meet</p>
        </div>
      </div>

      {!connections ? (
        <LoadingState count={1} label="Loading suggested connections" />
      ) : connections.length === 0 ? (
        <p className="flex-1 rounded-xl border border-dashed border-gray-200 bg-white px-3 py-4 text-center text-xs text-gray-400">
          Add more courses, interests, or skills in Settings to surface real matches.
        </p>
      ) : (
        <div className="flex-1 space-y-2.5">
          {connections.map((m) => (
            <StudentCard key={m.student.id} student={m.student} reason={m.reasonText} />
          ))}
        </div>
      )}
      <Link
        to="/discover/people"
        className="focus-ring mt-3 flex items-center justify-center gap-1 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600 hover:border-mason-green-300 hover:text-mason-green-700"
      >
        See more people <ArrowRight size={12} />
      </Link>
    </div>
  )
}

function IntentPanel({
  intent,
  loading,
  results,
  onClose,
  onRefresh,
}: {
  intent: Intent
  loading: boolean
  results: IntentResults | null
  onClose: () => void
  onRefresh: () => void
}) {
  const { currentUser, joinCommunity, recordOpportunityInterest } = useApp()
  const option = getIntentOption(intent)
  const Icon = intentIcon[intent]

  return (
    <section className="rounded-2xl border border-mason-green-200 bg-mason-green-50/40 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-mason-green-700 ring-1 ring-mason-green-100">
            <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{option?.label}</h2>
            <p className="text-xs text-gray-500">{option?.description}</p>
          </div>
        </div>
        <button onClick={onClose} className="focus-ring rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-white">
          Clear
        </button>
      </div>

      {loading || !results ? (
        <LoadingState count={3} label="Loading recommendations for this intent" />
      ) : (
        <div className="space-y-6">
          {results.studyGroups && (
            <IntentGroup title="Study groups for your classes">
              {results.studyGroups.length === 0 ? (
                <EmptyState title="No study groups are active for your courses yet." description="Start one to get things going." />
              ) : (
                <CardGrid>
                  {results.studyGroups.map((g) => (
                    <StudyGroupCard
                      key={g.id}
                      group={g}
                      joined={g.memberIds.includes(currentUser.id)}
                      onJoin={(id) => joinStudyGroup(id, currentUser.id).then(onRefresh)}
                    />
                  ))}
                </CardGrid>
              )}
            </IntentGroup>
          )}

          {results.classmates && results.classmates.length > 0 && (
            <IntentGroup title="Classmates you could study with">
              <CardGrid>
                {results.classmates.slice(0, 4).map((m) => (
                  <StudentCard key={m.student.id} student={m.student} reason={m.reason} />
                ))}
              </CardGrid>
            </IntentGroup>
          )}

          {results.people && results.people.length > 0 && (
            <IntentGroup title="People you may want to know">
              <CardGrid>
                {results.people.slice(0, 4).map((m) => (
                  <StudentCard key={m.student.id} student={m.student} reason={m.reasonText} />
                ))}
              </CardGrid>
            </IntentGroup>
          )}

          {results.communities && results.communities.length > 0 && (
            <IntentGroup title="Communities">
              <CardGrid>
                {results.communities.slice(0, 4).map(({ community, reason }) => (
                  <CommunityCard
                    key={community.id}
                    community={community}
                    joined={currentUser.communities.includes(community.id)}
                    onJoinToggle={joinCommunity}
                    reason={reason}
                  />
                ))}
              </CardGrid>
            </IntentGroup>
          )}

          {results.discussions && results.discussions.length > 0 && (
            <IntentGroup title="Relevant discussions">
              <div className="space-y-2">
                {results.discussions.slice(0, 4).map((p) => {
                  const community = getCommunityById(p.communityId)
                  return (
                    <Link
                      key={p.id}
                      to={`/communities/${p.communityId}`}
                      className="focus-ring flex items-start justify-between gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2.5 hover:border-mason-green-300"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">{p.title}</p>
                        <p className="text-xs text-gray-500">{community?.name}</p>
                      </div>
                      <ArrowRight size={14} className="mt-1 shrink-0 text-gray-300" />
                    </Link>
                  )
                })}
              </div>
            </IntentGroup>
          )}

          {results.opportunities && results.opportunities.length > 0 && (
            <IntentGroup title={intent === 'offer_skill' ? 'Opportunities matching your skills' : 'Collaboration opportunities'}>
              <CardGrid>
                {results.opportunities.slice(0, 4).map((o) => (
                  <OpportunityCard
                    key={o.id}
                    opportunity={o}
                    matchedSkills={o.matchedSkills}
                    interested={o.interestedStudentIds.includes(currentUser.id)}
                    onExpressInterest={(id) => recordOpportunityInterest(id).then(onRefresh)}
                  />
                ))}
              </CardGrid>
            </IntentGroup>
          )}

          {results.requesters && results.requesters.length > 0 && (
            <IntentGroup title="Students and orgs who could use your skills">
              <CardGrid>
                {results.requesters.slice(0, 4).map((r) => (
                  <StudentCard key={r.student.id} student={r.student} reason={r.reason} />
                ))}
              </CardGrid>
            </IntentGroup>
          )}
        </div>
      )}
    </section>
  )
}

function IntentGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-gray-700">{title}</h3>
      {children}
    </div>
  )
}

function CardGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
}
