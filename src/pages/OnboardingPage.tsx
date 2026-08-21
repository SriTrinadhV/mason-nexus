import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import ChipSelect from '../components/common/ChipSelect'
import { courseOptions, interestOptions, lookingForOptions, majorOptions, skillOptions, yearOptions } from '../data/options'
import { useApp } from '../context/AppContext'
import type { LookingForOption, OnboardingData, Student } from '../types'

const steps = ['Major', 'Year', 'Courses', 'Interests', 'Skills', 'Goals'] as const

function toggleInArray<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
}

export default function OnboardingPage() {
  const { completeOnboarding } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    major: '',
    year: 'Sophomore',
    courses: [],
    interests: [],
    skills: [],
    lookingFor: [],
  })

  const canAdvance = (() => {
    switch (step) {
      case 0:
        return !!data.major
      case 1:
        return !!data.year
      case 2:
        return data.courses.length > 0
      case 3:
        return data.interests.length > 0
      case 4:
        return data.skills.length > 0
      case 5:
        return data.lookingFor.length > 0
      default:
        return true
    }
  })()

  const [finishing, setFinishing] = useState(false)

  const handleFinish = async () => {
    setFinishing(true)
    await completeOnboarding(data)
    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-canvas px-4 py-8">
      <div className="mx-auto max-w-lg">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-gray-500">
            <span>
              Step {step + 1} of {steps.length}
            </span>
            <span>{steps[step]}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-mason-green-600 transition-all"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {step === 0 && (
            <StepShell title="What's your major?" description="This helps us recommend the right class communities.">
              <div className="grid grid-cols-2 gap-2">
                {majorOptions.map((m) => (
                  <button
                    key={m}
                    onClick={() => setData((d) => ({ ...d, major: m }))}
                    className={`focus-ring rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition ${
                      data.major === m ? 'border-mason-green-600 bg-mason-green-50 text-mason-green-800' : 'border-gray-200 text-gray-600 hover:border-mason-green-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </StepShell>
          )}

          {step === 1 && (
            <StepShell title="What year are you?" description="">
              <ChipSelect
                options={[...yearOptions]}
                selected={[data.year]}
                onToggle={(v) => setData((d) => ({ ...d, year: v as Student['year'] }))}
                multi={false}
              />
            </StepShell>
          )}

          {step === 2 && (
            <StepShell title="Which courses are you taking?" description="We'll surface the class communities and study groups for these.">
              <ChipSelect
                options={courseOptions}
                selected={data.courses}
                onToggle={(v) => setData((d) => ({ ...d, courses: toggleInArray(d.courses, v) }))}
              />
            </StepShell>
          )}

          {step === 3 && (
            <StepShell title="What are you interested in?" description="Used to recommend clubs, interest communities, and people.">
              <ChipSelect
                options={interestOptions}
                selected={data.interests}
                onToggle={(v) => setData((d) => ({ ...d, interests: toggleInArray(d.interests, v) }))}
              />
            </StepShell>
          )}

          {step === 4 && (
            <StepShell title="What skills can you bring?" description="Used to match you with opportunities and people who need your help.">
              <ChipSelect
                options={skillOptions}
                selected={data.skills}
                onToggle={(v) => setData((d) => ({ ...d, skills: toggleInArray(d.skills, v) }))}
              />
            </StepShell>
          )}

          {step === 5 && (
            <StepShell title="What are you looking for?" description="Select all that apply — you can change this anytime in Settings.">
              <ChipSelect
                options={[...lookingForOptions]}
                selected={data.lookingFor}
                onToggle={(v) =>
                  setData((d) => ({ ...d, lookingFor: toggleInArray(d.lookingFor, v as LookingForOption) }))
                }
              />
            </StepShell>
          )}

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="focus-ring flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 disabled:opacity-0"
            >
              <ArrowLeft size={16} /> Back
            </button>
            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
                disabled={!canAdvance}
                className="focus-ring flex items-center gap-1.5 rounded-lg bg-mason-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-mason-green-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={!canAdvance || finishing}
                className="focus-ring flex items-center gap-1.5 rounded-lg bg-mason-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-mason-green-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
              >
                {finishing ? 'Saving…' : 'Finish'} <Check size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StepShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
        {title}
      </h2>
      {description && <p className="mb-4 text-sm text-gray-500">{description}</p>}
      {!description && <div className="mb-4" />}
      {children}
    </div>
  )
}
