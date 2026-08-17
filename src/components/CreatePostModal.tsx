import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import Modal from './common/Modal'
import { createPost, findPossibleDuplicates } from '../services/postService'
import { useApp } from '../context/AppContext'
import type { Post, PostTag } from '../types'

const tagOptions: PostTag[] = ['Question', 'Study Help', 'Resource', 'Discussion', 'Project', 'Collaboration']

export default function CreatePostModal({
  open,
  onClose,
  communityId,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  communityId: string
  onCreated: (post: Post) => void
}) {
  const { currentUser } = useApp()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState<PostTag[]>([])
  const [duplicates, setDuplicates] = useState<Post[] | null>(null)
  const [checking, setChecking] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const reset = () => {
    setTitle('')
    setBody('')
    setTags([])
    setDuplicates(null)
    setChecking(false)
    setSubmitting(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const toggleTag = (t: PostTag) => setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))

  const handleReviewDuplicates = async () => {
    if (!title.trim()) return
    setChecking(true)
    const found = await findPossibleDuplicates(communityId, title)
    setChecking(false)
    setDuplicates(found)
  }

  const handlePublish = async () => {
    setSubmitting(true)
    const post = await createPost({
      communityId,
      authorId: currentUser.id,
      title: title.trim(),
      body: body.trim(),
      tags: tags.length ? tags : ['Discussion'],
    })
    setSubmitting(false)
    onCreated(post)
    handleClose()
  }

  const readyToCheck = duplicates === null

  return (
    <Modal open={open} onClose={handleClose} title="Create a post">
      <div className="space-y-4">
        <div>
          <label htmlFor="p-title" className="mb-1 block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            id="p-title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setDuplicates(null)
            }}
            placeholder="What's your question or update?"
            className="focus-ring w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="p-body" className="mb-1 block text-sm font-medium text-gray-700">
            Details
          </label>
          <textarea
            id="p-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="focus-ring w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <p className="mb-1.5 text-sm font-medium text-gray-700">Tags</p>
          <div className="flex flex-wrap gap-1.5">
            {tagOptions.map((t) => (
              <button
                key={t}
                onClick={() => toggleTag(t)}
                className={`focus-ring rounded-full border px-3 py-1 text-xs font-medium transition ${
                  tags.includes(t) ? 'border-mason-green-600 bg-mason-green-600 text-white' : 'border-gray-200 text-gray-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {duplicates && duplicates.length > 0 && (
          <div className="rounded-lg border border-mason-gold-200 bg-mason-gold-50 p-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-mason-gold-700">
              <Sparkles size={13} /> SIMULATED AI — we found a similar discussion that may help
            </p>
            <div className="space-y-1.5">
              {duplicates.map((d) => (
                <div key={d.id} className="rounded-md bg-white px-2.5 py-1.5 text-sm text-gray-700">
                  {d.title}
                </div>
              ))}
            </div>
          </div>
        )}

        {readyToCheck ? (
          <button
            onClick={handleReviewDuplicates}
            disabled={!title.trim() || checking}
            className="focus-ring w-full rounded-lg border border-mason-green-600 px-4 py-2 text-sm font-medium text-mason-green-700 hover:bg-mason-green-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
          >
            {checking ? 'Checking for similar posts…' : 'Continue'}
          </button>
        ) : (
          <button
            onClick={handlePublish}
            disabled={!body.trim() || submitting}
            className="focus-ring w-full rounded-lg bg-mason-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-mason-green-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          >
            {submitting ? 'Posting…' : 'Post anyway'}
          </button>
        )}
      </div>
    </Modal>
  )
}
