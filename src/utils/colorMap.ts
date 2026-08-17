// Tailwind needs literal class names present in source to generate CSS, so
// dynamic string interpolation like `bg-${token}` won't work. This maps the
// small, known set of color tokens used in mock data to literal classes.

export const avatarBgClass: Record<string, string> = {
  'mason-green-300': 'bg-mason-green-300',
  'mason-green-400': 'bg-mason-green-400',
  'mason-green-500': 'bg-mason-green-500',
  'mason-green-600': 'bg-mason-green-600',
  'mason-green-700': 'bg-mason-green-700',
  'mason-gold-300': 'bg-mason-gold-300',
  'mason-gold-400': 'bg-mason-gold-400',
  'mason-gold-500': 'bg-mason-gold-500',
  'mason-gold-600': 'bg-mason-gold-600',
}

export function getAvatarBgClass(color: string): string {
  return avatarBgClass[color] ?? 'bg-mason-green-500'
}

export const placeholderBgClass: Record<string, string> = {
  'mason-green-200': 'bg-mason-green-200',
  'mason-gold-200': 'bg-mason-gold-200',
}

export function getPlaceholderBgClass(color: string): string {
  return placeholderBgClass[color] ?? 'bg-gray-100'
}

export interface CommunityAccent {
  bar: string
  iconBg: string
  iconText: string
  badge: string
}

export const communityAccent: Record<string, CommunityAccent> = {
  'mason-green': {
    bar: 'bg-mason-green-500',
    iconBg: 'bg-mason-green-50',
    iconText: 'text-mason-green-700',
    badge: 'bg-mason-green-50 text-mason-green-700',
  },
  'mason-gold': {
    bar: 'bg-mason-gold-400',
    iconBg: 'bg-mason-gold-50',
    iconText: 'text-mason-gold-700',
    badge: 'bg-mason-gold-50 text-mason-gold-700',
  },
}

export function getCommunityAccent(color: string): CommunityAccent {
  return communityAccent[color] ?? communityAccent['mason-green']
}
