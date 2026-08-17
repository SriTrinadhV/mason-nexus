import { useState } from 'react'
import { CheckCircle2, ShieldAlert } from 'lucide-react'
import Modal from './common/Modal'
import { createCommunity } from '../services/communityService'
import { useApp } from '../context/AppContext'
import type { Community, CommunityCategory } from '../types'

const categories: { id: CommunityCategory; label: string; helper: string }[] = [
  { id: 'club', label: 'Club', helper: 'Tied to a registered student organization' },
  { id: 'interest', label: 'Interest', helper: 'Casual, student-driven — may be reviewed before going public' },
]

export default function CreateCommunityModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { currentUser, joinCommunity } = useApp()
  const [name, setName] = useState('')
  const [category, setCategory] = useState<CommunityCategory>('interest')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [created, setCreated] = useState<Community | null>(null)

  const reset = () => {
    setName('')
    setCategory('interest')
    setDescription('')
    setTags('')
    setCreated(null)
    setSubmitting(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async () => {
    if (!name.trim() || !description.trim()) return
    setSubmitting(true)
    const community = await createCommunity({
      name: name.trim(),
      category,
      description: description.trim(),
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      createdBy: currentUser.id,
    })
    joinCommunity(community.id)
    setCreated(community)
    setSubmitting(false)
  }

  return (
    <Modal open={open} onClose={handleClose} title="Create a community">
      {created ? (
        <div className="py-2 text-center">
          <CheckCircle2 className="mx-auto mb-3 text-mason-green-600" size={36} />
          <p className="font-medium text-gray-900">{created.name} created</p>
          <p className="mt-1 text-sm text-gray-500">
            {created.pendingReview
              ? "Interest communities are lightly reviewed before appearing broadly — yours is live for you now while that happens."
              : 'Your community is live.'}
          </p>
          <button
            onClick={handleClose}
            className="focus-ring mt-4 rounded-lg bg-mason-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-mason-green-700"
          >
            Done
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="c-name" className="mb-1 block text-sm font-medium text-gray-700">
              Community name
            </label>
            <input
              id="c-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Board Game Nights at Mason"
              className="focus-ring w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <p className="mb-1.5 block text-sm font-medium text-gray-700">Type</p>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`focus-ring rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                    category === c.id ? 'border-mason-green-600 bg-mason-green-50' : 'border-gray-200'
                  }`}
                >
                  <span className="block font-medium text-gray-900">{c.label}</span>
                  <span className="block text-xs text-gray-500">{c.helper}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="c-desc" className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="c-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What's this community about?"
              className="focus-ring w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="c-tags" className="mb-1 block text-sm font-medium text-gray-700">
              Tags (comma separated)
            </label>
            <input
              id="c-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Board Games, Social, Weekly"
              className="focus-ring w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>

          {category === 'interest' && (
            <div className="flex items-start gap-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
              <ShieldAlert size={15} className="mt-0.5 shrink-0 text-gray-400" />
              <span>Interest community submissions may be lightly reviewed before appearing in broader discovery — this keeps the space intentional without adding heavy process.</span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !description.trim() || submitting}
            className="focus-ring w-full rounded-lg bg-mason-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-mason-green-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          >
            {submitting ? 'Creating…' : 'Create community'}
          </button>
        </div>
      )}
    </Modal>
  )
}
