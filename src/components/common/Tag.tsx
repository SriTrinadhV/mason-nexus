import type { ReactNode } from 'react'

const toneClasses: Record<string, string> = {
  neutral: 'bg-gray-100 text-gray-600',
  green: 'bg-mason-green-50 text-mason-green-700 ring-1 ring-inset ring-mason-green-100',
  gold: 'bg-mason-gold-50 text-mason-gold-700 ring-1 ring-inset ring-mason-gold-100',
}

export default function Tag({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode
  tone?: 'neutral' | 'green' | 'gold'
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
