import { motion, AnimatePresence } from 'framer-motion'
import { MODULES } from '../../data/modules'
import type { ActiveView } from '../../types'

interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  modId: number
  completed: Set<number>
  xp: number
  streak: number
  hearts: number
  xpAnim: boolean
  navigate: (id: number) => void
  setActiveView: (view: ActiveView) => void
}

export function Header({
  sidebarOpen,
  setSidebarOpen,
  modId,
  completed,
  xp,
  streak,
  hearts,
  xpAnim,
  navigate,
  setActiveView,
}: HeaderProps) {
  return (
    <div
      className="sticky top-0 z-20 px-4 md:px-8 h-16 flex items-center justify-between border-b-4 border-[#1A1A2E]"
      style={{ background: '#FFFBF0' }}
    >
      {/* Hamburger / close toggle — visible on all screen sizes */}
      <button
        className="w-10 h-10 rounded-xl border-2 border-[#1A1A2E] flex items-center justify-center font-black transition-colors hover:bg-[#1A1A2E]/5"
        style={{ boxShadow: '2px 2px 0 #1A1A2E' }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={sidebarOpen}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={sidebarOpen ? 'close' : 'open'}
            initial={{ scale: 0.4, opacity: 0, rotate: sidebarOpen ? -45 : 45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ display: 'block', lineHeight: 1 }}
          >
            {sidebarOpen ? '✕' : '☰'}
          </motion.span>
        </AnimatePresence>
      </button>

      <div className="flex items-center gap-2 md:gap-4">
        {MODULES.map(m => (
          <button
            key={m.id}
            onClick={() => navigate(m.id)}
            className="hidden w-9 h-9 rounded-full border-2 border-[#1A1A2E] items-center justify-center text-base transition-transform hover:scale-110"
            style={{
              background: m.id === modId ? m.color : completed.has(m.id) ? '#58CC02' : '#e5e0d4',
              boxShadow: m.id === modId ? `3px 3px 0 #1A1A2E` : 'none',
            }}
            title={m.title}
          >
            {completed.has(m.id) ? '✓' : m.emoji}
          </button>
        ))}
      </div>

      {/* Stat pills — each navigates to Mi Progresión */}
      <div className="flex items-center gap-3 text-sm font-black text-[#1A1A2E]">
        <button
          onClick={() => setActiveView('progress')}
          title="Ver Mi Progresión"
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full border-2 border-[#1A1A2E] transition-all duration-300 hover:scale-110 cursor-pointer ${xpAnim ? 'scale-125 shadow-brutal-sun' : ''}`}
          style={{ background: '#FFC800', boxShadow: xpAnim ? '4px 4px 0 #1A1A2E' : '2px 2px 0 #1A1A2E' }}
        >
          ⭐ <span className={xpAnim ? 'animate-pop' : ''}>{xp}</span>
        </button>
        <button
          onClick={() => setActiveView('progress')}
          title="Ver Mi Progresión"
          className="flex items-center gap-1 px-3 py-1 rounded-full border-2 border-[#1A1A2E] hover:scale-110 transition-transform cursor-pointer"
          style={{ background: '#FF4B4B22' }}
        >
          🔥 {streak}
        </button>
        <button
          onClick={() => setActiveView('progress')}
          title="Ver Mi Progresión"
          className="flex items-center gap-1 px-3 py-1 rounded-full border-2 border-[#1A1A2E] hover:scale-110 transition-transform cursor-pointer"
          style={{ background: '#FF4B4B22' }}
        >
          ❤️ {hearts}
        </button>
      </div>
    </div>
  )
}
