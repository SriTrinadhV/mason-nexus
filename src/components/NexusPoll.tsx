import { Check, HelpCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { activePoll } from '../data/polls'

export default function NexusPoll() {
  const { pollVoteCounts, myPollVote, voteInPoll } = useApp()
  const totalVotes = activePoll.options.reduce((sum, opt) => sum + (pollVoteCounts[opt.id] ?? 0), 0)
  const hasVoted = myPollVote !== null

  return (
    <div className="card flex h-full flex-col p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-mason-green-50 text-mason-green-700">
          <HelpCircle size={16} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Campus Question</h3>
          <p className="text-xs text-gray-500">Takes two seconds</p>
        </div>
      </div>

      <p className="mb-3 text-sm font-medium text-gray-900">{activePoll.question}</p>

      <div className="space-y-1.5" role="radiogroup" aria-label={activePoll.question}>
        {activePoll.options.map((option) => {
          const count = pollVoteCounts[option.id] ?? 0
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
          const isMine = myPollVote === option.id

          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isMine}
              onClick={() => voteInPoll(option.id)}
              className={`focus-ring relative block w-full overflow-hidden rounded-lg border px-3 py-2 text-left text-sm transition ${
                isMine ? 'border-mason-green-400' : 'border-gray-200 hover:border-mason-green-300'
              }`}
            >
              {hasVoted && (
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 bg-mason-green-50 transition-all"
                  style={{ width: `${pct}%` }}
                />
              )}
              <span className="relative flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-medium text-gray-800">
                  {isMine && <Check size={14} className="shrink-0 text-mason-green-600" />}
                  {option.label}
                </span>
                {hasVoted && <span className="shrink-0 text-xs text-gray-500">{pct}%</span>}
              </span>
            </button>
          )
        })}
      </div>

      <p className="mt-3 text-xs text-gray-400">
        {totalVotes} Mason student{totalVotes === 1 ? '' : 's'} have weighed in <span className="italic">(demo data)</span>
      </p>
    </div>
  )
}
