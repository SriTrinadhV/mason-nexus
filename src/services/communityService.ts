import { communities } from '../data/communities'
import type { Community, CommunityCategory } from '../types'
import { mockDelay } from './mockDelay'

export function listCommunities(filters?: {
  category?: CommunityCategory
  query?: string
  tag?: string
}): Promise<Community[]> {
  let result = [...communities]
  if (filters?.category) {
    result = result.filter((c) => c.category === filters.category)
  }
  if (filters?.tag) {
    result = result.filter((c) => c.tags.includes(filters.tag!))
  }
  if (filters?.query) {
    const q = filters.query.toLowerCase()
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)),
    )
  }
  return mockDelay(result)
}

export function getCommunity(id: string): Promise<Community | undefined> {
  return mockDelay(communities.find((c) => c.id === id))
}

/**
 * Lightweight moderation concept: interest-community submissions are marked
 * pending review; class/club communities (created by the platform/org) are not.
 */
export function createCommunity(input: {
  name: string
  category: CommunityCategory
  description: string
  tags: string[]
  createdBy: string
}): Promise<Community> {
  const newCommunity: Community = {
    id: `c-${Date.now()}`,
    name: input.name,
    category: input.category,
    description: input.description,
    memberCount: 0,
    tags: input.tags,
    recentActivitySummary: 'Just created',
    color: input.category === 'club' ? 'mason-gold' : 'mason-green',
    createdBy: input.createdBy,
    pendingReview: input.category === 'interest',
  }
  communities.unshift(newCommunity)
  return mockDelay(newCommunity, 600)
}
