import React, { useEffect } from 'react'

export default function Modal({ open, title, onClose, children, className = '' }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    if (open) document.addEventListener('keydown', handleEsc)
    // Prevent body scroll when modal is open
    const originalOverflow = document.body.style.overflow
    if (open) document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = originalOverflow
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center px-4 py-8">
      <button aria-label="Cerrar" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div role="dialog" aria-modal="true" className={`relative w-full max-w-2xl max-h-[85vh] overflow-auto rounded-2xl border border-white/10 bg-bb-bg-primary/90 shadow-xl ${className}`}>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 px-6 py-5 border-b border-white/10 bg-bb-bg-primary/90">
          {title ? <h2 className="text-xl md:text-2xl font-bold">{title}</h2> : <span className="sr-only">Modal</span>}
          <button onClick={onClose} className="rounded-md p-2 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-primary" aria-label="Cerrar">✕</button>
        </div>
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}

