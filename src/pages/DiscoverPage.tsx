import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Compass, Sparkles, Users, Wrench } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { discoverPeople, type PeopleMatch } from '../services/peopleService'
import { getRecommendedCommunities } from '../services/recommendationService'
import { getOpportunitiesMatchingStudent } from '../services/opportunityService'
import { studyGroups } from '../data/studyGroups'
import StudentCard from '../components/cards/StudentCard'
import CommunityCard from '../components/cards/CommunityCard'
import StudyGroupCard from '../components/cards/StudyGroupCard'
import OpportunityCard from '../components/cards/OpportunityCard'
import LoadingState from '../components/common/LoadingState'
import EmptyState from '../components/common/EmptyState'
import { joinStudyGroup } from '../services/studyGroupService'
import { expressInterest } from '../services/opportunityService'

export default function DiscoverPage() {
  const { currentUser, joinCommunity } = useApp()
  const [people, setPeople] = useState<PeopleMatch[] | null>(null)
  const [, setRefreshKey] = useState(0)
  const refresh = () => setRefreshKey((k) => k + 1)

  useEffect(() => {
    discoverPeople(currentUser).then(setPeople)
  }, [currentUser])

  const recommendedCommunities = getRecommendedCommunities(currentUser).slice(0, 3)
  const relevantStudyGroups = studyGroups.filter((g) => currentUser.courses.includes(g.courseCode)).slice(0, 2)
  const matchedOpportunities = getOpportunitiesMatchingStudent(currentUser).slice(0, 2)

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
        <p className="mt-1 text-sm text-gray-500">People, study groups, opportunities, and communities picked for you.</p>
      </div>

      <DiscoverSection icon={Users} title="People" viewAllTo="/discover/people">
        {!people ? (
          <LoadingState count={2} />
        ) : people.length === 0 ? (
          <EmptyState title="No matches yet" description="Add more interests or skills in Settings to find more people." />
        ) : (
          <CardGrid>
            {people.slice(0, 4).map((m) => (
              <StudentCard key={m.student.id} student={m.student} reason={m.reasonText} />
            ))}
          </CardGrid>
        )}
      </DiscoverSection>

      <DiscoverSection icon={Compass} title="Study Groups" viewAllTo="/study-groups">
        {relevantStudyGroups.length === 0 ? (
          <EmptyState title="No study groups are active for your courses yet." description="Start one from the Study Groups page." />
        ) : (
          <CardGrid>
            {relevantStudyGroups.map((g) => (
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
        {matchedOpportunities.length === 0 ? (
          <EmptyState title="No opportunities match your skills yet" description="Add skills in Settings to unlock matches." />
        ) : (
          <CardGrid>
            {matchedOpportunities.map((o) => (
              <OpportunityCard
                key={o.id}
                opportunity={o}
                matchedSkills={o.matchedSkills}
                interested={o.interestedStudentIds.includes(currentUser.id)}
                onExpressInterest={(id) => expressInterest(id, currentUser.id).then(refresh)}
              />
            ))}
          </CardGrid>
        )}
      </DiscoverSection>

      <DiscoverSection icon={Sparkles} title="Recommended Communities" viewAllTo="/communities">
        {recommendedCommunities.length === 0 ? (
          <EmptyState title="You've joined everything relevant so far" description="Check back as new communities are created." />
        ) : (
          <CardGrid>
            {recommendedCommunities.map(({ community, reason }) => (
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
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={18} className="text-mason-green-700" />
          <h2 className="font-semibold text-gray-900">{title}</h2>
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
