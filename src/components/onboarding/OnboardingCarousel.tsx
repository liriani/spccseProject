import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Onboarding Carousel (3 steps, shown on first visit) ─────────────────────

const ONBOARDING_STEPS = [
  {
    emoji: '🇪🇸',
    title: '¡Bienvenido/a!',
    subtitle: 'Tu guía para el examen CCSE',
    body: 'Esta app te prepara para el examen de Conocimientos Constitucionales y Socioculturales de España. ¡Todo lo que necesitas, en un solo lugar!',
    color: '#FF4B4B',
    decorations: ['📜', '⚖️', '🏛️'],
  },
  {
    emoji: '🎮',
    title: 'Aprende jugando',
    subtitle: 'Gamificación educativa',
    body: 'Gana ⭐ XP en cada ejercicio, mantén tu racha 🔥 diaria, desbloquea insignias 🏅 y explora mapas interactivos de España.',
    color: '#58CC02',
    decorations: ['⭐', '🔥', '🏅'],
  },
  {
    emoji: '🚀',
    title: '¡Todo tuyo!',
    subtitle: 'Empieza tu aventura',
    body: '4 módulos completos con teoría, ejercicios reales, mapas y cultura. Estudia a tu ritmo y ¡consigue tu ciudadanía española! ❤️',
    color: '#CE82FF',
    decorations: ['🗺️', '🎨', '🏆'],
  },
]

export function OnboardingCarousel({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = back
  const current = ONBOARDING_STEPS[step]

  function goNext() {
    if (step < ONBOARDING_STEPS.length - 1) {
      setDirection(1)
      setStep(s => s + 1)
    } else {
      onDone()
    }
  }

  function goBack() {
    if (step > 0) {
      setDirection(-1)
      setStep(s => s - 1)
    }
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0, scale: 0.95 }),
  }

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(26,26,46,0.75)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-sm"
        initial={{ scale: 0.85, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 24 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      >
        {/* Card */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{ border: '4px solid #1A1A2E', background: '#FFFBF0', boxShadow: '8px 8px 0 #1A1A2E' }}
        >
          {/* Colorful top strip */}
          <div
            className="h-2"
            style={{ background: `linear-gradient(to right, ${current.color}, ${current.color}99)` }}
          />

          {/* Floating decorations */}
          <div className="relative px-8 pt-8 pb-4 overflow-hidden">
            {current.decorations.map((deco, i) => (
              <span
                key={i}
                className="absolute text-3xl opacity-10 select-none pointer-events-none"
                style={{
                  top: `${[10, 20, 5][i]}%`,
                  right: `${[8, 25, 45][i]}%`,
                  transform: `rotate(${[-15, 12, -8][i]}deg)`,
                }}
              >
                {deco}
              </span>
            ))}

            {/* Step content — animated slide */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              >
                {/* Big emoji */}
                <motion.div
                  className="text-7xl text-center mb-4 leading-none"
                  initial={{ scale: 0.4, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.08 }}
                >
                  {current.emoji}
                </motion.div>

                <h2
                  className="text-2xl font-black text-center text-[#1A1A2E] mb-1"
                  style={{ fontFamily: "'Fredoka One', cursive" }}
                >
                  {current.title}
                </h2>
                <p className="text-xs font-black text-center uppercase tracking-widest mb-4" style={{ color: current.color }}>
                  {current.subtitle}
                </p>
                <p className="text-sm text-[#4B4B6B] font-semibold text-center leading-relaxed">
                  {current.body}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 pb-5">
            {ONBOARDING_STEPS.map((s, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > step ? 1 : -1); setStep(i) }}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === step ? '1.5rem' : '0.5rem',
                  height: '0.5rem',
                  background: i === step ? current.color : '#1A1A2E30',
                  border: `2px solid ${i === step ? current.color : 'transparent'}`,
                }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="px-6 pb-6 flex gap-3">
            {step > 0 ? (
              <button
                onClick={goBack}
                className="flex-1 py-3 rounded-2xl font-black text-sm border-2 border-[#1A1A2E] transition-all hover:bg-[#1A1A2E]/5"
                style={{ boxShadow: '3px 3px 0 #1A1A2E' }}
              >
                ← Atrás
              </button>
            ) : (
              <button
                onClick={onDone}
                className="flex-1 py-3 rounded-2xl font-black text-sm border-2 border-[#1A1A2E]/30 text-[#1A1A2E]/40 transition-all hover:border-[#1A1A2E]/60"
              >
                Omitir
              </button>
            )}
            <motion.button
              onClick={goNext}
              className="flex-[2] py-3 rounded-2xl font-black text-sm text-white border-2 border-[#1A1A2E] transition-all"
              style={{ background: current.color, boxShadow: '4px 4px 0 #1A1A2E' }}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97, y: 2, boxShadow: '2px 2px 0 #1A1A2E' }}
            >
              {step < ONBOARDING_STEPS.length - 1 ? 'Siguiente →' : '¡Empezar! 🚀'}
            </motion.button>
          </div>
        </div>

        {/* Step counter badge */}
        <div
          className="absolute -top-3 -right-3 w-10 h-10 rounded-full border-3 border-[#1A1A2E] flex items-center justify-center font-black text-sm text-white"
          style={{ background: current.color, borderWidth: 3, boxShadow: '3px 3px 0 #1A1A2E' }}
        >
          {step + 1}/{ONBOARDING_STEPS.length}
        </div>
      </motion.div>
    </motion.div>
  )
}
