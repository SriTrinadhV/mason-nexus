export default function ChipSelect({
  options,
  selected,
  onToggle,
  multi = true,
}: {
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
  multi?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-2" role={multi ? 'group' : 'radiogroup'}>
      {options.map((opt) => {
        const active = selected.includes(opt)
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            aria-pressed={active}
            className={`focus-ring rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
              active
                ? 'border-mason-green-600 bg-mason-green-600 text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-mason-green-300'
            }`}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}
