import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import Modal from './common/Modal'
import { createStudyGroup } from '../services/studyGroupService'
import { useApp } from '../context/AppContext'
import { courseOptions } from '../data/options'
import type { StudyGroup } from '../types'

export default function CreateStudyGroupModal({
  open,
  onClose,
  defaultCourse,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  defaultCourse?: string
  onCreated: (group: StudyGroup) => void
}) {
  const { currentUser } = useApp()
  const [courseCode, setCourseCode] = useState(defaultCourse ?? courseOptions[0])
  const [title, setTitle] = useState('')
  const [meetingTime, setMeetingTime] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [capacity, setCapacity] = useState(6)
  const [submitting, setSubmitting] = useState(false)
  const [created, setCreated] = useState<StudyGroup | null>(null)

  const reset = () => {
    setCourseCode(defaultCourse ?? courseOptions[0])
    setTitle('')
    setMeetingTime('')
    setLocation('')
    setDescription('')
    setCapacity(6)
    setCreated(null)
    setSubmitting(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async () => {
    if (!title.trim() || !meetingTime.trim() || !location.trim()) return
    setSubmitting(true)
    const group = await createStudyGroup({
      courseCode,
      title: title.trim(),
      meetingTime: meetingTime.trim(),
      location: location.trim(),
      description: description.trim(),
      capacity,
      createdBy: currentUser.id,
    })
    setSubmitting(false)
    setCreated(group)
    onCreated(group)
  }

  return (
    <Modal open={open} onClose={handleClose} title="Start a study group">
      {created ? (
        <div className="py-2 text-center">
          <CheckCircle2 className="mx-auto mb-3 text-mason-green-600" size={36} />
          <p className="font-medium text-gray-900">{created.title} is live</p>
          <p className="mt-1 text-sm text-gray-500">Other students in {created.courseCode} can now find and join it.</p>
          <button onClick={handleClose} className="focus-ring mt-4 rounded-lg bg-mason-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-mason-green-700">
            Done
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label htmlFor="sg-course" className="mb-1 block text-sm font-medium text-gray-700">
              Course
            </label>
            <select
              id="sg-course"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              className="focus-ring w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              {courseOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sg-title" className="mb-1 block text-sm font-medium text-gray-700">
              Group name
            </label>
            <input
              id="sg-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midterm Study Group"
              className="focus-ring w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="sg-time" className="mb-1 block text-sm font-medium text-gray-700">
                Meeting time
              </label>
              <input
                id="sg-time"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                placeholder="Thursday, 6:00 PM"
                className="focus-ring w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="sg-capacity" className="mb-1 block text-sm font-medium text-gray-700">
                Capacity
              </label>
              <input
                id="sg-capacity"
                type="number"
                min={2}
                max={20}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="focus-ring w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="sg-location" className="mb-1 block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              id="sg-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Fenwick Library, 2nd Floor"
              className="focus-ring w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="sg-desc" className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="sg-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="focus-ring w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !meetingTime.trim() || !location.trim() || submitting}
            className="focus-ring w-full rounded-lg bg-mason-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-mason-green-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          >
            {submitting ? 'Creating…' : 'Create study group'}
          </button>
        </div>
      )}
    </Modal>
  )
}
