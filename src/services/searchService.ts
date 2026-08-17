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

// Common function words that add noise to token matching without carrying search meaning.
// Deliberately short — course codes ("cs", "it") and short interests ("ai", "ux") must survive.
const STOPWORDS = new Set([
  'a', 'an', 'the', 'of', 'for', 'to', 'in', 'on', 'and', 'or', 'is', 'are', 'be',
  'i', 'me', 'my', 'you', 'your', 'about', 'with', 'need', 'want', 'looking',
])

// Unicode combining diacritical marks block (U+0300–U+036F), written via code
// points rather than literal glyphs so the source stays plain ASCII.
const COMBINING_DIACRITICS = new RegExp(
  '[' + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + ']',
  'g',
)

function normalize(text: string): string {
  // NFD + strip combining diacritics so "pokemon" matches "Pokémon", "cafe" matches "café", etc.
  return text
    .normalize('NFD')
    .replace(COMBINING_DIACRITICS, '')
    .toLowerCase()
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
}

interface WeightedField {
  text: string
  weight: number
}

/**
 * Scores an entity against the query's tokens. A token matches a field when
 * some *whole word* in that field starts with it — "photo" matches
 * "Photography", "cs" matches "CS 310" — rather than a raw substring test,
 * which would also match "cs" inside unrelated words like "roboti-cs" or
 * "physi-cs". Each match adds that field's weight (title/name fields count
 * more than description/body fields); the full query appearing verbatim
 * anywhere adds a bonus so exact-phrase matches still rank at the top,
 * matching the old behavior. An entity with zero matched tokens scores 0 and
 * is excluded.
 */
function scoreEntity(tokens: string[], normalizedQuery: string, fields: WeightedField[]): number {
  if (tokens.length === 0) return 0
  let score = 0
  const matchedTokens = new Set<string>()

  for (const field of fields) {
    if (!field.text) continue
    const normalizedField = normalize(field.text)
    const fieldWords = normalizedField.split(/[^a-z0-9]+/).filter(Boolean)
    for (const token of tokens) {
      if (fieldWords.some((word) => word.startsWith(token))) {
        score += field.weight
        matchedTokens.add(token)
      }
    }
    if (normalizedQuery.length > 1 && normalizedField.includes(normalizedQuery)) {
      score += 5
    }
  }

  return matchedTokens.size > 0 ? score : 0
}

function rankAndTake<T>(items: T[], score: (item: T) => number, limit: number): T[] {
  return items
    .map((item) => ({ item, score: score(item) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.item)
}

/**
 * SIMULATED semantic search. Real token-based keyword matching across all
 * entity types — the query is normalized and split into meaningful words, and
 * anything sharing at least one meaningful word with the query is a
 * candidate, ranked by how many/how strong its matches are. A small set of
 * canned "intent hints" adds a few extra related keywords for a handful of
 * example queries (and shows an explanatory note) so the demo can gesture at
 * what real semantic behavior would feel like — everything else is plain
 * keyword search, and the UI only claims "semantic" when a hint actually fired.
 */
export function search(query: string, currentUserId?: string): Promise<SearchResults> {
  const trimmed = query.trim()
  if (!trimmed) return mockDelay({ communities: [], posts: [], students: [], studyGroups: [], opportunities: [] }, 200)

  const normalizedQuery = normalize(trimmed)
  const hint = SEMANTIC_HINTS.find((h) => h.pattern.test(trimmed))

  const queryTokens = tokenize(trimmed)
  const hintTokens = hint ? hint.keywords.flatMap(tokenize) : []
  const tokens = [...new Set([...queryTokens, ...hintTokens])]
  // Degenerate case (query was entirely stopwords/punctuation): fall back to
  // the whole normalized query so the search still does *something* useful.
  const effectiveTokens = tokens.length > 0 ? tokens : [normalizedQuery]

  const matchedCommunities = rankAndTake(
    communities,
    (c) =>
      scoreEntity(effectiveTokens, normalizedQuery, [
        { text: c.name, weight: 3 },
        { text: c.tags.join(' '), weight: 2 },
        { text: c.description, weight: 1 },
      ]),
    6,
  )

  const matchedPosts = rankAndTake(
    posts,
    (p) =>
      scoreEntity(effectiveTokens, normalizedQuery, [
        { text: p.title, weight: 3 },
        { text: p.body, weight: 1 },
      ]),
    6,
  )

  const matchedStudents = rankAndTake(
    students.filter((s) => s.id !== currentUserId && s.discoverable !== false),
    (s) =>
      scoreEntity(effectiveTokens, normalizedQuery, [
        { text: s.displayName, weight: 3 },
        { text: s.courses.join(' '), weight: 2 },
        { text: s.interests.join(' '), weight: 2 },
        { text: s.skills.join(' '), weight: 2 },
        { text: s.major, weight: 1 },
      ]),
    6,
  )

  const matchedGroups = rankAndTake(
    studyGroups,
    (g) =>
      scoreEntity(effectiveTokens, normalizedQuery, [
        { text: g.title, weight: 3 },
        { text: g.courseCode, weight: 3 },
        { text: g.description, weight: 1 },
      ]),
    6,
  )

  const matchedOpportunities = rankAndTake(
    opportunities,
    (o) =>
      scoreEntity(effectiveTokens, normalizedQuery, [
        { text: o.title, weight: 3 },
        { text: o.requiredSkills.join(' '), weight: 2 },
        { text: o.description, weight: 1 },
      ]),
    6,
  )

  return mockDelay(
    {
      communities: matchedCommunities,
      posts: matchedPosts,
      students: matchedStudents,
      studyGroups: matchedGroups,
      opportunities: matchedOpportunities,
      semanticNote: hint?.note,
    },
    500,
  )
}
