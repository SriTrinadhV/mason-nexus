import { posts, getPostsByCommunity } from '../data/posts'
import type { Post, PostTag } from '../types'
import { mockDelay } from './mockDelay'

export function listPostsForCommunity(communityId: string): Promise<Post[]> {
  return mockDelay(
    [...getPostsByCommunity(communityId)].sort((a, b) => posts.indexOf(a) - posts.indexOf(b)),
  )
}

export function createPost(input: {
  communityId: string
  authorId: string
  title: string
  body: string
  tags: PostTag[]
}): Promise<Post> {
  const newPost: Post = {
    id: `post-${Date.now()}`,
    communityId: input.communityId,
    authorId: input.authorId,
    title: input.title,
    body: input.body,
    tags: input.tags,
    createdAt: 'Just now',
    likes: 0,
    comments: [],
  }
  posts.unshift(newPost)
  return mockDelay(newPost, 500)
}

export function toggleLike(postId: string): Promise<Post | undefined> {
  const post = posts.find((p) => p.id === postId)
  if (post) {
    post.likedByMe = !post.likedByMe
    post.likes += post.likedByMe ? 1 : -1
  }
  return mockDelay(post, 150)
}

export function toggleSave(postId: string): Promise<Post | undefined> {
  const post = posts.find((p) => p.id === postId)
  if (post) post.savedByMe = !post.savedByMe
  return mockDelay(post, 150)
}

export function addComment(postId: string, authorId: string, body: string): Promise<Post | undefined> {
  const post = posts.find((p) => p.id === postId)
  if (post) {
    post.comments.push({
      id: `c-${Date.now()}`,
      authorId,
      body,
      createdAt: 'Just now',
      likes: 0,
    })
  }
  return mockDelay(post, 300)
}

/**
 * SIMULATED AI FEATURE — duplicate question detection.
 * Real implementation would use semantic embeddings; this prototype does
 * simple keyword overlap against existing "Question"-tagged posts in the
 * same community, which is enough to demonstrate the interaction pattern.
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
