import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────

export type DayPeriod =
  | 'madrugada'   // 00:00–06:59
  | 'manana'      // 07:00–11:59
  | 'mediodia'    // 12:00–15:59
  | 'tarde'       // 16:00–20:59
  | 'noche'       // 21:00–23:59

export interface RoutineSlot {
  id: string
  startHour: number
  endHour: number
  label: string
  activity: string
  food: string
  place: string
  culturalNote: string
  period: DayPeriod
  emoji: string
}

// ─── Sky gradients per period ─────────────────────────────────────────────────

const PERIOD_SKY: Record<DayPeriod, { gradient: string; accent: string; text: string }> = {
  madrugada: {
    gradient: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a3e 60%, #2a1f4e 100%)',
    accent: '#7C3AED',
    text: '#E0D0FF',
  },
  manana: {
    gradient: 'linear-gradient(180deg, #FF6B35 0%, #FFB347 40%, #87CEEB 100%)',
    accent: '#FF6B35',
    text: '#7f1d1d',
  },
  mediodia: {
    gradient: 'linear-gradient(180deg, #1d8fe8 0%, #56b4f5 50%, #c8e6fa 100%)',
    accent: '#1d8fe8',
    text: '#1e3a5f',
  },
  tarde: {
    gradient: 'linear-gradient(180deg, #FF8C42 0%, #FFD166 50%, #ffe5b0 100%)',
    accent: '#FF8C42',
    text: '#7f3a0a',
  },
  noche: {
    gradient: 'linear-gradient(180deg, #1a1a3e 0%, #2d1b5e 40%, #4a1942 100%)',
    accent: '#9B59B6',
    text: '#E8D5FF',
  },
}

// ─── Data ─────────────────────────────────────────────────────────────────────

export const ROUTINE_SLOTS: RoutineSlot[] = [
  {
    id: 'madrugada',
    startHour: 0,
    endHour: 7,
    label: 'Madrugada',
    activity: 'Sueño',
    food: '—',
    place: 'Casa',
    culturalNote: `La vida nocturna española suele acabar aquí, no empezar. Las discotecas cierran a las 06:00 en la mayoría de las ciudades.`,
    period: 'madrugada',
    emoji: '🌙😴',
  },
  {
    id: 'desayuno',
    startHour: 7,
    endHour: 10,
    label: 'Desayuno',
    activity: 'Café y desayuno',
    food: 'Café con leche + tostada con tomate y aceite, o churros',
    place: 'Bar / cafetería o casa',
    culturalNote: `El desayuno español es ligero: la comida fuerte llega al mediodía. Mucha gente para en el bar de camino al trabajo.`,
    period: 'manana',
    emoji: '☕🥐',
  },
  {
    id: 'media-manana',
    startHour: 10,
    endHour: 12,
    label: 'Media mañana',
    activity: 'Almuerzo / bocadillo',
    food: 'Bocadillo de jamón, tortilla, o calamares',
    place: 'Bar de empresa o cafetería',
    culturalNote: `El descanso de las 10–11h (el almuerzo) es una pausa cultural propia: ni desayuno ni comida. Muy habitual en Andalucía y en la Comunitat Valenciana.`,
    period: 'manana',
    emoji: '🥖🫙',
  },
  {
    id: 'aperitivo',
    startHour: 12,
    endHour: 14,
    label: 'Aperitivo',
    activity: 'Vermut y tapas',
    food: 'Vermut con aceitunas, berberechos, patatas bravas',
    place: 'Bar de barrio o mercado',
    culturalNote: `El vermut es un ritual de fin de semana, especialmente los domingos. Los amigos quedan para tomar algo antes de comer — no es una comida en sí, sino un rito social.`,
    period: 'mediodia',
    emoji: '🍸🫒',
  },
  {
    id: 'comida',
    startHour: 14,
    endHour: 16,
    label: 'La Comida',
    activity: 'La comida principal del día',
    food: 'Paella, cocido madrileño, gazpacho, pescado a la plancha',
    place: 'Casa o restaurante (menú del día)',
    culturalNote: `La comida es la más abundante e importante del día. Muchos restaurantes ofrecen el menú del día (primer plato, segundo, postre y bebida) por 10–15 €. Los comercios cierran de 14:00 a 17:00 por este motivo.`,
    period: 'mediodia',
    emoji: '🥘🍷',
  },
  {
    id: 'siesta',
    startHour: 15,
    endHour: 17,
    label: 'Siesta',
    activity: 'Descanso / siesta',
    food: 'Café solo después de comer',
    place: 'Casa',
    culturalNote: `La siesta existe, aunque va desapareciendo en las ciudades. Sigue siendo habitual en pueblos pequeños y en el sur. Los comercios y oficinas cierran con frecuencia de 14:00 a 17:00. Es un descanso tras la comida, no solo un sueño.`,
    period: 'mediodia',
    emoji: '😪☕',
  },
  {
    id: 'merienda',
    startHour: 17,
    endHour: 20,
    label: 'Merienda',
    activity: 'Merienda',
    food: 'Chocolate con churros, fruta, bocadillo, galletas con leche',
    place: 'Casa, cafetería, parque',
    culturalNote: `Un tentempié ligero por la tarde, especialmente importante para los niños al salir del colegio. Los adultos suelen tomar café o algo dulce entre las 17 y las 18h.`,
    period: 'tarde',
    emoji: '🍫🧃',
  },
  {
    id: 'paseo-tapas',
    startHour: 20,
    endHour: 22,
    label: 'Paseo y tapas',
    activity: 'Paseo, tapas y pinchos',
    food: 'Tapas variadas, pinchos, cañas de cerveza',
    place: 'Calle, bares del barrio, plaza',
    culturalNote: `El paseo vespertino es social y sin prisas. Salir a tomar tapas a las 20h es completamente normal — la cena no empieza hasta las 21:00 como muy pronto.`,
    period: 'noche',
    emoji: '🚶🍺',
  },
  {
    id: 'cena',
    startHour: 21,
    endHour: 23,
    label: 'La Cena',
    activity: 'Cena',
    food: 'Tortilla de patatas, ensalada, sopa, bocadillo, revuelto de setas',
    place: 'Casa o restaurante',
    culturalNote: `La cena es ligera y tardía para el estándar europeo: rara vez antes de las 21:00 y a menudo a las 22:00. Los restaurantes no empiezan a llenarse hasta las 21:30.`,
    period: 'noche',
    emoji: '🍳🥗',
  },
  {
    id: 'ocio-nocturno',
    startHour: 23,
    endHour: 24,
    label: 'Ocio nocturno',
    activity: 'Copas, discoteca, o televisión',
    food: 'Copa de vino, cubata',
    place: 'Bares de copas, discotecas, casa',
    culturalNote: `La marcha española empieza tarde. El previo desde las 23h, los bares a medianoche, las discotecas a partir de las 02:00. «Salir de noche» es una institución cultural de pleno derecho.`,
    period: 'noche',
    emoji: '🎶🌃',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function getSlotForHour(hour: number): RoutineSlot {
  return (
    ROUTINE_SLOTS.find(slot => hour >= slot.startHour && hour < slot.endHour) ??
    ROUTINE_SLOTS[ROUTINE_SLOTS.length - 1]
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RoutineTimeSlider() {
  const [sliderValue, setSliderValue] = useState<number>(840) // 14:00
  const [isDragging, setIsDragging] = useState(false)

  const currentHour = Math.floor(sliderValue / 60)
  const timeString  = minutesToTimeString(sliderValue)
  const currentSlot = useMemo(() => getSlotForHour(currentHour), [currentHour])
  const sunProgress = (sliderValue / 1439) * 100
  const sky = PERIOD_SKY[currentSlot.period]
  const isNight = currentSlot.period === 'madrugada' || currentSlot.period === 'noche'

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderValue(Number(e.target.value))
  }, [])
  const handleSliderMouseDown  = useCallback(() => setIsDragging(true), [])
  const handleSliderMouseUp    = useCallback(() => setIsDragging(false), [])
  const handleSliderTouchStart = useCallback(() => setIsDragging(true), [])
  const handleSliderTouchEnd   = useCallback(() => setIsDragging(false), [])

  const handleSlotChipClick = useCallback((slot: RoutineSlot) => {
    const midHour = Math.floor((slot.startHour + slot.endHour) / 2)
    setSliderValue(midHour * 60)
  }, [])

  return (
    <section
      className="relative overflow-hidden rounded-3xl"
      data-period={currentSlot.period}
      data-sun-progress={sunProgress.toFixed(2)}
      data-is-dragging={String(isDragging)}
      aria-label="Rutinas diarias en España"
      style={{ background: sky.gradient, transition: 'background 1s ease', boxShadow: `0 8px 40px ${sky.accent}40` }}
    >
      {/* ── Section header ── */}
      <div className="px-6 pt-6 pb-2">
        <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: sky.accent, opacity: 0.8 }}>
          Vida cotidiana
        </p>
        <h2 className="font-black text-2xl" style={{ fontFamily: "'Fredoka One', cursive", color: sky.text }}>
          El Horario Español 🇪🇸
        </h2>
      </div>

      {/* ── Sky scene — time display + sun/moon ── */}
      <div className="relative h-24 mx-6 mt-2 rounded-2xl overflow-hidden border border-white/10" style={{ background: 'rgba(0,0,0,0.15)' }}>
        {/* Stars for night */}
        {isNight && (
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-0.5 rounded-full bg-white animate-pulse"
                style={{ left: `${(i * 79 + 11) % 95}%`, top: `${(i * 53 + 17) % 80}%`, animationDelay: `${i * 0.3}s` }}
              />
            ))}
          </div>
        )}

        {/* Sun / Moon */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 text-3xl pointer-events-none select-none"
          style={{ left: `${Math.max(5, Math.min(90, sunProgress))}%` }}
          animate={{ left: `${Math.max(5, Math.min(90, sunProgress))}%`, scale: isDragging ? 1.2 : 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          aria-hidden="true"
          data-is-night={String(isNight)}
          data-sun-progress={sunProgress.toFixed(2)}
        >
          <span className={isNight ? 'drop-shadow-[0_0_12px_#7C3AED]' : 'drop-shadow-[0_0_12px_#FFB347]'}>
            {isNight ? '🌙' : '☀️'}
          </span>
        </motion.div>

        {/* Clock overlay */}
        <div className="absolute bottom-2 right-3 font-black tabular-nums" style={{ color: sky.text, fontSize: '1.1rem', fontFamily: 'monospace', opacity: 0.85 }}>
          {timeString}
        </div>

        {/* Period label */}
        <div className="absolute bottom-2 left-3 text-xs font-bold uppercase tracking-wider" style={{ color: sky.text, opacity: 0.6 }}>
          {currentSlot.label}
        </div>
      </div>

      {/* ── Slider ── */}
      <div className="px-6 pt-4 pb-2">
        <div className="relative">
          {/* Track bar */}
          <div
            className="absolute inset-x-0 h-2 rounded-full top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.15)' }}
            aria-hidden="true"
          />
          {/* Progress fill */}
          <div
            className="absolute left-0 h-2 rounded-full top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ width: `${sunProgress}%`, background: sky.accent, boxShadow: `0 0 8px ${sky.accent}` }}
            aria-hidden="true"
          />
          <input
            type="range"
            min={0}
            max={1439}
            step={1}
            value={sliderValue}
            aria-label="Hora del día"
            aria-valuetext={`${timeString} — ${currentSlot.activity}`}
            onChange={handleSliderChange}
            onMouseDown={handleSliderMouseDown}
            onMouseUp={handleSliderMouseUp}
            onTouchStart={handleSliderTouchStart}
            onTouchEnd={handleSliderTouchEnd}
            data-slider-value={sliderValue}
            className="relative w-full h-4 bg-transparent appearance-none cursor-pointer"
            style={{
              // Cross-browser thumb styling via inline styles as fallback
              // Actual thumb is hidden — the sun/moon emoji above acts as visual thumb
            }}
          />
        </div>

        {/* Hour ticks */}
        <div className="relative flex justify-between mt-1 px-0.5" aria-hidden="true">
          {[0, 6, 12, 18, 23].map(h => (
            <span key={h} className="text-[9px] font-bold" style={{ color: sky.text, opacity: 0.4 }}>
              {String(h).padStart(2, '0')}h
            </span>
          ))}
        </div>
      </div>

      {/* ── Active slot card (animated on change) ── */}
      <div className="px-6 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlot.id}
            className="rounded-2xl p-4 border border-white/20"
            style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            data-slot-id={currentSlot.id}
            data-period={currentSlot.period}
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl flex-shrink-0 mt-0.5" aria-hidden="true">{currentSlot.emoji}</div>
              <div className="min-w-0 flex-1">
                <h3 className="font-black text-lg leading-tight mb-1" style={{ color: sky.text, fontFamily: "'Fredoka One', cursive" }}>
                  {currentSlot.activity}
                </h3>
                {currentSlot.food !== '—' && (
                  <p className="text-xs mb-1" style={{ color: sky.text, opacity: 0.75 }}>
                    <span className="font-black uppercase tracking-wider opacity-50 mr-1">¿Qué se come?</span>
                    {currentSlot.food}
                  </p>
                )}
                <p className="text-xs mb-2" style={{ color: sky.text, opacity: 0.7 }}>
                  <span className="font-black uppercase tracking-wider opacity-50 mr-1">¿Dónde?</span>
                  {currentSlot.place}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: sky.text, opacity: 0.6, borderLeft: `2px solid ${sky.accent}`, paddingLeft: '0.5rem' }}>
                  {currentSlot.culturalNote}
                </p>
              </div>
              {/* Time range badge */}
              <div
                className="flex-shrink-0 rounded-xl px-2 py-1 text-[10px] font-black text-center"
                style={{ background: sky.accent, color: '#fff', minWidth: '3rem' }}
                aria-hidden="true"
              >
                {String(currentSlot.startHour).padStart(2, '0')}:00
                <br />
                {String(currentSlot.endHour === 24 ? 0 : currentSlot.endHour).padStart(2, '0')}:00
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Slot chip nav ── */}
      <nav
        className="px-6 pb-6 flex flex-wrap gap-2"
        aria-label="Momentos del día"
      >
        {ROUTINE_SLOTS.map(slot => {
          const isActive = slot.id === currentSlot.id
          return (
            <motion.button
              key={slot.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border cursor-pointer"
              style={{
                background: isActive ? sky.accent : 'rgba(255,255,255,0.1)',
                color: isActive ? '#fff' : sky.text,
                borderColor: isActive ? sky.accent : 'rgba(255,255,255,0.15)',
                opacity: isActive ? 1 : 0.65,
              }}
              data-slot-id={slot.id}
              data-period={slot.period}
              data-current={String(isActive)}
              onClick={() => handleSlotChipClick(slot)}
              aria-pressed={isActive}
              aria-label={`Saltar a ${slot.label} (${slot.startHour}:00)`}
              whileHover={{ scale: 1.06, opacity: 1 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <span aria-hidden="true">{slot.emoji.slice(0, 2)}</span>
              <span className="hidden sm:inline">{slot.label}</span>
            </motion.button>
          )
        })}
      </nav>

      {/* Global range input thumb styling */}
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(255,255,255,0.9);
          box-shadow: 0 0 0 3px rgba(255,255,255,0.3), 0 2px 8px rgba(0,0,0,0.3);
          cursor: grab;
        }
        input[type=range]:active::-webkit-slider-thumb { cursor: grabbing; }
        input[type=range]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(255,255,255,0.9);
          border: none;
          box-shadow: 0 0 0 3px rgba(255,255,255,0.3), 0 2px 8px rgba(0,0,0,0.3);
          cursor: grab;
        }
        input[type=range]::-webkit-slider-runnable-track { background: transparent; height: 4px; }
        input[type=range]::-moz-range-track { background: transparent; height: 4px; }
      `}</style>
    </section>
  )
}
