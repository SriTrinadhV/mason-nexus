import { supabase } from './supabaseClient'
import { getCommunities, refreshCommunities } from './dataStore'
import type { Community, CommunityCategory } from '../types'
import { mockDelay } from './mockDelay'

export function listCommunities(filters?: { category?: CommunityCategory; query?: string; tag?: string }): Promise<Community[]> {
  let result = [...getCommunities()]
  if (filters?.category) result = result.filter((c) => c.category === filters.category)
  if (filters?.tag) result = result.filter((c) => c.tags.includes(filters.tag!))
  if (filters?.query) {
    const q = filters.query.toLowerCase()
    result = result.filter(
      (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.tags.some((t) => t.toLowerCase().includes(q)),
    )
  }
  return mockDelay(result)
}

export function getCommunity(id: string): Promise<Community | undefined> {
  return mockDelay(getCommunities().find((c) => c.id === id))
}

/**
 * Interest-category submissions are always marked pending review — enforced
 * by a database trigger (set_pending_review in schema.sql), not just this
 * client-side default, so it can't be bypassed by calling the API directly.
 */
export async function createCommunity(input: {
  name: string
  category: CommunityCategory
  description: string
  tags: string[]
  createdBy: string
}): Promise<Community> {
  const { data, error } = await supabase
    .from('communities')
    .insert({
      name: input.name,
      category: input.category,
      description: input.description,
      tags: input.tags,
      color: input.category === 'club' ? 'mason-gold' : 'mason-green',
      created_by: input.createdBy,
      recent_activity_summary: 'Just created',
    })
    .select('*, community_members(count)')
    .single()
  if (error) throw error

  await refreshCommunities()

  return {
    id: data.id,
    name: data.name,
    category: data.category,
    description: data.description,
    memberCount: data.community_members?.[0]?.count ?? 0,
    tags: data.tags ?? [],
    recentActivitySummary: data.recent_activity_summary,
    color: data.color,
    courseCode: data.course_code ?? undefined,
    createdBy: data.created_by ?? undefined,
    pendingReview: data.pending_review,
  }
}
