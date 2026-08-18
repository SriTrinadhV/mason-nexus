import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Briefcase, ExternalLink, Pencil, Settings, ShieldCheck, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getStudentById } from '../data/students'
import { getCommunityById } from '../data/communities'
import Avatar from '../components/common/Avatar'
import Tag from '../components/common/Tag'
import ChipSelect from '../components/common/ChipSelect'
import ErrorState from '../components/common/ErrorState'
import { interestOptions, skillOptions } from '../data/options'
import { getPlaceholderBgClass } from '../utils/colorMap'
import type { PortfolioItem } from '../types'

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { currentUser, updateProfile } = useApp()
  const isMe = id === 'me' || id === currentUser.id
  const student = isMe ? currentUser : getStudentById(id ?? '')

  const [editing, setEditing] = useState(false)
  const [bioDraft, setBioDraft] = useState(currentUser.bio)
  const [interestsDraft, setInterestsDraft] = useState(currentUser.interests)
  const [skillsDraft, setSkillsDraft] = useState(currentUser.skills)
  const [pseudonymous, setPseudonymous] = useState(currentUser.pseudonymous)
  const [displayName, setDisplayName] = useState(currentUser.displayName)

  if (!student) return <ErrorState title="We couldn't find this student." description="They may have adjusted their privacy settings." />

  const startEdit = () => {
    setBioDraft(currentUser.bio)
    setInterestsDraft(currentUser.interests)
    setSkillsDraft(currentUser.skills)
    setPseudonymous(currentUser.pseudonymous)
    setDisplayName(currentUser.displayName)
    setEditing(true)
  }

  const saveEdit = () => {
    updateProfile({
      bio: bioDraft,
      interests: interestsDraft,
      skills: skillsDraft,
      pseudonymous,
      displayName: pseudonymous ? displayName || 'Anonymous Student' : currentUser.name,
    })
    setEditing(false)
  }

  const toggle = (arr: string[], setArr: (v: string[]) => void, value: string) => {
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value])
  }

  const communities = student.communities.map(getCommunityById).filter((c): c is NonNullable<typeof c> => !!c)

  return (
    <div className="space-y-5 pb-8">
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={student.displayName} color={student.avatarColor} size="xl" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{student.displayName}</h1>
                {student.verified && (
                  <span title="GMU identity verified (simulated)">
                    <ShieldCheck size={16} className="text-mason-green-600" />
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {student.major} · {student.year}
              </p>
              {student.role !== 'Student' && (
                <Tag tone="gold" className="mt-1.5">
                  {student.role}
                </Tag>
              )}
            </div>
          </div>
          {isMe && !editing && (
            <div className="flex gap-2">
              <button
                onClick={startEdit}
                className="focus-ring flex items-center gap-1.5 rounded-lg border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Pencil size={14} /> Edit profile
              </button>
              {/* Settings lives in the desktop sidebar already; this gives mobile users
                  (who have no sidebar) a real, visible way to reach it in 2 taps from
                  the bottom nav, instead of the plain-text mention further down this page. */}
              <Link
                to="/settings"
                className="focus-ring flex items-center gap-1.5 rounded-lg border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 lg:hidden"
              >
                <Settings size={14} /> Settings
              </Link>
            </div>
          )}
        </div>
      </div>

      {isMe && editing ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-5">
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
              <input type="checkbox" checked={pseudonymous} onChange={(e) => setPseudonymous(e.target.checked)} className="accent-mason-green-600" />
              Use a display name instead of my real name
            </label>
            {pseudonymous && (
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display name"
                className="focus-ring mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            )}
            <p className="mt-1.5 text-xs text-gray-400">
              Your GMU identity stays verified internally either way — this only changes what other students see.
            </p>
          </div>

          <div>
            <label htmlFor="bio" className="mb-1.5 block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              id="bio"
              value={bioDraft}
              onChange={(e) => setBioDraft(e.target.value)}
              rows={3}
              className="focus-ring w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium text-gray-700">Interests</p>
            <ChipSelect options={interestOptions} selected={interestsDraft} onToggle={(v) => toggle(interestsDraft, setInterestsDraft, v)} />
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium text-gray-700">Skills</p>
            <ChipSelect options={skillOptions} selected={skillsDraft} onToggle={(v) => toggle(skillsDraft, setSkillsDraft, v)} />
          </div>

          <div className="flex gap-2">
            <button onClick={saveEdit} className="focus-ring rounded-lg bg-mason-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-mason-green-700">
              Save changes
            </button>
            <button
              onClick={() => setEditing(false)}
              className="focus-ring flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-600">{student.bio}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ProfileSection title="Interests">
          <TagList items={student.interests} tone="green" empty="No interests listed yet." />
        </ProfileSection>
        <ProfileSection title="Skills">
          <TagList items={student.skills} tone="gold" empty="No skills listed yet." />
        </ProfileSection>
        <ProfileSection title="Available for">
          <TagList items={student.availableFor} tone="neutral" empty="Not currently available for collaboration." />
        </ProfileSection>
        <ProfileSection title="Communities">
          {communities.length === 0 ? (
            <p className="text-sm text-gray-400">Not part of any communities yet.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {communities.map((c) => (
                <Tag key={c.id}>{c.name}</Tag>
              ))}
            </div>
          )}
        </ProfileSection>
      </div>

      <ProfileSection title="Portfolio" icon={Briefcase}>
        {student.portfolio.length === 0 ? (
          <p className="text-sm text-gray-400">No portfolio items yet — this is meant to be lightweight, not a full LinkedIn.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {student.portfolio.map((item) => (
              <PortfolioCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </ProfileSection>

      <div className="rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
        Your GMU identity is verified internally, but what other students see here is up to you — control it anytime in Settings.
      </div>
    </div>
  )
}

function ProfileSection({ title, icon: Icon, children }: { title: string; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-center gap-1.5">
        {Icon && <Icon size={15} className="text-gray-400" />}
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function TagList({ items, tone, empty }: { items: string[]; tone: 'green' | 'gold' | 'neutral'; empty: string }) {
  if (items.length === 0) return <p className="text-sm text-gray-400">{empty}</p>
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <Tag key={i} tone={tone}>
          {i}
        </Tag>
      ))}
    </div>
  )
}

function PortfolioCard({ item }: { item: PortfolioItem }) {
  return (
    <div className="rounded-xl border border-gray-100 p-3">
      <div className={`mb-2 h-20 rounded-lg ${getPlaceholderBgClass(item.placeholderColor)}`} />
      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
      <p className="mt-0.5 text-xs text-gray-500">{item.description}</p>
      {item.link && (
        <a href={item.link} target="_blank" rel="noreferrer" className="focus-ring mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-mason-green-700 hover:underline">
          View project <ExternalLink size={11} />
        </a>
      )}
    </div>
  )
}
