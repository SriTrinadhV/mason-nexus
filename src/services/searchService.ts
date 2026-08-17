import { communities } from '../data/communities'
import { posts } from '../data/posts'
import { students } from '../data/students'
import { studyGroups } from '../data/studyGroups'
import { opportunities } from '../data/opportunities'
import type { Community, Opportunity, Post, Student, StudyGroup } from '../types'
import { mockDelay } from './mockDelay'

export interface SearchResults {
  communities: Community[]
  posts: Post[]
  students: Student[]
  studyGroups: StudyGroup[]
  opportunities: Opportunity[]
  semanticNote?: string
}

const SEMANTIC_HINTS: { pattern: RegExp; note: string; keywords: string[] }[] = [
  {
    pattern: /recursion/i,
    note: 'Showing results related to "recursion" across discussions, study groups, and people who can help — not just exact keyword matches.',
    keywords: ['recursion', 'recursive', 'base case', 'cs 310'],
  },
  {
    pattern: /(help|tutor|understand)/i,
    note: 'Interpreting this as a request for help — surfacing discussions, study groups, and students who may be able to assist.',
    keywords: ['help', 'study', 'tutor'],
  },
  {
    pattern: /(job|gig|paid|hire)/i,
    note: 'Mason Commons focuses on peer collaboration, not paid gig work — showing related peer opportunities instead.',
    keywords: ['opportunity', 'collaborate', 'project'],
  },
]

/**
 * SIMULATED semantic search. Real keyword matching across all entity types,
 * plus a small set of canned "intent hints" for a few example queries so the
 * demo can show what semantic behavior would feel like (e.g. searching
 * "I need help understanding recursion" surfaces a study group and a
 * tutoring-available student even though neither contains the word "help").
 */
export function search(query: string): Promise<SearchResults> {
  const q = query.trim().toLowerCase()
  if (!q) return mockDelay({ communities: [], posts: [], students: [], studyGroups: [], opportunities: [] }, 200)

  const hint = SEMANTIC_HINTS.find((h) => h.pattern.test(q))
  const terms = hint ? [q, ...hint.keywords] : [q]

  const matchesAny = (text: string) => terms.some((t) => text.toLowerCase().includes(t.toLowerCase()))

  const matchedCommunities = communities.filter(
    (c) => matchesAny(c.name) || matchesAny(c.description) || c.tags.some((t) => matchesAny(t)),
  )
  const matchedPosts = posts.filter((p) => matchesAny(p.title) || matchesAny(p.body))
  const matchedStudents = students.filter(
    (s) =>
      matchesAny(s.name) ||
      s.interests.some((i) => matchesAny(i)) ||
      s.skills.some((sk) => matchesAny(sk)) ||
      s.courses.some((c) => matchesAny(c)),
  )
  const matchedGroups = studyGroups.filter((g) => matchesAny(g.title) || matchesAny(g.courseCode) || matchesAny(g.description))
  const matchedOpportunities = opportunities.filter((o) => matchesAny(o.title) || matchesAny(o.description) || o.requiredSkills.some((s) => matchesAny(s)))

  return mockDelay(
    {
      communities: matchedCommunities.slice(0, 6),
      posts: matchedPosts.slice(0, 6),
      students: matchedStudents.slice(0, 6),
      studyGroups: matchedGroups.slice(0, 6),
      opportunities: matchedOpportunities.slice(0, 6),
      semanticNote: hint?.note,
    },
    500,
  )
}
