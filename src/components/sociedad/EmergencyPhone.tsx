import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EmergencyNumber {
  id: string
  number: string
  nameEs: string
  nameEn: string
  description: string
  whenToCall: string[]
  emoji: string
  free: boolean
  available: string
  priority: number
  urgencyColor: string
}

export type PhoneMode = 'idle' | 'dialing' | 'matched' | 'calling' | 'ended'

export interface PhoneState {
  dialedDigits: string
  mode: PhoneMode
  hoveredPresetId: string | null
  activePresetId: string | null
  matchedNumber: EmergencyNumber | null
  previewNumber: EmergencyNumber | null
}

// ─── Data ─────────────────────────────────────────────────────────────────────

export const EMERGENCY_NUMBERS: EmergencyNumber[] = [
  {
    id: 'emergencias',
    number: '112',
    nameEs: 'Emergencias generales',
    nameEn: 'Número europeo único de emergencias',
    description: 'El número único europeo de emergencias. Funciona en toda la UE, en cualquier red móvil, sin cobertura propia y sin tarjeta SIM.',
    whenToCall: [
      'Incendio (fuego en un edificio, forestal)',
      'Accidente de tráfico con heridos',
      'Atraco, agresión o delito en curso',
      'Persona inconsciente o con parada cardíaca',
      'No sabes a qué servicio llamar — te derivan ellos',
    ],
    emoji: '🆘',
    free: true,
    available: '24 h / 365 días',
    priority: 1,
    urgencyColor: '#DC2626',
  },
  {
    id: 'medica',
    number: '061',
    nameEs: 'Urgencias médicas (SEM / SAMUR)',
    nameEn: 'Urgencias médicas y ambulancias',
    description: 'Servicio de Emergencias Médicas. Envía ambulancias y proporciona primeros auxilios telefónicos.',
    whenToCall: [
      'Infarto o ictus (dolor pecho, cara caída, brazo débil)',
      'Accidente doméstico grave (quemadura, caída de escalera)',
      'Intoxicación o sobredosis',
      'Mujer en trabajo de parto urgente',
      'Reacción alérgica severa (anafilaxia)',
    ],
    emoji: '🚑',
    free: true,
    available: '24 h / 365 días',
    priority: 2,
    urgencyColor: '#DC2626',
  },
  {
    id: 'policia-nacional',
    number: '091',
    nameEs: 'Policía Nacional',
    nameEn: 'Seguridad en grandes ciudades',
    description: 'Cuerpo Nacional de Policía. Competente en ciudades y para delitos de ámbito nacional.',
    whenToCall: [
      'Robo o robo con violencia',
      'Denuncia de un delito',
      'Violencia de género (también 016)',
      'Documentación robada o perdida',
      'Situaciones de peligro en ciudad',
    ],
    emoji: '👮',
    free: true,
    available: '24 h / 365 días',
    priority: 3,
    urgencyColor: '#2563EB',
  },
  {
    id: 'guardia-civil',
    number: '062',
    nameEs: 'Guardia Civil',
    nameEn: 'Seguridad en carreteras y zonas rurales',
    description: 'Cuerpo de seguridad de ámbito rural, carreteras, fronteras y costas.',
    whenToCall: [
      'Accidente o peligro en carretera nacional o autopista',
      'Incidente en zonas rurales o montaña',
      'Delito en zonas fuera de ciudad',
      'Personas desaparecidas en el campo',
      'Tráfico de drogas o contrabando',
    ],
    emoji: '🛡️',
    free: true,
    available: '24 h / 365 días',
    priority: 4,
    urgencyColor: '#1d8fe8',
  },
  {
    id: 'policia-local',
    number: '092',
    nameEs: 'Policía Local / Municipal',
    nameEn: 'Policía municipal y tráfico urbano',
    description: 'Policía del Ayuntamiento. Gestiona el tráfico urbano, seguridad ciudadana local y ordenanzas municipales.',
    whenToCall: [
      'Accidente de tráfico en ciudad sin heridos',
      'Ruido o molestias vecinales',
      'Vehículo mal aparcado o en doble fila',
      'Peleas o altercados en la vía pública',
      'Primer contacto para cualquier incidencia local',
    ],
    emoji: '🚓',
    free: true,
    available: '24 h / 365 días',
    priority: 5,
    urgencyColor: '#4338CA',
  },
  {
    id: 'bomberos',
    number: '080',
    nameEs: 'Bomberos',
    nameEn: 'Extinción de incendios y rescate',
    description: 'Servicio de extinción de incendios y rescate. El número varía por ciudad — usa 112 si no recuerdas.',
    whenToCall: [
      'Incendio en vivienda o edificio',
      'Escape de gas (también avisar a la empresa)',
      'Accidente con atrapados',
      'Inundación o emergencia estructural',
      'Rescate de animales en situación de peligro',
    ],
    emoji: '🚒',
    free: true,
    available: '24 h / 365 días',
    priority: 6,
    urgencyColor: '#D97706',
  },
  {
    id: 'violencia-genero',
    number: '016',
    nameEs: 'Violencia de género',
    nameEn: 'Atención a víctimas — llamada confidencial',
    description: `Atención integral a las víctimas de violencia de género. La llamada no aparece en la factura del teléfono.`,
    whenToCall: [
      'Víctima de violencia de pareja o ex-pareja',
      'Acoso o amenazas por parte de tu pareja',
      'Testigo de violencia doméstica',
      'Buscar información sobre recursos y ayudas',
      'La llamada es confidencial y no figura en la factura',
    ],
    emoji: '💜',
    free: true,
    available: '24 h / 365 días — disponible en varios idiomas',
    priority: 7,
    urgencyColor: '#7C3AED',
  },
  {
    id: 'cruz-roja',
    number: '900202202',
    nameEs: 'Cruz Roja — Teleasistencia',
    nameEn: 'Personas mayores y en situación de vulnerabilidad',
    description: 'Servicio de ayuda para personas mayores, personas en situación de vulnerabilidad y en catástrofes.',
    whenToCall: [
      'Persona mayor que necesita asistencia',
      'Situación de vulnerabilidad o exclusión social',
      'Información sobre voluntariado y donaciones',
    ],
    emoji: '🔴',
    free: true,
    available: '24 h',
    priority: 8,
    urgencyColor: '#DC2626',
  },
]

// ─── Dial pad ─────────────────────────────────────────────────────────────────

const DIAL_PAD_KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', '#'],
]

const KEY_SUB: Record<string, string> = {
  '2': 'ABC', '3': 'DEF', '4': 'GHI', '5': 'JKL',
  '6': 'MNO', '7': 'PQRS', '8': 'TUV', '9': 'WXYZ',
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EmergencyPhone() {
  const [state, setState] = useState<PhoneState>({
    dialedDigits: '',
    mode: 'idle',
    hoveredPresetId: null,
    activePresetId: null,
    matchedNumber: null,
    previewNumber: null,
  })

  const callTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const findMatch = useCallback((digits: string): EmergencyNumber | null => {
    return EMERGENCY_NUMBERS.find(n => n.number === digits) ?? null
  }, [])

  const handleDigitPress = useCallback(
    (key: string) => {
      if (state.mode === 'calling' || state.mode === 'ended') return
      setState(s => {
        const next = s.dialedDigits + key
        const matched = findMatch(next)
        return { ...s, dialedDigits: next, mode: matched ? 'matched' : next.length > 0 ? 'dialing' : 'idle', matchedNumber: matched, activePresetId: null, previewNumber: null }
      })
    },
    [state.mode, findMatch],
  )

  const handleBackspace = useCallback(() => {
    if (state.mode === 'calling') return
    setState(s => {
      const next = s.dialedDigits.slice(0, -1)
      const matched = findMatch(next)
      return { ...s, dialedDigits: next, mode: matched ? 'matched' : next.length > 0 ? 'dialing' : 'idle', matchedNumber: matched }
    })
  }, [state.mode, findMatch])

  const handleClear = useCallback(() => {
    if (callTimerRef.current) clearTimeout(callTimerRef.current)
    setState(s => ({ ...s, dialedDigits: '', mode: 'idle', matchedNumber: null, activePresetId: null, previewNumber: null }))
  }, [])

  const handleCall = useCallback(() => {
    const target = state.matchedNumber
    if (!target || state.mode === 'calling') return
    setState(s => ({ ...s, mode: 'calling', activePresetId: target.id }))
    callTimerRef.current = setTimeout(() => {
      setState(s => ({ ...s, mode: 'ended' }))
    }, 4000)
  }, [state.matchedNumber, state.mode])

  const handleHangUp = useCallback(() => {
    if (callTimerRef.current) clearTimeout(callTimerRef.current)
    setState(s => ({ ...s, mode: 'idle', dialedDigits: '', matchedNumber: null, activePresetId: null, previewNumber: null }))
  }, [])

  const handlePresetMouseEnter = useCallback((num: EmergencyNumber) => {
    setState(s => ({ ...s, hoveredPresetId: num.id, previewNumber: num }))
  }, [])

  const handlePresetMouseLeave = useCallback(() => {
    setState(s => ({ ...s, hoveredPresetId: null, previewNumber: s.activePresetId ? s.matchedNumber : null }))
  }, [])

  const handlePresetClick = useCallback((num: EmergencyNumber) => {
    if (callTimerRef.current) clearTimeout(callTimerRef.current)
    setState(s => ({ ...s, dialedDigits: num.number, mode: 'matched', matchedNumber: num, activePresetId: num.id, hoveredPresetId: null, previewNumber: num }))
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (/^[0-9*#]$/.test(e.key)) handleDigitPress(e.key)
      else if (e.key === 'Backspace') handleBackspace()
      else if (e.key === 'Enter') handleCall()
      else if (e.key === 'Escape') handleHangUp()
    },
    [handleDigitPress, handleBackspace, handleCall, handleHangUp],
  )

  const displayedNumber = state.previewNumber ?? state.matchedNumber

  return (
    <section
      className="relative"
      data-mode={state.mode}
      aria-label="Teléfonos de emergencia en España"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* ── Section header ── */}
      <div className="mb-8">
        <p className="text-xs font-black uppercase tracking-widest text-[#DC2626] mb-1">Emergencias</p>
        <h2 className="font-black text-2xl text-[#1A1A2E]" style={{ fontFamily: "'Fredoka One', cursive" }}>
          Teléfonos de Emergencia 🚨
        </h2>
        <p className="text-sm text-[#1A1A2E]/50 mt-1">
          Marca o selecciona un número para ver su información
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* ── Phone device ── */}
        <div
          className="rounded-3xl overflow-hidden border-2 border-[#1A1A2E]/10"
          data-mode={state.mode}
          style={{ background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', boxShadow: '0 20px 60px rgba(26,26,46,0.3), inset 0 1px 0 rgba(255,255,255,0.1)' }}
        >
          {/* Screen */}
          <div
            className="px-6 pt-6 pb-4 min-h-[120px] flex flex-col justify-end"
            data-mode={state.mode}
            style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div
              className="text-right text-4xl font-black text-white tabular-nums tracking-wider mb-2 min-h-[48px] flex items-center justify-end"
              aria-live="polite"
              aria-label="Número marcado"
              style={{ fontFamily: 'monospace', letterSpacing: '0.15em' }}
            >
              {state.dialedDigits || <span className="text-white/20 text-2xl font-normal italic">Marca un número…</span>}
            </div>
            <div className="text-right text-xs font-bold" data-mode={state.mode} aria-live="assertive">
              {state.mode === 'idle'    && <span className="text-white/30">Listo</span>}
              {state.mode === 'dialing' && <span className="text-yellow-400">Marcando…</span>}
              {state.mode === 'matched' && displayedNumber && (
                <span style={{ color: displayedNumber.urgencyColor }}>{displayedNumber.emoji} {displayedNumber.nameEs}</span>
              )}
              {state.mode === 'calling' && displayedNumber && (
                <span className="text-green-400 animate-pulse">{displayedNumber.emoji} Llamando… {displayedNumber.number}</span>
              )}
              {state.mode === 'ended' && <span className="text-white/40">Llamada terminada</span>}
            </div>
          </div>

          {/* Dial pad */}
          <div className="p-5" role="group" aria-label="Teclado numérico">
            {DIAL_PAD_KEYS.map((row, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-3 gap-2.5 mb-2.5">
                {row.map(key => (
                  <motion.button
                    key={key}
                    className="flex flex-col items-center justify-center rounded-2xl border border-white/10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      height: 56,
                      background: 'rgba(255,255,255,0.06)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                    }}
                    data-key={key}
                    data-key-type={key === '*' || key === '#' ? 'symbol' : 'digit'}
                    onClick={() => handleDigitPress(key)}
                    aria-label={`Tecla ${key}`}
                    disabled={state.mode === 'calling' || state.mode === 'ended'}
                    whileHover={{ background: 'rgba(255,255,255,0.14)', borderColor: 'rgba(255,255,255,0.25)', scale: 1.03 }}
                    whileTap={{ scale: 0.92, background: 'rgba(255,255,255,0.2)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                  >
                    <span className="text-white font-black text-xl leading-none" style={{ fontFamily: 'monospace' }}>{key}</span>
                    {KEY_SUB[key] && (
                      <span className="text-white/30 text-[8px] font-bold tracking-widest mt-0.5" aria-hidden="true">{KEY_SUB[key]}</span>
                    )}
                  </motion.button>
                ))}
              </div>
            ))}

            {/* Action row */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Backspace */}
              <motion.button
                className="flex items-center justify-center rounded-2xl border border-white/10 text-white/50 text-xl cursor-pointer focus:outline-none disabled:opacity-20"
                style={{ height: 56, background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)' }}
                data-action="backspace"
                onClick={handleBackspace}
                aria-label="Borrar último dígito"
                disabled={state.mode === 'calling' || !state.dialedDigits}
                whileTap={{ scale: 0.9 }}
                whileHover={{ background: 'rgba(255,80,80,0.12)', borderColor: 'rgba(255,80,80,0.3)' }}
              >
                ⌫
              </motion.button>

              {/* Call / Hang up */}
              <AnimatePresence mode="wait">
                {state.mode !== 'calling' ? (
                  <motion.button
                    key="call"
                    className="flex items-center justify-center rounded-2xl text-white text-2xl cursor-pointer focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ height: 56, background: state.matchedNumber ? `linear-gradient(135deg, #22c55e, #16a34a)` : 'rgba(255,255,255,0.06)', boxShadow: state.matchedNumber ? '0 0 20px rgba(34,197,94,0.4)' : 'none', border: '1px solid rgba(255,255,255,0.1)' }}
                    data-action="call"
                    onClick={handleCall}
                    aria-label={`Llamar al ${state.dialedDigits || '…'}`}
                    disabled={!state.matchedNumber}
                    data-enabled={String(!!state.matchedNumber)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileTap={{ scale: 0.9 }}
                    whileHover={state.matchedNumber ? { scale: 1.05, boxShadow: '0 0 30px rgba(34,197,94,0.6)' } : {}}
                  >
                    📞
                  </motion.button>
                ) : (
                  <motion.button
                    key="hangup"
                    className="flex items-center justify-center rounded-2xl text-white text-2xl cursor-pointer focus:outline-none"
                    style={{ height: 56, background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 0 20px rgba(239,68,68,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
                    data-action="hangup"
                    onClick={handleHangUp}
                    aria-label="Colgar"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1, rotate: [0, 15, -15, 0] }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    📵
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Clear */}
              <motion.button
                className="flex items-center justify-center rounded-2xl border border-white/10 text-white/30 text-sm font-bold cursor-pointer focus:outline-none disabled:opacity-20"
                style={{ height: 56, background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)' }}
                data-action="clear"
                onClick={handleClear}
                aria-label="Borrar todo"
                disabled={!state.dialedDigits && state.mode === 'idle'}
                whileTap={{ scale: 0.9 }}
                whileHover={{ background: 'rgba(255,80,80,0.08)', borderColor: 'rgba(255,80,80,0.2)' }}
              >
                ✕
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── Right panel: info + presets ── */}
        <div className="flex flex-col gap-4">
          {/* Info panel */}
          <AnimatePresence mode="wait">
            {displayedNumber ? (
              <motion.aside
                key={displayedNumber.id}
                className="rounded-3xl p-5 border-2 overflow-hidden"
                style={{ borderColor: `${displayedNumber.urgencyColor}40`, background: `linear-gradient(135deg, ${displayedNumber.urgencyColor}10, ${displayedNumber.urgencyColor}05)`, backdropFilter: 'blur(8px)' }}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                role="complementary"
                aria-label={`Información: ${displayedNumber.nameEs}`}
                data-number-id={displayedNumber.id}
                data-mode={state.mode}
              >
                <header className="flex items-start gap-3 mb-3">
                  <div className="text-4xl flex-shrink-0">{displayedNumber.emoji}</div>
                  <div>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <strong className="font-black text-2xl" style={{ color: displayedNumber.urgencyColor, fontFamily: 'monospace' }}>
                        {displayedNumber.number}
                      </strong>
                      <span
                        className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white"
                        style={{ background: displayedNumber.urgencyColor }}
                      >
                        {displayedNumber.free ? 'Gratuito' : 'De pago'}
                      </span>
                    </div>
                    <h3 className="font-black text-[#1A1A2E] text-sm mt-0.5">{displayedNumber.nameEs}</h3>
                    <p className="text-[#1A1A2E]/40 text-xs">{displayedNumber.nameEn}</p>
                  </div>
                </header>

                <p className="text-sm text-[#1A1A2E]/70 mb-3 leading-relaxed" style={{ borderLeft: `3px solid ${displayedNumber.urgencyColor}`, paddingLeft: '0.75rem' }}>
                  {displayedNumber.description}
                </p>

                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]/40 mb-2">¿Cuándo llamar?</h4>
                  <ul className="space-y-1.5">
                    {displayedNumber.whenToCall.map((when, i) => (
                      <motion.li
                        key={when}
                        className="flex items-start gap-2 text-xs text-[#1A1A2E]/70"
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <span style={{ color: displayedNumber.urgencyColor }} className="flex-shrink-0 mt-0.5">→</span>
                        {when}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="mt-3 pt-3 border-t border-[#1A1A2E]/10 flex items-center justify-between">
                  <span className="text-[10px] text-[#1A1A2E]/40 font-bold">{displayedNumber.available}</span>
                  {state.mode === 'calling' && (
                    <span className="text-xs font-black text-green-600 animate-pulse">● Llamando…</span>
                  )}
                </div>
              </motion.aside>
            ) : (
              <motion.div
                key="empty"
                className="rounded-3xl p-8 border-2 border-dashed border-[#1A1A2E]/10 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-sm text-[#1A1A2E]/30 font-bold text-center">
                  Pasa el cursor por un número<br />o empieza a marcar 👆
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Speed-dial presets */}
          <nav className="grid grid-cols-2 gap-2" aria-label="Números de emergencia rápidos">
            {[...EMERGENCY_NUMBERS].sort((a, b) => a.priority - b.priority).map(num => {
              const isActive = state.activePresetId === num.id
              const isHovered = state.hoveredPresetId === num.id
              return (
                <motion.button
                  key={num.id}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border-2 cursor-pointer text-left focus:outline-none focus:ring-2"
                  style={{
                    borderColor: isActive || isHovered ? `${num.urgencyColor}60` : 'rgba(26,26,46,0.08)',
                    background: isActive ? `${num.urgencyColor}12` : isHovered ? `${num.urgencyColor}08` : 'rgba(255,255,255,0.6)',
                    focusRingColor: num.urgencyColor,
                  }}
                  data-number-id={num.id}
                  data-number={num.number}
                  data-active={String(isActive)}
                  data-hovered={String(isHovered)}
                  onMouseEnter={() => handlePresetMouseEnter(num)}
                  onMouseLeave={handlePresetMouseLeave}
                  onClick={() => handlePresetClick(num)}
                  aria-label={`${num.number} — ${num.nameEs}`}
                  aria-pressed={isActive}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <span className="text-xl flex-shrink-0">{num.emoji}</span>
                  <div className="min-w-0">
                    <div className="font-black text-sm tabular-nums" style={{ color: num.urgencyColor, fontFamily: 'monospace' }}>
                      {num.number}
                    </div>
                    <div className="text-[10px] font-bold text-[#1A1A2E]/60 truncate">{num.nameEs}</div>
                  </div>
                </motion.button>
              )
            })}
          </nav>
        </div>
      </div>
    </section>
  )
}
