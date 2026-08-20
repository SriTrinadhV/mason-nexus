import { Link } from 'react-router-dom'
import type { Opportunity } from '../../types'
import Tag from '../common/Tag'
import { getStudentById } from '../../data/students'

export default function OpportunityCard({
  opportunity,
  matchedSkills,
  interested,
  onExpressInterest,
}: {
  opportunity: Opportunity
  matchedSkills?: string[]
  interested?: boolean
  onExpressInterest?: (id: string) => void
}) {
  const poster = getStudentById(opportunity.postedBy)

  return (
    <div className="card-hover flex flex-col p-4">
      <Link to={`/opportunities/${opportunity.id}`} className="focus-ring rounded">
        <h3 className="font-semibold text-gray-900">{opportunity.title}</h3>
      </Link>
      <p className="line-clamp-2 my-2 text-sm text-gray-600">{opportunity.description}</p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {opportunity.requiredSkills.map((skill) => (
          <Tag key={skill} tone={matchedSkills?.includes(skill) ? 'green' : 'neutral'}>
            {skill}
          </Tag>
        ))}
      </div>
      {matchedSkills && matchedSkills.length > 0 && (
        <p className="mb-3 text-xs font-medium text-mason-green-700">
          Matches your {matchedSkills.join(', ')} skill{matchedSkills.length > 1 ? 's' : ''}.
        </p>
      )}
      <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
        <span>
          {opportunity.communityContext} · posted by {poster?.displayName ?? 'a student'}
        </span>
      </div>
      {onExpressInterest && (
        <button
          onClick={() => onExpressInterest(opportunity.id)}
          disabled={interested}
          className={`focus-ring mt-3 rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed ${
            interested
              ? 'bg-mason-green-50 text-mason-green-700 ring-1 ring-inset ring-mason-green-200'
              : 'bg-mason-green-600 text-white hover:bg-mason-green-700'
          }`}
        >
          {interested ? "You're interested" : "I'm interested"}
        </button>
      )}
    </div>
  )
}
