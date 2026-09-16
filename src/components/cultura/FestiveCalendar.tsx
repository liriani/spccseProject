import { useState, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────

type HolidayType = 'civil' | 'religious'

interface FestiveDay {
  id: string
  day: number
  month: number        // 1–12
  title: string
  chip: string         // ≤14 chars — fits inside the month card
  emoji: string
  type: HolidayType
  movable?: boolean    // Viernes Santo, etc.
  explanation: string
  examTip?: string
  examRelevance: 'high' | 'medium' | 'low'
}

// ─── Design tokens per holiday type ──────────────────────────────────────────

const TYPE_META: Record<HolidayType, { color: string; label: string }> = {
  civil:     { color: '#FF6B35', label: 'Nacional / Cívico' },
  religious: { color: '#1CB0F6', label: 'Religioso' },
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const FESTIVOS: FestiveDay[] = [
  {
    id: 'ano-nuevo',
    day: 1, month: 1,
    title: 'Año Nuevo',
    chip: 'Año Nuevo',
    emoji: '🎆',
    type: 'civil',
    explanation:
      'El 1 de enero marca el inicio del año civil. En España se celebra con la tradición de comer doce uvas al ritmo de las campanadas de la Puerta del Sol de Madrid, a las 12 de la noche del 31 de diciembre. Es festivo nacional en toda España.',
    examTip:
      'Las campanadas de la Puerta del Sol de Madrid marcan el comienzo del año en toda España.',
    examRelevance: 'medium',
  },
  {
    id: 'reyes',
    day: 6, month: 1,
    title: 'Epifanía del Señor · Día de Reyes',
    chip: 'Reyes Magos',
    emoji: '👑',
    type: 'religious',
    explanation:
      'El 6 de enero conmemora la visita de los Reyes Magos al niño Jesús, según el relato bíblico. En España es el día tradicional de los regalos, aunque Papá Noel gana terreno desde los años noventa. La noche del 5 de enero se celebran las Cabalgatas de Reyes en todas las ciudades del país.',
    examRelevance: 'medium',
  },
  {
    id: 'viernes-santo',
    day: 0, month: 4,
    title: 'Viernes Santo',
    chip: 'Viernes Santo',
    emoji: '✝️',
    type: 'religious',
    movable: true,
    explanation:
      'El Viernes Santo conmemora la crucifixión de Jesucristo. Es el único festivo nacional de carácter religioso que se mantiene como obligatorio en todo el territorio. Las procesiones de Semana Santa — especialmente las de Sevilla, Valladolid, Málaga y Zamora — son Patrimonio de Interés Turístico Internacional.',
    examTip:
      'La Semana Santa de Sevilla y Valladolid está declarada Patrimonio de Interés Turístico Internacional.',
    examRelevance: 'high',
  },
  {
    id: 'dia-trabajo',
    day: 1, month: 5,
    title: 'Fiesta del Trabajo',
    chip: 'Fiesta del Trabajo',
    emoji: '✊',
    type: 'civil',
    explanation:
      'El 1 de mayo es el Día Internacional de los Trabajadores. En España se celebra como Fiesta del Trabajo desde 1931, durante la Segunda República. Conmemora la lucha por los derechos laborales, en especial la jornada de ocho horas. Los principales sindicatos, CC.OO. y UGT, organizan manifestaciones en todo el país.',
    examTip:
      'Festivo internacional que recuerda la lucha por los derechos laborales. En vigor en España desde 1931.',
    examRelevance: 'high',
  },
  {
    id: 'asuncion',
    day: 15, month: 8,
    title: 'Asunción de la Virgen',
    chip: 'Asunción',
    emoji: '🌸',
    type: 'religious',
    explanation:
      'El 15 de agosto conmemora la Asunción de la Virgen María al Cielo según el dogma católico. Es festivo nacional en toda España y coincide con el punto álgido de las vacaciones de verano. Numerosas localidades celebran sus fiestas patronales en torno a esta fecha.',
    examRelevance: 'low',
  },
  {
    id: 'hispanidad',
    day: 12, month: 10,
    title: 'Fiesta Nacional de España · Día de la Hispanidad',
    chip: 'Fiesta Nacional',
    emoji: '🇪🇸',
    type: 'civil',
    explanation:
      'El 12 de octubre conmemora la llegada de Cristóbal Colón a América en 1492. Es la única Fiesta Nacional de España reconocida por ley (Ley 18/1987). Se celebra un desfile militar en el Paseo de la Castellana de Madrid, presidido por Sus Majestades los Reyes. También es el Día de la Guardia Civil y se reafirman los vínculos culturales con los países hispanohablantes del mundo.',
    examTip:
      '¡Pregunta clásica del CCSE! El 12 de octubre es la única Fiesta Nacional de España regulada por ley.',
    examRelevance: 'high',
  },
  {
    id: 'todos-santos',
    day: 1, month: 11,
    title: 'Todos los Santos',
    chip: 'Todos Santos',
    emoji: '🕯️',
    type: 'religious',
    explanation:
      'El 1 de noviembre es el Día de Todos los Santos, festividad cristiana en honor a todos los santos y mártires de la Iglesia. En España es tradición visitar los cementerios, llevar crisantemos y recordar a los familiares difuntos. La noche anterior, el 31 de octubre, coincide con Halloween, pero la tradición española tiene raíces mucho más antiguas.',
    examRelevance: 'medium',
  },
  {
    id: 'constitucion',
    day: 6, month: 12,
    title: 'Día de la Constitución Española',
    chip: 'Constitución',
    emoji: '📜',
    type: 'civil',
    explanation:
      'El 6 de diciembre conmemora la aprobación en referéndum de la Constitución española de 1978, que puso fin a la Transición democrática tras la dictadura franquista. El referéndum fue aprobado por el 87,78 % de los votantes. La Constitución estableció a España como un Estado social y democrático de Derecho con monarquía parlamentaria, redactada con el consenso de todas las fuerzas políticas del momento.',
    examTip:
      '¡Pregunta MUY frecuente! Año: 1978. Aprobada en referéndum el 6 de diciembre. Establece la monarquía parlamentaria.',
    examRelevance: 'high',
  },
  {
    id: 'inmaculada',
    day: 8, month: 12,
    title: 'Inmaculada Concepción',
    chip: 'Inmaculada',
    emoji: '💙',
    type: 'religious',
    explanation:
      'El 8 de diciembre celebra el dogma de la Inmaculada Concepción de la Virgen María, proclamado por el Papa Pío IX en 1854. Es festivo nacional en España y tiene especial arraigo en Andalucía, donde la devoción mariana es muy profunda. En muchas ciudades se celebran misas solemnes y procesiones.',
    examRelevance: 'low',
  },
  {
    id: 'navidad',
    day: 25, month: 12,
    title: 'Natividad del Señor · Navidad',
    chip: 'Navidad',
    emoji: '🎄',
    type: 'religious',
    explanation:
      'El 25 de diciembre, Navidad, conmemora el nacimiento de Jesucristo. En España es festivo nacional y el inicio de las celebraciones navideñas, que se prolongan hasta el 6 de enero. Son tradiciones españolas el belén, los villancicos, la Lotería de Navidad (22 de diciembre) y las uvas de Nochevieja el 31 de diciembre.',
    examTip:
      'El 28 de diciembre es el Día de los Inocentes en España, equivalente al April Fools\' Day.',
    examRelevance: 'medium',
  },
]

const MONTHS_SHORT = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
const MONTHS_FULL  = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

// ─── Component ────────────────────────────────────────────────────────────────

export function FestiveCalendar() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const detailRef = useRef<HTMLDivElement>(null)

  const byMonth = useMemo<Record<number, FestiveDay[]>>(() => {
    const map: Record<number, FestiveDay[]> = {}
    for (let m = 1; m <= 12; m++) map[m] = []
    FESTIVOS.forEach(f => map[f.month].push(f))
    return map
  }, [])

  const active = useMemo(() => FESTIVOS.find(f => f.id === activeId) ?? null, [activeId])

  const toggle = useCallback((id: string) => {
    setActiveId(prev => {
      const next = prev === id ? null : id
      if (next !== null) {
        // Scroll detail panel into view after animation frame
        requestAnimationFrame(() => {
          detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        })
      }
      return next
    })
  }, [])

  return (
    <section
      className="relative"
      aria-label="Calendario de Fiestas Nacionales de España"
    >
      {/* ── Section header ── */}
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-widest text-[#CE82FF] mb-1">Cultura</p>
        <h2
          className="font-black text-2xl text-[#1A1A2E]"
          style={{ fontFamily: "'Fredoka One', cursive" }}
        >
          Calendario de Fiestas Nacionales 📅
        </h2>
        <p className="text-sm text-[#1A1A2E]/50 mt-1">
          Selecciona un festivo para conocer su significado histórico
        </p>
      </div>

      {/* ── Month bento grid ── */}
      <div
        className="rounded-3xl p-4 mb-2"
        style={{
          background: 'linear-gradient(135deg, rgba(206,130,255,0.06) 0%, rgba(28,176,246,0.04) 100%)',
          border: '1px solid rgba(26,26,46,0.08)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
            const holidays = byMonth[month]
            const hasHolidays = holidays.length > 0
            const hasActiveHoliday = holidays.some(h => h.id === activeId)

            return (
              <div
                key={month}
                className="rounded-2xl p-2.5 flex flex-col min-h-[80px] transition-all duration-200"
                style={{
                  background: hasActiveHoliday
                    ? 'rgba(255,255,255,0.95)'
                    : hasHolidays
                    ? 'rgba(255,255,255,0.75)'
                    : 'rgba(26,26,46,0.03)',
                  border: hasActiveHoliday
                    ? '2px solid rgba(26,26,46,0.2)'
                    : hasHolidays
                    ? '1px solid rgba(26,26,46,0.1)'
                    : '1px solid rgba(26,26,46,0.05)',
                  boxShadow: hasActiveHoliday ? '2px 2px 0 rgba(26,26,46,0.12)' : 'none',
                }}
              >
                {/* Month label */}
                <span
                  className="text-[9px] font-black tracking-[0.12em] mb-2 leading-none"
                  style={{ color: hasHolidays ? 'rgba(26,26,46,0.45)' : 'rgba(26,26,46,0.18)' }}
                >
                  {MONTHS_SHORT[month - 1]}
                </span>

                {/* Holiday chips */}
                <div className="flex flex-col gap-1">
                  {holidays.map(h => {
                    const isSelected = h.id === activeId
                    const meta = TYPE_META[h.type]
                    return (
                      <motion.button
                        key={h.id}
                        className="w-full flex justify-between items-center rounded-lg px-1.5 py-1 text-[9px] font-black leading-tight border cursor-pointer focus:outline-none focus-visible:ring-2"
                        style={{
                          background: isSelected ? meta.color : `${meta.color}18`,
                          color: isSelected ? '#fff' : meta.color,
                          borderColor: isSelected ? meta.color : `${meta.color}45`,
                        }}
                        onClick={() => toggle(h.id)}
                        aria-pressed={isSelected}
                        aria-label={`${h.title} — ${h.movable ? 'fecha movible' : `${h.day} de ${MONTHS_FULL[h.month - 1]}`}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.93 }}
                        transition={{ type: 'spring', stiffness: 550, damping: 22 }}
                      >
                        <span className="flex items-center gap-0.5 min-w-0">
                          <span aria-hidden="true">{h.emoji} </span>
                          <span className="truncate">{h.chip}</span>
                        </span>
                        <span
                          className="flex-shrink-0 ml-1 opacity-50"
                          aria-hidden="true"
                        >
                          {h.movable ? '*' : h.day}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footnote */}
      <p className="text-[9px] text-[#1A1A2E]/30 font-bold pl-1 mb-5">
        * Fecha movible — varía cada año según el calendario litúrgico
      </p>

      {/* ── Detail panel ── */}
      <div ref={detailRef}>
        <AnimatePresence mode="wait">
          {active && (
            <motion.div
              key={active.id}
              className="rounded-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                boxShadow: `0 16px 48px rgba(26,26,46,0.25), 5px 5px 0 ${TYPE_META[active.type].color}`,
                border: '2px solid rgba(255,255,255,0.06)',
              }}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              role="region"
              aria-label={`Detalle: ${active.title}`}
            >
              <div className="p-6">
                {/* Top row: emoji + meta */}
                <div className="flex items-start gap-4 mb-5">
                  {/* Emoji disc */}
                  <motion.div
                    className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                    style={{
                      background: `${TYPE_META[active.type].color}22`,
                      border: `1px solid ${TYPE_META[active.type].color}40`,
                    }}
                    initial={{ rotate: -12, scale: 0.7 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.05 }}
                  >
                    {active.emoji}
                  </motion.div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white"
                        style={{ background: TYPE_META[active.type].color }}
                      >
                        {TYPE_META[active.type].label}
                      </span>
                      {active.examRelevance === 'high' && (
                        <motion.span
                          className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#FFC800] text-[#1A1A2E] flex items-center gap-1"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 600, damping: 18, delay: 0.12 }}
                        >
                          🎓 CCSE
                        </motion.span>
                      )}
                    </div>

                    {/* Title */}
                    <h3
                      className="font-black text-white text-lg leading-tight"
                      style={{ fontFamily: "'Fredoka One', cursive" }}
                    >
                      {active.title}
                    </h3>

                    {/* Date line */}
                    <p className="text-white/35 text-xs font-bold mt-1 tracking-wide">
                      {active.movable
                        ? '📆 Fecha movible (entre marzo y abril)'
                        : `📅 ${active.day} de ${MONTHS_FULL[active.month - 1]}`}
                    </p>
                  </div>
                </div>

                {/* Explanation */}
                <motion.p
                  className="text-sm text-white/70 leading-relaxed mb-5"
                  style={{
                    borderLeft: `3px solid ${TYPE_META[active.type].color}`,
                    paddingLeft: '0.875rem',
                  }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 }}
                >
                  {active.explanation}
                </motion.p>

                {/* Exam tip */}
                {active.examTip && (
                  <motion.div
                    className="flex items-start gap-3 rounded-2xl p-3.5"
                    style={{
                      background: 'rgba(255,200,0,0.08)',
                      border: '1px solid rgba(255,200,0,0.25)',
                    }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.14 }}
                  >
                    <span className="text-xl flex-shrink-0" aria-hidden="true">💡</span>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#FFC800]/60 mb-0.5">
                        Dato para el CCSE
                      </p>
                      <p className="text-xs font-bold text-[#FFC800]/85 leading-relaxed">
                        {active.examTip}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Bottom bar — close hint */}
              <div
                className="px-6 py-3 flex items-center justify-between border-t border-white/5"
                style={{ background: 'rgba(0,0,0,0.2)' }}
              >
                <span className="text-[10px] text-white/20 font-bold">
                  {active.movable ? `Mes: ${MONTHS_FULL[active.month - 1]}` : `${MONTHS_FULL[active.month - 1]} · festivo nacional`}
                </span>
                <motion.button
                  className="text-[10px] font-black text-white/30 hover:text-white/60 transition-colors cursor-pointer focus:outline-none"
                  onClick={() => setActiveId(null)}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Cerrar detalle"
                >
                  ✕ Cerrar
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Legend ── */}
      <div className="mt-5 flex flex-wrap items-center gap-4">
        {(Object.entries(TYPE_META) as [HolidayType, (typeof TYPE_META)[HolidayType]][]).map(
          ([, meta]) => (
            <div key={meta.label} className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: meta.color }}
                aria-hidden="true"
              />
              <span className="text-[10px] font-bold text-[#1A1A2E]/40">{meta.label}</span>
            </div>
          ),
        )}
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-black px-1.5 py-px rounded-full bg-[#FFC800] text-[#1A1A2E]">
            CCSE
          </span>
          <span className="text-[10px] font-bold text-[#1A1A2E]/40">Alta frecuencia en el examen</span>
        </div>
      </div>
    </section>
  )
}
