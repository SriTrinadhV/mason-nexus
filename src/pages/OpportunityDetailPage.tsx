import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getOpportunity, matchingSkills, getRecommendedPeopleForOpportunity } from '../services/opportunityService'
import { getStudentById } from '../services/dataStore'
import StudentCard from '../components/cards/StudentCard'
import Tag from '../components/common/Tag'
import Avatar from '../components/common/Avatar'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import type { Opportunity } from '../types'

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { currentUser, recordOpportunityInterest } = useApp()
  const [opportunity, setOpportunity] = useState<Opportunity | null | undefined>(undefined)

  const load = () => {
    if (!id) return
    getOpportunity(id).then((o) => setOpportunity(o ?? null))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (opportunity === undefined) return <LoadingState count={2} />
  if (opportunity === null) return <ErrorState title="We couldn't load this opportunity." onRetry={load} />

  const poster = getStudentById(opportunity.postedBy)
  const matched = matchingSkills(currentUser, opportunity)
  const interested = opportunity.interestedStudentIds.includes(currentUser.id)
  const recommendedPeople = getRecommendedPeopleForOpportunity(opportunity).filter((p) => p.student.id !== currentUser.id)

  return (
    <div className="space-y-5 pb-8">
      <Link to="/opportunities" className="focus-ring inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800">
        <ArrowLeft size={15} /> Opportunities
      </Link>

      <div className="card p-5">
        <h1 className="mb-2 text-xl font-bold tracking-tight text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
          {opportunity.title}
        </h1>
        <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
          {poster && <Avatar name={poster.displayName} color={poster.avatarColor} size="sm" />}
          <span>
            {poster?.displayName} · {opportunity.communityContext} · {opportunity.createdAt}
          </span>
        </div>
        <p className="mb-4 text-sm text-gray-600">{opportunity.description}</p>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {opportunity.requiredSkills.map((skill) => (
            <Tag key={skill} tone={matched.includes(skill) ? 'green' : 'neutral'}>
              {skill}
            </Tag>
          ))}
        </div>
        {matched.length > 0 && (
          <p className="mb-4 flex items-center gap-1.5 text-sm font-medium text-mason-green-700">
            <Sparkles size={14} className="text-mason-gold-500" />
            Matches your {matched.join(', ')} skill{matched.length > 1 ? 's' : ''}.
          </p>
        )}
        <button
          onClick={() => recordOpportunityInterest(opportunity.id).then(load)}
          disabled={interested}
          className={`focus-ring rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed ${
            interested
              ? 'bg-mason-green-50 text-mason-green-700 ring-1 ring-inset ring-mason-green-200'
              : 'bg-mason-green-600 text-white hover:bg-mason-green-700'
          }`}
        >
          {interested ? "You're interested" : "I'm interested"}
        </button>
      </div>

      {opportunity.interestedStudentIds.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-gray-700">Interested students</h2>
          <div className="flex flex-wrap gap-2">
            {opportunity.interestedStudentIds.map((sid) => {
              const s = getStudentById(sid)
              // Same discoverability rule as everywhere else people are
              // surfaced (People discovery/matching/search) — a student who
              // turned off "discoverable in People discovery" shouldn't be
              // named in this public list either. Their interest is still
              // recorded (interestedStudentIds is untouched); they're just
              // not displayed here. The current user always sees themself.
              if (!s || (s.discoverable === false && s.id !== currentUser.id)) return null
              return (
                <div key={sid} className="flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1 pl-1 pr-3 text-sm">
                  <Avatar name={s.displayName} color={s.avatarColor} size="sm" />
                  {s.displayName}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {recommendedPeople.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <Sparkles size={15} className="text-mason-gold-500" />
            <h2 className="text-sm font-semibold text-gray-700">Recommended people for this opportunity</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedPeople.slice(0, 4).map((r) => (
              <StudentCard
                key={r.student.id}
                student={r.student}
                reason={`Matches ${r.matchedSkills.join(', ')} skill${r.matchedSkills.length > 1 ? 's' : ''}.`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
