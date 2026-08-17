import { Link } from 'react-router-dom'
import { Calendar, MessageSquare, Sparkles, UserPlus, Users, Wrench } from 'lucide-react'
import type { Recommendation } from '../../types'

const kindIcon: Record<Recommendation['kind'], React.ElementType> = {
  community: Users,
  person: UserPlus,
  study_group: Users,
  opportunity: Wrench,
  discussion: MessageSquare,
  event: Calendar,
}

export default function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const Icon = kindIcon[recommendation.kind]
  return (
    <Link
      to={recommendation.linkTo}
      className="focus-ring flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-mason-green-300 hover:shadow-sm"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-mason-green-50 text-mason-green-700">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">{recommendation.title}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
          <Sparkles size={12} className="text-mason-gold-500" />
          {recommendation.reason}
        </p>
      </div>
    </Link>
  )
}
