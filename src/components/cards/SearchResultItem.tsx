import { Link } from 'react-router-dom'
import type { ElementType, ReactNode } from 'react'

export default function SearchResultItem({
  to,
  icon: Icon,
  title,
  subtitle,
  meta,
}: {
  to: string
  icon: ElementType
  title: string
  subtitle?: string
  meta?: ReactNode
}) {
  return (
    <Link
      to={to}
      className="focus-ring flex items-start gap-3 rounded-lg border border-gray-100 bg-white px-3 py-2.5 transition hover:border-mason-green-200 hover:bg-mason-green-50/30"
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-mason-green-50 text-mason-green-600">
        <Icon size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{title}</p>
        {subtitle && <p className="line-clamp-2 text-xs text-gray-500">{subtitle}</p>}
      </div>
      {meta && <div className="shrink-0 text-xs text-gray-400">{meta}</div>}
    </Link>
  )
}
