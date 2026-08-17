import { useState } from 'react'
import { Bookmark, Flag, MessageCircle, ThumbsUp } from 'lucide-react'
import type { Post } from '../../types'
import Avatar from '../common/Avatar'
import Tag from '../common/Tag'
import { getStudentById } from '../../data/students'
import ReportModal from '../ReportModal'

export default function PostCard({
  post,
  onLike,
  onSave,
  onComment,
}: {
  post: Post
  onLike: (id: string) => void
  onSave: (id: string) => void
  onComment: (id: string, body: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [commentDraft, setCommentDraft] = useState('')
  const [reportOpen, setReportOpen] = useState(false)
  const author = getStudentById(post.authorId)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-2 flex items-center gap-3">
        <Avatar name={author?.displayName ?? 'Student'} color={author?.avatarColor} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">{author?.displayName ?? 'Student'}</p>
          <p className="text-xs text-gray-400">{post.createdAt}</p>
        </div>
      </div>
      <h3 className="mb-1 font-semibold text-gray-900">{post.title}</h3>
      <p className="mb-3 text-sm text-gray-600">{post.body}</p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {post.tags.map((tag) => (
          <Tag key={tag} tone="green">
            {tag}
          </Tag>
        ))}
      </div>
      <div className="flex items-center gap-4 border-t border-gray-100 pt-3 text-sm text-gray-500">
        <button
          onClick={() => onLike(post.id)}
          className={`focus-ring flex items-center gap-1.5 rounded px-1.5 py-1 hover:text-mason-green-700 ${post.likedByMe ? 'text-mason-green-700 font-medium' : ''}`}
          aria-pressed={!!post.likedByMe}
        >
          <ThumbsUp size={15} /> {post.likes}
        </button>
        <button
          onClick={() => setExpanded((e) => !e)}
          className="focus-ring flex items-center gap-1.5 rounded px-1.5 py-1 hover:text-mason-green-700"
          aria-expanded={expanded}
        >
          <MessageCircle size={15} /> {post.comments.length}
        </button>
        <button
          onClick={() => onSave(post.id)}
          className={`focus-ring flex items-center gap-1.5 rounded px-1.5 py-1 hover:text-mason-green-700 ${post.savedByMe ? 'text-mason-green-700 font-medium' : ''}`}
          aria-pressed={!!post.savedByMe}
        >
          <Bookmark size={15} /> {post.savedByMe ? 'Saved' : 'Save'}
        </button>
        <button
          onClick={() => setReportOpen(true)}
          className="focus-ring ml-auto flex items-center gap-1.5 rounded px-1.5 py-1 hover:text-red-600"
        >
          <Flag size={15} />
          <span className="sr-only sm:not-sr-only">Report</span>
        </button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
          {post.comments.map((c) => {
            const commentAuthor = getStudentById(c.authorId)
            return (
              <div key={c.id} className="flex gap-2.5">
                <Avatar name={commentAuthor?.displayName ?? 'Student'} color={commentAuthor?.avatarColor} size="sm" />
                <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm">
                  <p className="font-medium text-gray-800">{commentAuthor?.displayName}</p>
                  <p className="text-gray-600">{c.body}</p>
                </div>
              </div>
            )
          })}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!commentDraft.trim()) return
              onComment(post.id, commentDraft.trim())
              setCommentDraft('')
            }}
            className="flex gap-2"
          >
            <label htmlFor={`comment-${post.id}`} className="sr-only">
              Add a comment
            </label>
            <input
              id={`comment-${post.id}`}
              value={commentDraft}
              onChange={(e) => setCommentDraft(e.target.value)}
              placeholder="Add a comment..."
              className="focus-ring flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
            />
            <button
              type="submit"
              className="focus-ring rounded-lg bg-mason-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-mason-green-700"
            >
              Post
            </button>
          </form>
        </div>
      )}

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="post"
        targetId={post.id}
      />
    </div>
  )
}
