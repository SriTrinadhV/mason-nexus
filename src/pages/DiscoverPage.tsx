import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Building2, Compass, Users, Wrench } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { matchPeople, type PeopleMatch } from '../services/peopleService'
import { getRecommendedCommunities } from '../services/recommendationService'
import { getOpportunitiesMatchingStudent } from '../services/opportunityService'
import { studyGroups } from '../data/studyGroups'
import { communities } from '../data/communities'
import { opportunities } from '../data/opportunities'
import StudentCard from '../components/cards/StudentCard'
import CommunityCard from '../components/cards/CommunityCard'
import StudyGroupCard from '../components/cards/StudyGroupCard'
import OpportunityCard from '../components/cards/OpportunityCard'
import LoadingState from '../components/common/LoadingState'
import EmptyState from '../components/common/EmptyState'
import { joinStudyGroup } from '../services/studyGroupService'
import type { Community } from '../types'

/**
 * Discover is the "browse beyond your top recommendations" surface — Home
 * already covers "what's relevant right now" with tightly curated,
 * intent-driven lists. Every section here deliberately shows a broader pool
 * than Home's equivalent: personalized matches still surface first (ordering
 * can stay relevance-aware), but the section isn't capped to just those
 * matches the way Home's intent panels are. Catalog-fill items that aren't
 * personally recommended are shown without a fabricated "why" — the card
 * components already render reason/match text conditionally, so simply
 * omitting it here is enough to keep the distinction honest.
 */
export default function DiscoverPage() {
  const { currentUser, joinCommunity, recordOpportunityInterest } = useApp()
  const [people, setPeople] = useState<PeopleMatch[] | null>(null)
  const [, setRefreshKey] = useState(0)
  const refresh = () => setRefreshKey((k) => k + 1)

  useEffect(() => {
    setPeople(matchPeople(currentUser))
  }, [currentUser])

  const recommendedCommunities = getRecommendedCommunities(currentUser)
  const recommendedCommunityIds = new Set(recommendedCommunities.map((r) => r.community.id))
  const otherCommunities: { community: Community; reason?: string }[] = communities
    .filter((c) => !currentUser.communities.includes(c.id) && !recommendedCommunityIds.has(c.id))
    .map((community) => ({ community }))
  const browseCommunities = [...recommendedCommunities, ...otherCommunities].slice(0, 6)

  const myCourseGroups = studyGroups.filter((g) => currentUser.courses.includes(g.courseCode))
  const otherGroups = studyGroups.filter((g) => !currentUser.courses.includes(g.courseCode))
  const browseGroups = [...myCourseGroups, ...otherGroups].slice(0, 4)

  const matchedOpportunities = getOpportunitiesMatchingStudent(currentUser)
  const matchedOpportunityIds = new Set(matchedOpportunities.map((o) => o.id))
  const otherOpportunities = opportunities
    .filter((o) => !matchedOpportunityIds.has(o.id))
    .map((o) => ({ ...o, matchedSkills: [] as string[] }))
  const browseOpportunities = [...matchedOpportunities, ...otherOpportunities].slice(0, 5)

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
          Discover
        </h1>
        <p className="mt-1 text-sm text-gray-500">Browse people, communities, study groups, and opportunities beyond your top Home recommendations.</p>
      </div>

      <DiscoverSection icon={Users} title="People" viewAllTo="/discover/people">
        {!people ? (
          <LoadingState count={2} />
        ) : people.length === 0 ? (
          <EmptyState title="No matches yet" description="Add more interests or skills in Settings to find more people." />
        ) : (
          <CardGrid>
            {people.slice(0, 6).map((m) => (
              <StudentCard key={m.student.id} student={m.student} reason={m.reasonText} />
            ))}
          </CardGrid>
        )}
      </DiscoverSection>

      <DiscoverSection icon={Compass} title="Study Groups" viewAllTo="/study-groups">
        {browseGroups.length === 0 ? (
          <EmptyState title="No study groups are active yet." description="Start one from the Study Groups page." />
        ) : (
          <CardGrid>
            {browseGroups.map((g) => (
              <StudyGroupCard
                key={g.id}
                group={g}
                joined={g.memberIds.includes(currentUser.id)}
                onJoin={(id) => joinStudyGroup(id, currentUser.id).then(refresh)}
              />
            ))}
          </CardGrid>
        )}
      </DiscoverSection>

      <DiscoverSection icon={Wrench} title="Opportunities" viewAllTo="/opportunities">
        {browseOpportunities.length === 0 ? (
          <EmptyState title="No opportunities right now" description="Check back later — new requests are posted regularly." />
        ) : (
          <CardGrid>
            {browseOpportunities.map((o) => (
              <OpportunityCard
                key={o.id}
                opportunity={o}
                matchedSkills={o.matchedSkills}
                interested={o.interestedStudentIds.includes(currentUser.id)}
                onExpressInterest={(id) => recordOpportunityInterest(id).then(refresh)}
              />
            ))}
          </CardGrid>
        )}
      </DiscoverSection>

      <DiscoverSection icon={Building2} title="Communities" viewAllTo="/communities">
        {browseCommunities.length === 0 ? (
          <EmptyState title="You've joined everything in the catalog" description="Check back as new communities are created." />
        ) : (
          <CardGrid>
            {browseCommunities.map(({ community, reason }) => (
              <CommunityCard
                key={community.id}
                community={community}
                joined={currentUser.communities.includes(community.id)}
                onJoinToggle={joinCommunity}
                reason={reason}
              />
            ))}
          </CardGrid>
        )}
      </DiscoverSection>
    </div>
  )
}

function DiscoverSection({
  icon: Icon,
  title,
  viewAllTo,
  children,
}: {
  icon: React.ElementType
  title: string
  viewAllTo: string
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-mason-green-50 text-mason-green-700">
            <Icon size={16} />
          </div>
          <h2 className="font-semibold tracking-tight text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
            {title}
          </h2>
        </div>
        <Link to={viewAllTo} className="focus-ring flex items-center gap-1 text-sm font-medium text-mason-green-700 hover:underline">
          View all <ArrowRight size={14} />
        </Link>
      </div>
      {children}
    </section>
  )
}

function CardGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
}
