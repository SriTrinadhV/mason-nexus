import { intentOptions } from '../data/intents'
import type { Intent } from '../types'

export default function IntentSelector({
  value,
  onChange,
}: {
  value: Intent | null
  onChange: (intent: Intent) => void
}) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-gray-500">What are you looking for today?</h2>
      <div
        role="group"
        aria-label="Choose your intent"
        className="grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3"
      >
        {intentOptions.map((opt) => {
          const active = value === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              aria-pressed={active}
              title={opt.description}
              className={`focus-ring flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center transition ${
                active
                  ? 'border-mason-green-500 bg-mason-green-50 text-mason-green-800'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-mason-green-300 hover:bg-mason-green-50/40'
              }`}
            >
              <span className="text-xl" aria-hidden="true">
                {opt.emoji}
              </span>
              <span className="text-xs font-medium leading-tight">{opt.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
