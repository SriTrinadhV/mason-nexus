import { useEffect, useState } from 'react'
import { Sparkles, Wrench } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { listOpportunities, matchingSkills } from '../services/opportunityService'
import OpportunityCard from '../components/cards/OpportunityCard'
import EmptyState from '../components/common/EmptyState'
import LoadingState from '../components/common/LoadingState'
import type { Opportunity } from '../types'

export default function OpportunitiesPage() {
  const { currentUser, recordOpportunityInterest } = useApp()
  const [opportunities, setOpportunities] = useState<Opportunity[] | null>(null)
  const [onlyMatches, setOnlyMatches] = useState(false)

  const load = () => listOpportunities().then(setOpportunities)

  useEffect(() => {
    load()
  }, [])

  const list = (opportunities ?? []).filter((o) => !onlyMatches || matchingSkills(currentUser, o).length > 0)

  return (
    <div className="space-y-5 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Opportunities</h1>
        <p className="mt-1 text-sm text-gray-500">Peer collaboration requests from students and student organizations — not paid gig work.</p>
      </div>

      <button
        onClick={() => setOnlyMatches((v) => !v)}
        className={`focus-ring flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
          onlyMatches ? 'bg-mason-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-mason-green-300'
        }`}
      >
        <Sparkles size={14} /> Matches your skills
      </button>

      {!opportunities ? (
        <LoadingState count={3} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={<Wrench size={28} />}
          title={onlyMatches ? 'No opportunities match your skills yet' : 'No opportunities right now'}
          description={onlyMatches ? 'Add more skills in Settings, or check back later.' : 'Check back soon — new requests are posted regularly.'}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((o) => {
            const matched = matchingSkills(currentUser, o)
            return (
              <OpportunityCard
                key={o.id}
                opportunity={o}
                matchedSkills={matched}
                interested={o.interestedStudentIds.includes(currentUser.id)}
                onExpressInterest={(id) => recordOpportunityInterest(id).then(load)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
