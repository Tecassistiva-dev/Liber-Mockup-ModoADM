import React, { useEffect, useRef, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Eye, EyeOff, Minus, Plus } from 'lucide-react'
import {
  BLUETOOTH_FOUND_DEVICES,
  SETTINGS_CATEGORIES,
  SETTINGS_OUTLINE,
  WIFI_NETWORKS,
  countOutlineLeaves,
  isValidIpv4,
  parseColorCombo,
  parsePaired,
  runConnectionAction,
  settingsNodeId,
  type OutlineNode,
  type SettingItem
} from '../data/settings'

interface SettingsPanelProps {
  values: Record<string, string>
  onSet: (key: string, value: string) => void
  onApply: (changes: Record<string, string>) => void
  notify: (message: string) => void
  isHighContrast: boolean
  presetName: string
  presetNote: string
  onResetPreset: () => void
  open: Record<string, boolean>
  onToggle: (id: string) => void
  onSetAll: (open: boolean) => void
  highlightId: string | null
}

function ColorCarousel({
  values,
  current,
  onPick,
  isHighContrast,
  label
}: {
  values: string[]
  current: string
  onPick: (value: string) => void
  isHighContrast: boolean
  label: string
}) {
  const scroller = useRef<HTMLDivElement>(null)
  const selected = parseColorCombo(current)

  // Mantém a opção escolhida centralizada, sem rolar a página na vertical
  useEffect(() => {
    const box = scroller.current
    const el = box?.querySelector<HTMLElement>('[aria-checked="true"]')
    if (!box || !el) return
    box.scrollTo({ left: el.offsetLeft - (box.clientWidth - el.clientWidth) / 2, behavior: 'smooth' })
  }, [current])

  const scrollBy = (dir: number) => scroller.current?.scrollBy({ left: dir * 360, behavior: 'smooth' })

  const step = (dir: number) => {
    const next = values[(values.indexOf(current) + dir + values.length) % values.length]
    onPick(next)
  }

  const arrowBtn = `flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${isHighContrast
    ? 'border-[#0000FF] text-[#0000FF] hover:bg-[#0000FF] hover:text-[#FFFF00]'
    : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100'}`

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 rounded-full border border-slate-300 bg-white/70 py-1 pl-1 pr-3 text-xs font-bold">
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-300 font-display text-[11px] font-extrabold"
            style={{ background: selected.bg, color: selected.fg }}
            aria-hidden="true"
          >
            Aa
          </span>
          <span className="truncate">{current}</span>
        </span>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" aria-label="Combinações anteriores" className={arrowBtn} onClick={() => scrollBy(-1)}>
            <ChevronLeft size={16} />
          </button>
          <button type="button" aria-label="Próximas combinações" className={arrowBtn} onClick={() => scrollBy(1)}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scroller}
          role="radiogroup"
          aria-label={label}
          onKeyDown={e => {
            if (e.key === 'ArrowRight') { e.preventDefault(); step(1) }
            if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1) }
          }}
          className="relative flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-1 py-2 no-scrollbar"
        >
          {values.map(v => {
            const c = parseColorCombo(v)
            const active = v === current
            return (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={v}
                tabIndex={active ? 0 : -1}
                onClick={() => onPick(v)}
                className={`relative w-[112px] shrink-0 snap-center overflow-hidden rounded-xl border-2 text-left transition-all duration-200 ${active
                  ? (isHighContrast ? 'border-[#0000FF] ring-2 ring-[#0000FF]/40' : 'border-[#002554] ring-2 ring-[#2dd4bf]/60 shadow-md')
                  : 'border-slate-200 hover:border-slate-400'
                  }`}
              >
                <div
                  className="flex h-11 items-center justify-center font-display text-xl font-extrabold"
                  style={{ background: c.bg, color: c.fg }}
                >
                  Aa
                </div>
                <div className="bg-white px-2 py-1.5 text-[11px] font-semibold leading-tight text-slate-700">{v}</div>
                {active && (
                  <span className={`absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full shadow ${isHighContrast ? 'bg-[#0000FF] text-[#FFFF00]' : 'bg-[#002554] text-white'}`}>
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-white to-transparent" />
      </div>
    </div>
  )
}

function TextSetting({
  item,
  value,
  onSave,
  notify,
  isHighContrast
}: {
  item: Extract<SettingItem, { kind: 'text' }>
  value: string
  onSave: (value: string) => void
  notify: (message: string) => void
  isHighContrast: boolean
}) {
  const [draft, setDraft] = useState(value)
  const [reveal, setReveal] = useState(false)

  useEffect(() => setDraft(value), [value])

  const save = () => {
    const next = draft.trim()
    if (item.validate === 'ipv4' && !isValidIpv4(next)) {
      notify('Endereço IP inválido.')
      return
    }
    onSave(next)
    notify(`Salvo: ${item.label}.`)
  }

  const masked = item.secret && !reveal
  const btn = isHighContrast
    ? 'min-h-11 rounded-xl border border-[#0000FF] px-4 py-2.5 text-[13px] font-bold text-[#0000FF] hover:bg-[#0000FF] hover:text-[#FFFF00]'
    : 'min-h-11 rounded-xl border border-slate-300 bg-white/80 px-4 py-2.5 text-[13px] font-bold text-slate-700 shadow-xs hover:bg-white hover:border-slate-400'

  return (
    <form
      className="flex flex-wrap items-center gap-2.5"
      onSubmit={e => {
        e.preventDefault()
        save()
      }}
    >
      <div className="relative w-full max-w-md">
        <input
          type={masked ? 'password' : 'text'}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder={item.placeholder}
          aria-label={item.label}
          autoComplete="off"
          spellCheck={false}
          className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 pr-11 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2dd4bf]"
        />
        {item.secret && (
          <button
            type="button"
            onClick={() => setReveal(prev => !prev)}
            aria-label={reveal ? 'Ocultar' : 'Mostrar'}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-slate-800"
          >
            {reveal ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      <button type="submit" className={btn} disabled={draft.trim() === value}>Salvar</button>
    </form>
  )
}

export default function SettingsPanel({
  values,
  onSet,
  onApply,
  notify,
  isHighContrast,
  presetName,
  presetNote,
  onResetPreset,
  open,
  onToggle,
  onSetAll,
  highlightId,
}: SettingsPanelProps) {
  const [confirming, setConfirming] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [listShown, setListShown] = useState<Record<string, boolean>>({})
  const scanTimer = useRef<number | null>(null)

  useEffect(() => () => { if (scanTimer.current) window.clearTimeout(scanTimer.current) }, [])

  const optionBtn = (active: boolean) => `flex min-h-11 items-center gap-2 py-2.5 px-4 rounded-xl text-[13px] font-bold border transition-colors duration-200 text-center ${active
    ? (isHighContrast ? 'bg-[#0000FF] text-[#FFFF00] border-[#0000FF]' : 'bg-[#002554] text-white border-[#002554] shadow-sm')
    : 'border-slate-200/90 bg-white/80 hover:bg-white text-slate-700 hover:border-slate-300'
    }`

  const plainBtn = isHighContrast
    ? 'min-h-11 py-2.5 px-4 rounded-xl text-[13px] font-bold border border-[#0000FF] text-[#0000FF] hover:bg-[#0000FF] hover:text-[#FFFF00]'
    : 'min-h-11 py-2.5 px-4 rounded-xl text-[13px] font-bold border border-slate-300 bg-white/80 text-slate-700 hover:bg-white hover:border-slate-400 shadow-xs'

  const dangerBtn = 'min-h-11 py-2.5 px-4 rounded-xl text-[13px] font-bold border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100'

  const flash = (id: string) => (highlightId === id ? 'rounded-lg ring-2 ring-[#2dd4bf] ring-offset-2 transition-shadow' : '')

  const runConnection = (kind: 'wifi' | 'bluetooth', action: 'connect' | 'pair' | 'toggle', name: string) => {
    const { changes, message } = runConnectionAction(kind, action, name, values)
    onApply(changes)
    notify(message)
  }

  // ---------- peças da árvore ----------

  // Item: abre e fecha como qualquer menu (＋ / －). Fechado mostra só o nome e o valor atual; as opções aparecem ao abrir
  const leaf = (id: string, label: string, control: React.ReactNode, opts: { summary?: string; note?: string; root?: boolean } = {}) => {
    const isOpen = !!open[id]
    return (
      <div key={id} id={`cfg-${id}`} className={`${opts.root ? 'tree-root' : 'tree-node'} scroll-mt-24`}>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={`cfg-body-${id}`}
          onClick={() => onToggle(id)}
          className={`tree-row w-full text-left ${flash(id)}`}
        >
          <span className="tree-toggle" aria-hidden="true">
            {isOpen ? <Minus size={12} strokeWidth={3} /> : <Plus size={12} strokeWidth={3} />}
          </span>
          <span className={opts.root ? 'font-display text-base font-extrabold' : 'text-sm font-semibold'}>{label}</span>
          {opts.summary && <span className="ml-auto truncate pl-2 text-xs font-semibold opacity-60">{opts.summary}</span>}
        </button>
        {isOpen && (
          <div id={`cfg-body-${id}`} className="tree-body">
            {opts.note && <p className="mb-2 text-xs opacity-70">{opts.note}</p>}
            {control}
          </div>
        )}
      </div>
    )
  }

  // Nó que abre e fecha (+ / −): categoria, grupo, Wi-Fi, seleção de perfil
  const container = (id: string, label: string, summary: string | undefined, children: React.ReactNode, root = false) => {
    const isOpen = !!open[id]
    return (
      <div key={id} id={`cfg-${id}`} className={`${root ? 'tree-root' : 'tree-node'} scroll-mt-24`}>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={`cfg-body-${id}`}
          onClick={() => onToggle(id)}
          className={`tree-row w-full text-left ${flash(id)}`}
        >
          <span className="tree-toggle" aria-hidden="true">
            {isOpen ? <Minus size={12} strokeWidth={3} /> : <Plus size={12} strokeWidth={3} />}
          </span>
          <span className={`font-display font-extrabold ${root ? 'text-base' : 'text-sm'}`}>{label}</span>
          {summary && <span className="ml-auto truncate pl-2 text-xs font-semibold opacity-60">{summary}</span>}
        </button>
        {isOpen && <div id={`cfg-body-${id}`} className="tree-children">{children}</div>}
      </div>
    )
  }

  const chips = (content: React.ReactNode) => <div className="flex flex-wrap items-center gap-2.5">{content}</div>

  // ---------- blocos especiais ----------

  const renderWifi = (item: Extract<SettingItem, { kind: 'wifi' }>) => {
    const on = values.wifi === 'Ligado'
    const connected = values.wifiRede
    return container(item.id, item.label, on ? (connected ? `Ligado · ${connected}` : 'Ligado') : 'Desligado', (
      <>
        {leaf('wifiEstado', 'Wi-Fi', chips(
          <>
            <button type="button" aria-pressed={on} className={optionBtn(on)} onClick={() => onSet('wifi', 'Ligado')}>Ligar</button>
            <button type="button" aria-pressed={!on} className={optionBtn(!on)} onClick={() => onSet('wifi', 'Desligado')}>Desligar</button>
          </>
        ), { summary: on ? 'Ligado' : 'Desligado' })}
        {leaf('wifiRedes', 'Redes Wi-Fi', on
          ? chips(WIFI_NETWORKS.map(name => (
            <button key={name} type="button" aria-pressed={connected === name} className={optionBtn(connected === name)} onClick={() => runConnection('wifi', 'connect', name)}>
              {connected === name && <Check size={14} strokeWidth={3} />}
              {name}
            </button>
          )))
          : <p className="text-xs opacity-70">Ligue o Wi-Fi para ver as redes disponíveis.</p>, { summary: connected || undefined })}
      </>
    ))
  }

  const startScan = () => {
    if (values.bluetooth !== 'Sim') {
      notify('Bluetooth desligado. Ligue-o primeiro.')
      return
    }
    setListShown(prev => ({ ...prev, btScan: true }))
    setScanning(true)
    if (scanTimer.current) window.clearTimeout(scanTimer.current)
    scanTimer.current = window.setTimeout(() => setScanning(false), 1500)
  }

  const renderDeviceList = (item: Extract<SettingItem, { kind: 'deviceList' }>) => {
    const isScan = item.id === 'btScan'
    const shown = !!listShown[item.id]
    const paired = parsePaired(values)
    const connected = values.btDispositivo
    const control = (
      <div className="space-y-3">
        <button
          type="button"
          className={plainBtn}
          onClick={() => {
            if (isScan) startScan()
            else setListShown(prev => ({ ...prev, btPaired: !prev.btPaired }))
          }}
        >
          {isScan ? 'Procurar' : shown ? 'Ocultar lista' : 'Mostrar lista'}
        </button>
        {shown && isScan && (
          scanning ? (
            <p className="flex items-center gap-2 text-xs font-semibold opacity-80" role="status">
              <span className="inline-block h-2 w-2 animate-ping rounded-full bg-[#2dd4bf]" />
              A procurar dispositivos Bluetooth…
            </p>
          ) : chips(BLUETOOTH_FOUND_DEVICES.map(name => (
            <button key={name} type="button" aria-pressed={connected === name} className={optionBtn(connected === name)} onClick={() => runConnection('bluetooth', 'pair', name)}>
              {paired.includes(name) && <Check size={14} strokeWidth={3} />}
              {name}
            </button>
          )))
        )}
        {shown && !isScan && (
          paired.length === 0
            ? <p className="text-xs opacity-70">Nenhum dispositivo pareado.</p>
            : chips(paired.map(name => (
              <button key={name} type="button" aria-pressed={connected === name} className={optionBtn(connected === name)} onClick={() => runConnection('bluetooth', 'toggle', name)}>
                {connected === name && <Check size={14} strokeWidth={3} />}
                {name}
              </button>
            )))
        )}
      </div>
    )
    return leaf(item.id, item.label, control)
  }

  const renderItem = (item: SettingItem, root = false): React.ReactNode => {
    switch (item.kind) {
      case 'choice': {
        if (item.swatch) {
          return leaf(item.key, item.label, (
            <ColorCarousel label={item.label} values={item.values} current={values[item.key]} onPick={v => onSet(item.key, v)} isHighContrast={isHighContrast} />
          ), { summary: values[item.key], root })
        }
        const current = values[item.key]
        return leaf(item.key, item.label, chips(item.values.map(v => (
          <button key={v} type="button" onClick={() => onSet(item.key, v)} aria-pressed={current === v} className={optionBtn(current === v)}>{v}</button>
        ))), { summary: current, root })
      }
      case 'number': {
        const current = Number(values[item.key])
        const set = (n: number) => onSet(item.key, String(Math.min(item.max, Math.max(item.min, n))))
        return leaf(item.key, item.label, (
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" aria-label={`Diminuir ${item.label}`} disabled={current <= item.min} onClick={() => set(current - 1)} className={`${plainBtn} disabled:opacity-40`}>
              <Minus size={14} />
            </button>
            <input
              type="range"
              min={item.min}
              max={item.max}
              value={current}
              aria-label={item.label}
              onChange={e => set(Number(e.target.value))}
              className="h-8 min-w-[7rem] flex-1 accent-[#002554]"
            />
            <button type="button" aria-label={`Aumentar ${item.label}`} disabled={current >= item.max} onClick={() => set(current + 1)} className={`${plainBtn} disabled:opacity-40`}>
              <Plus size={14} />
            </button>
            <span className="w-8 text-center text-sm font-bold">{current}</span>
          </div>
        ), { summary: String(current), note: `De ${item.min} a ${item.max}`, root })
      }
      case 'scale': {
        const idx = Math.max(0, item.values.indexOf(values[item.key]))
        const setIdx = (n: number) => onSet(item.key, item.values[Math.min(item.values.length - 1, Math.max(0, n))])
        return leaf(item.key, item.label, (
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" aria-label={`Diminuir ${item.label}`} disabled={idx <= 0} onClick={() => setIdx(idx - 1)} className={`${plainBtn} disabled:opacity-40`}>
              <Minus size={14} />
            </button>
            <input
              type="range"
              min={0}
              max={item.values.length - 1}
              value={idx}
              aria-label={item.label}
              aria-valuetext={item.values[idx]}
              onChange={e => setIdx(Number(e.target.value))}
              className="h-8 min-w-[7rem] flex-1 accent-[#002554]"
            />
            <button type="button" aria-label={`Aumentar ${item.label}`} disabled={idx >= item.values.length - 1} onClick={() => setIdx(idx + 1)} className={`${plainBtn} disabled:opacity-40`}>
              <Plus size={14} />
            </button>
            <span className="min-w-[3.5rem] text-sm font-bold">{item.values[idx]}</span>
          </div>
        ), { summary: item.values[idx], note: `De ${item.values[0]} a ${item.values[item.values.length - 1]}`, root })
      }
      case 'text':
        return leaf(item.key, item.label, (
          <TextSetting item={item} value={values[item.key] ?? ''} onSave={v => onSet(item.key, v)} notify={notify} isHighContrast={isHighContrast} />
        ), { summary: item.secret ? (values[item.key] ? '••••••' : 'Não definido') : (values[item.key] || 'Não definido'), root })
      case 'action':
        return leaf(item.id, item.label, <button type="button" className={plainBtn} onClick={() => notify(item.message)}>Executar</button>, { root })
      case 'confirm':
        return leaf(item.id, item.label, (
          <div className="space-y-2">
            <button type="button" className={plainBtn} onClick={() => setConfirming(`confirm:${item.id}`)}>Iniciar</button>
            {confirming === `confirm:${item.id}` && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold">{item.question}</span>
                <button type="button" className={dangerBtn} onClick={() => setConfirming(null)}>Sim</button>
                <button type="button" className={plainBtn} onClick={() => setConfirming(null)}>Não</button>
              </div>
            )}
          </div>
        ), { root })
      case 'status':
        return leaf(item.id, item.label, <div className="text-sm font-semibold">{item.text}</div>, { root })
      case 'placeholder':
        return leaf(item.id, item.label, <p className="text-xs opacity-70">Ainda sem opções definidas.</p>, { summary: 'Em definição', root })
      case 'wifi':
        return renderWifi(item)
      case 'deviceList':
        return renderDeviceList(item)
      case 'group': {
        const node: OutlineNode | undefined = findNode(item.id)
        return container(
          item.id,
          item.label,
          item.note ?? (node ? `${countOutlineLeaves(node)} opções` : undefined),
          item.items.map(i => renderItem(i))
        )
      }
    }
  }

  return (
    <div className="space-y-5" style={(isHighContrast
        ? { '--tree-line': '#0000FF', '--tree-divider': '#0000FF', '--tree-strip-bg': '#0000FF', '--tree-strip-fg': '#FFFF00', '--tree-ink': '#0000FF', '--tree-ink-soft': '#0000FF' }
        : { '--tree-line': '#6b7280' }) as unknown as React.CSSProperties}>
      <div className={`flex flex-wrap items-center justify-between gap-4 ${isHighContrast ? 'border-2 border-[#0000FF] rounded-2xl p-4' : 'rounded-lg border-2 border-[#111827] bg-[#eceef2] p-4 sm:p-5'}`}>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-70">Preset do perfil</div>
          <div className="mt-0.5 font-display text-base font-extrabold">{presetName}</div>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed opacity-80">{presetNote}</p>
        </div>
        <button type="button" className={plainBtn} onClick={onResetPreset}>Restaurar preset</button>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button type="button" className={plainBtn} onClick={() => onSetAll(true)}>Expandir tudo</button>
        <button type="button" className={plainBtn} onClick={() => onSetAll(false)}>Recolher tudo</button>
      </div>

      <div className="flex flex-col gap-3">
        {SETTINGS_CATEGORIES.filter(cat => !cat.hideInPanel).map(cat => {
          if (cat.single) return renderItem(cat.items[0], true)
          const node = SETTINGS_OUTLINE.find(n => n.id === cat.id)
          return container(
            cat.id,
            cat.label,
            node ? `${countOutlineLeaves(node)} opções` : undefined,
            cat.items.map(i => renderItem(i)),
            true
          )
        })}
      </div>
    </div>
  )
}

function findNode(id: string, nodes: OutlineNode[] = SETTINGS_OUTLINE): OutlineNode | undefined {
  for (const n of nodes) {
    if (n.id === id) return n
    const found = n.children ? findNode(id, n.children) : undefined
    if (found) return found
  }
  return undefined
}

// mantém a referência usada em outros módulos
export { settingsNodeId }
