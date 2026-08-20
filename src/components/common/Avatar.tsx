import { getAvatarBgClass } from '../../utils/colorMap'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const sizeClasses: Record<string, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
}

export default function Avatar({
  name,
  color = 'mason-green-500',
  size = 'md',
  className = '',
}: {
  name: string
  color?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-white ${getAvatarBgClass(color)} ${sizeClasses[size]} ${className}`}
      style={{ fontFamily: 'var(--font-display)' }}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  )
}
