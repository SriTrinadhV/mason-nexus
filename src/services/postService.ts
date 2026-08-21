import { supabase } from './supabaseClient'
import { getPosts, getPostsByCommunity, refreshPosts } from './dataStore'
import type { Post, PostTag } from '../types'
import { mockDelay } from './mockDelay'

export function listPostsForCommunity(communityId: string): Promise<Post[]> {
  return mockDelay(getPostsByCommunity(communityId))
}

export async function createPost(input: {
  communityId: string
  authorId: string
  title: string
  body: string
  tags: PostTag[]
}): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .insert({ community_id: input.communityId, author_id: input.authorId, title: input.title, body: input.body, tags: input.tags })
    .select('id')
    .single()
  if (error) throw error

  await refreshPosts(input.authorId)
  const created = getPosts().find((p) => p.id === data.id)
  if (!created) throw new Error('Post created but could not be re-fetched')
  return created
}

export async function toggleLike(postId: string): Promise<Post | undefined> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.rpc('toggle_post_like', { p_post_id: postId })
  if (error) throw error
  await refreshPosts(user.id)
  return getPosts().find((p) => p.id === postId)
}

export async function toggleSave(postId: string): Promise<Post | undefined> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.rpc('toggle_post_save', { p_post_id: postId })
  if (error) throw error
  await refreshPosts(user.id)
  return getPosts().find((p) => p.id === postId)
}

export async function addComment(postId: string, authorId: string, body: string): Promise<Post | undefined> {
  const { error } = await supabase.from('comments').insert({ post_id: postId, author_id: authorId, body })
  if (error) throw error
  await refreshPosts(authorId)
  return getPosts().find((p) => p.id === postId)
}

/**
 * SIMULATED AI FEATURE — duplicate question detection (unchanged logic, now
 * reading from the live post cache instead of the old mock array).
 */
export function findPossibleDuplicates(communityId: string, title: string): Promise<Post[]> {
  const stopwords = new Set(['the', 'a', 'an', 'does', 'anyone', 'is', 'to', 'of', 'and', 'for', 'in', 'on', 'i', 'my', 'about'])
  const titleWords = new Set(
    title
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 2 && !stopwords.has(w)),
  )
  if (titleWords.size === 0) return mockDelay([], 300)

  const candidates = getPostsByCommunity(communityId).filter((p) => p.tags.includes('Question') || p.tags.includes('Study Help'))

  const scored = candidates
    .map((p) => {
      const postWords = new Set(
        (p.title + ' ' + p.body)
          .toLowerCase()
          .split(/\W+/)
          .filter((w) => w.length > 2 && !stopwords.has(w)),
      )
      let overlap = 0
      titleWords.forEach((w) => {
        if (postWords.has(w)) overlap += 1
      })
      return { post: p, overlap }
    })
    .filter((s) => s.overlap >= 1)
    .sort((a, b) => b.overlap - a.overlap)

  return mockDelay(scored.slice(0, 2).map((s) => s.post), 500)
}
