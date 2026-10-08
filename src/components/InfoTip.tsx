import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

interface InfoTipProps {
  children: ReactNode
  label?: string
  isHighContrast?: boolean
  align?: 'left' | 'right'
}

// Botão "i" que abre um balão com a explicação; substitui textos de ajuda longos
export default function InfoTip({ children, label = 'Mais informações', isHighContrast = false, align = 'left' }: InfoTipProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey, true)
    }
  }, [open])

  return (
    <span ref={ref} className="relative inline-flex align-middle" onClick={e => e.stopPropagation()}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-serif text-[0.8rem] font-bold italic leading-none ${
          isHighContrast ? 'bg-[#0000FF] text-[#FFFF00]' : 'bg-[#111827] text-white'
        }`}
      >
        i
      </button>
      {open && (
        <span
          role="status"
          className={`absolute top-full z-40 mt-2 w-60 max-w-[75vw] whitespace-normal rounded-lg border-2 p-3 text-left text-xs font-medium normal-case leading-snug shadow-lg ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${isHighContrast ? 'border-[#0000FF] bg-[#FFFF00] text-[#0000FF]' : 'border-[#111827] bg-white text-[#111827]'}`}
        >
          {children}
        </span>
      )}
    </span>
  )
}
