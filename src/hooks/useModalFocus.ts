import { useEffect, useRef } from 'react'

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

// Foco para dentro do diálogo ao abrir, Tab preso nele, Esc fecha e o foco volta ao elemento de origem
export function useModalFocus<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const ref = useRef<T | null>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  // guarda quem tinha o foco antes de o diálogo abrir (um autoFocus interno já teria tirado o foco no efeito)
  const originRef = useRef<HTMLElement | null>(null)
  const wasOpen = useRef(false)
  if (open && !wasOpen.current) originRef.current = document.activeElement as HTMLElement | null
  wasOpen.current = open

  useEffect(() => {
    if (!open) return
    const items = () =>
      Array.from(ref.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
        el => !el.hasAttribute('disabled') && el.offsetParent !== null
      )
    const first = items()[0] ?? ref.current
    if (!ref.current?.contains(document.activeElement)) first?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        closeRef.current()
      } else if (e.key === 'Tab') {
        const list = items()
        if (list.length === 0) return
        const firstEl = list[0]
        const lastEl = list[list.length - 1]
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault()
          lastEl.focus()
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault()
          firstEl.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      originRef.current?.focus?.()
    }
  }, [open])

  return ref
}
