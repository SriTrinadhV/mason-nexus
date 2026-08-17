import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Users } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getCommunity } from '../services/communityService'
import { listPostsForCommunity, toggleLike, toggleSave, addComment } from '../services/postService'
import { getStudyGroupsByCourse } from '../data/studyGroups'
import { joinStudyGroup } from '../services/studyGroupService'
import PostCard from '../components/cards/PostCard'
import StudyGroupCard from '../components/cards/StudyGroupCard'
import CreatePostModal from '../components/CreatePostModal'
import Tag from '../components/common/Tag'
import EmptyState from '../components/common/EmptyState'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import { getCommunityAccent } from '../utils/colorMap'
import type { Community, Post, StudyGroup } from '../types'

type Tab = 'discussions' | 'study-groups' | 'about'

export default function CommunityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { currentUser, joinCommunity, leaveCommunity } = useApp()
  const [community, setCommunity] = useState<Community | null | undefined>(undefined)
  const [posts, setPosts] = useState<Post[] | null>(null)
  const [studyGroups, setStudyGroups] = useState<StudyGroup[] | null>(null)
  const [tab, setTab] = useState<Tab>('discussions')
  const [createOpen, setCreateOpen] = useState(false)

  const load = () => {
    if (!id) return
    setCommunity(undefined)
    getCommunity(id).then((c) => setCommunity(c ?? null))
    listPostsForCommunity(id).then(setPosts)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (community) {
      setStudyGroups(community.courseCode ? getStudyGroupsByCourse(community.courseCode) : [])
    }
  }, [community])

  if (community === undefined) return <LoadingState count={4} />
  if (community === null || !id) return <ErrorState title="We couldn't load this community." onRetry={load} />

  const joined = currentUser.communities.includes(community.id)
  const accent = getCommunityAccent(community.color)

  const refreshPosts = () => listPostsForCommunity(id).then(setPosts)

  return (
    <div className="space-y-5 pb-8">
      <Link to="/communities" className="focus-ring inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800">
        <ArrowLeft size={15} /> Communities
      </Link>

      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className={`mb-2 inline-flex rounded-lg px-2 py-1 text-xs font-semibold uppercase tracking-wide ${accent.badge}`}>
              {community.category}
            </span>
            <h1 className="text-2xl font-bold text-gray-900">{community.name}</h1>
          </div>
          <button
            onClick={() => (joined ? leaveCommunity(community.id) : joinCommunity(community.id))}
            className={`focus-ring rounded-lg px-4 py-2 text-sm font-medium transition ${
              joined ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-mason-green-600 text-white hover:bg-mason-green-700'
            }`}
          >
            {joined ? 'Joined' : 'Join'}
          </button>
        </div>
        <p className="mb-3 text-sm text-gray-600">{community.description}</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
            <Users size={13} /> {community.memberCount} members
          </span>
          {community.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      </div>

      <div className="flex gap-1.5 border-b border-gray-200">
        {(['discussions', 'study-groups', 'about'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`focus-ring border-b-2 px-3 py-2 text-sm font-medium capitalize transition ${
              tab === t ? 'border-mason-green-600 text-mason-green-800' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.replace('-', ' ')}
          </button>
        ))}
      </div>

      {tab === 'discussions' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              onClick={() => setCreateOpen(true)}
              className="focus-ring flex items-center gap-1.5 rounded-lg bg-mason-green-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-mason-green-700"
            >
              <Plus size={15} /> New post
            </button>
          </div>
          {!posts ? (
            <LoadingState count={3} />
          ) : posts.length === 0 ? (
            <EmptyState
              title="No posts yet"
              description="Be the first to start a discussion in this community."
              action={
                <button onClick={() => setCreateOpen(true)} className="focus-ring rounded-lg bg-mason-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-mason-green-700">
                  New post
                </button>
              }
            />
          ) : (
            posts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                onLike={(pid) => toggleLike(pid).then(refreshPosts)}
                onSave={(pid) => toggleSave(pid).then(refreshPosts)}
                onComment={(pid, body) => addComment(pid, currentUser.id, body).then(refreshPosts)}
              />
            ))
          )}
        </div>
      )}

      {tab === 'study-groups' && (
        <div>
          {!studyGroups ? (
            <LoadingState count={2} />
          ) : studyGroups.length === 0 ? (
            <EmptyState
              title="No study groups are active for this course yet."
              description="Start one from the Study Groups page."
              action={
                <Link to="/study-groups" className="focus-ring rounded-lg bg-mason-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-mason-green-700">
                  Start one
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {studyGroups.map((g) => (
                <StudyGroupCard
                  key={g.id}
                  group={g}
                  joined={g.memberIds.includes(currentUser.id)}
                  onJoin={(gid) => joinStudyGroup(gid, currentUser.id).then(() => setStudyGroups(getStudyGroupsByCourse(community.courseCode!)))}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'about' && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600">
          <p className="mb-3">{community.description}</p>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs font-medium text-gray-400">Category</dt>
              <dd className="capitalize text-gray-800">{community.category}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-400">Members</dt>
              <dd className="text-gray-800">{community.memberCount}</dd>
            </div>
            {community.courseCode && (
              <div>
                <dt className="text-xs font-medium text-gray-400">Course code</dt>
                <dd className="text-gray-800">{community.courseCode}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-medium text-gray-400">Recent activity</dt>
              <dd className="text-gray-800">{community.recentActivitySummary}</dd>
            </div>
          </dl>
        </div>
      )}

      <CreatePostModal open={createOpen} onClose={() => setCreateOpen(false)} communityId={community.id} onCreated={refreshPosts} />
    </div>
  )
}
