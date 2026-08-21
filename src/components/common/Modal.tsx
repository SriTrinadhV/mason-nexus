import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  maxWidth?: string
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      style={{ animation: 'modal-backdrop-in 150ms ease-out' }}
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'modal-panel-in 180ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        className={`max-h-[90vh] w-full ${maxWidth} overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 sm:rounded-2xl`}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-semibold tracking-tight text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="focus-ring rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
      <style>{`
        @keyframes modal-backdrop-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modal-panel-in { from { opacity: 0; transform: translateY(8px) scale(0.98) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>
    </div>
  )
}
