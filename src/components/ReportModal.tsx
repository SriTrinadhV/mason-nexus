import { useState } from 'react'
import { CheckCircle2, ShieldAlert } from 'lucide-react'
import Modal from './common/Modal'
import { submitReport } from '../services/moderationService'
import type { Report } from '../services/moderationService'
import type { ReportReason } from '../types'

const reasons: ReportReason[] = [
  'Spam',
  'Harassment',
  'Inappropriate content',
  'Privacy/doxxing concern',
  'Academic integrity concern',
]

export default function ReportModal({
  open,
  onClose,
  targetType,
  targetId,
}: {
  open: boolean
  onClose: () => void
  targetType: Report['targetType']
  targetId: string
}) {
  const [reason, setReason] = useState<ReportReason | null>(null)
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<Report | null>(null)

  const reset = () => {
    setReason(null)
    setDetails('')
    setResult(null)
    setSubmitting(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async () => {
    if (!reason) return
    setSubmitting(true)
    const report = await submitReport({ targetType, targetId, reason, details: details.trim() || undefined })
    setResult(report)
    setSubmitting(false)
  }

  return (
    <Modal open={open} onClose={handleClose} title="Report content">
      {result ? (
        <div className="text-center py-2">
          <CheckCircle2 className="mx-auto mb-3 text-mason-green-600" size={36} />
          <p className="font-medium text-gray-900">Report submitted</p>
          <p className="mt-1 text-sm text-gray-500">
            {result.status === 'ai_flagged'
              ? 'AI has flagged this for priority review. A human moderator makes the final decision — nothing is removed automatically.'
              : 'This has been queued for human moderator review.'}
          </p>
          <button
            onClick={handleClose}
            className="focus-ring mt-4 rounded-lg bg-mason-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-mason-green-700"
          >
            Done
          </button>
        </div>
      ) : (
        <div>
          <p className="mb-3 text-sm text-gray-500">Why are you reporting this?</p>
          <div className="mb-4 space-y-2">
            {reasons.map((r) => (
              <label
                key={r}
                className={`focus-within:ring-2 focus-within:ring-mason-green-500 flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm ${
                  reason === r ? 'border-mason-green-500 bg-mason-green-50' : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="report-reason"
                  value={r}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="accent-mason-green-600"
                />
                {r}
              </label>
            ))}
          </div>
          <label htmlFor="report-details" className="mb-1 block text-sm font-medium text-gray-700">
            Additional details (optional)
          </label>
          <textarea
            id="report-details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            className="focus-ring mb-4 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
            <ShieldAlert size={16} className="mt-0.5 shrink-0 text-gray-400" />
            <span>AI may help flag potentially harmful content for faster review. Human moderators review and decide on all serious actions — nothing is auto-removed or auto-banned.</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!reason || submitting}
            className="focus-ring w-full rounded-lg bg-mason-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-mason-green-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          >
            {submitting ? 'Submitting…' : 'Submit report'}
          </button>
        </div>
      )}
    </Modal>
  )
}
