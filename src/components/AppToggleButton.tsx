export interface AppToggleButtonProps {
  appId?: string
  label: string
  isActive: boolean
  onToggle: () => void
  isHighContrast: boolean
  variant?: 'default' | 'prova' | 'sala'
}

export default function AppToggleButton({
  label,
  isActive,
  onToggle,
  isHighContrast,
  variant = 'default'
}: AppToggleButtonProps) {
  // Estilização ultra-moderna com gradientes suaves, sombras delicadas e bordas refinadas
  const activeStyle = isHighContrast
    ? 'border-2 border-[#0000FF] bg-[#0000FF]/15 text-[#0000FF] font-bold shadow-xs'
    : variant === 'sala'
      ? 'border-emerald-500/80 bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/50 text-emerald-950 dark:from-emerald-950/40 dark:to-emerald-900/20 dark:text-emerald-200 dark:border-emerald-500/60 shadow-xs ring-1 ring-emerald-500/20'
      : variant === 'prova'
        ? 'border-amber-500/80 bg-gradient-to-br from-amber-50/90 via-white to-amber-50/50 text-amber-950 dark:from-amber-950/40 dark:to-amber-900/20 dark:text-amber-200 dark:border-amber-500/60 shadow-xs ring-1 ring-amber-500/20'
        : 'border-[#002554]/50 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/50 text-[#002554] dark:from-blue-950/40 dark:to-slate-900 dark:text-blue-200 dark:border-blue-400/50 shadow-xs ring-1 ring-[#002554]/15'

  const inactiveStyle = isHighContrast
    ? 'border border-slate-400 opacity-60 text-slate-700 bg-white/40'
    : 'border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 opacity-70 hover:opacity-100 hover:border-slate-300 dark:hover:border-slate-700'

  const switchTrack = isHighContrast
    ? (isActive ? 'bg-[#0000FF]' : 'bg-slate-300')
    : variant === 'sala'
      ? (isActive ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700')
      : variant === 'prova'
        ? (isActive ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700')
        : (isActive ? 'bg-[#002554] dark:bg-blue-500' : 'bg-slate-200 dark:bg-slate-700')

  return (
    <button
      type="button"
      onClick={onToggle}
      title={`${label}: ${isActive ? 'Liberado / Ativado' : 'Bloqueado / Desativado'}`}
      className={`group relative flex w-full min-w-0 items-center justify-between gap-3 px-3.5 py-2.5 min-h-[48px] rounded-xl cursor-pointer transition-all duration-200 text-left select-none hover:-translate-y-0.5 active:translate-y-0 ${
        isActive ? activeStyle : inactiveStyle
      }`}
    >
      <span className="min-w-0 flex-1 text-xs font-semibold leading-snug [overflow-wrap:anywhere]">{label}</span>

      {/* Switch micro no estilo iOS */}
      <span
        className={`relative inline-flex h-4.5 w-8 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${switchTrack}`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
            isActive ? 'translate-x-3.5' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  )
}
