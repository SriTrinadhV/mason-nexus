import { useState } from 'react'
import { LogOut, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ChipSelect from '../components/common/ChipSelect'
import { lookingForOptions } from '../data/options'
import type { LookingForOption } from '../types'

export default function SettingsPage() {
  const { currentUser, updateProfile, signOut } = useApp()
  const navigate = useNavigate()

  const [lookingFor, setLookingFor] = useState<LookingForOption[]>(currentUser.lookingFor)
  const [notifyReplies, setNotifyReplies] = useState(true)
  const [notifyStudyGroups, setNotifyStudyGroups] = useState(true)
  const [notifyOpportunities, setNotifyOpportunities] = useState(true)
  const [saved, setSaved] = useState(false)

  const toggleLookingFor = (v: string) => {
    const value = v as LookingForOption
    setLookingFor((prev) => (prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]))
  }

  const handleSave = async () => {
    await updateProfile({ lookingFor })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSignOut = () => {
    signOut()
    // Settings is rendered inside RequireOnboardedUser (see App.tsx), which
    // is still mounted at this exact moment. The instant signOut() flips
    // authStatus, that guard's own render redirects to /login — and because
    // that happens as part of the same React commit as this handler, it can
    // land *after* a plain `navigate('/')` called here, silently overriding
    // the intended destination. Deferring to the next macrotask lets the
    // guard's redirect settle first, so this call reliably goes last and
    // wins, landing on the public landing page as intended.
    setTimeout(() => navigate('/'), 0)
  }

  return (
    <div className="max-w-2xl space-y-5 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">Manage your profile preferences, notifications, and privacy.</p>
      </div>

      <SettingsSection title="What are you looking for?" description="This drives your recommendations across the platform.">
        <ChipSelect options={[...lookingForOptions]} selected={lookingFor} onToggle={toggleLookingFor} />
      </SettingsSection>

      <SettingsSection title="Notification preferences">
        <ToggleRow label="Replies to my posts and comments" checked={notifyReplies} onChange={setNotifyReplies} />
        <ToggleRow label="Study group activity" checked={notifyStudyGroups} onChange={setNotifyStudyGroups} />
        <ToggleRow label="Opportunity matches" checked={notifyOpportunities} onChange={setNotifyOpportunities} />
      </SettingsSection>

      <SettingsSection title="Privacy preferences">
        <ToggleRow
          label="Make my profile discoverable in People discovery"
          checked={currentUser.discoverable}
          onChange={(v) => updateProfile({ discoverable: v })}
        />
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
          <Shield size={15} className="mt-0.5 shrink-0 text-gray-400" />
          <span>
            Recommendations are based only on the profile and activity information you choose to share with the platform. Your GMU
            identity is verified internally but never shown to other students unless you choose to display your real name.
          </span>
        </div>
      </SettingsSection>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} className="focus-ring rounded-lg bg-mason-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-mason-green-700">
          Save changes
        </button>
        {saved && <span className="text-sm text-mason-green-700">Saved.</span>}
      </div>

      <div className="border-t border-gray-200 pt-5">
        <button
          onClick={handleSignOut}
          className="focus-ring flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </div>
  )
}

function SettingsSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
      {description && <p className="mb-3 mt-0.5 text-xs text-gray-500">{description}</p>}
      {!description && <div className="mb-3" />}
      {children}
    </div>
  )
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 py-1.5 text-sm text-gray-700">
      {label}
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`focus-ring relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-mason-green-600' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'left-5' : 'left-0.5'}`} />
      </button>
    </label>
  )
}
