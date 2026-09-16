import { motion, AnimatePresence } from 'framer-motion'
import { MODULES } from '../../data/modules'
import { BADGES } from '../../data/badges'
import type { ActiveView } from '../../types'

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  modId: number
  activeView: ActiveView
  completed: Set<number>
  progress: number
  xp: number
  streak: number
  hearts: number
  xpAnim: boolean
  unlockedBadges: Set<string>
  navigate: (id: number) => void
  setActiveView: (view: ActiveView) => void
  setAboutOpen: (open: boolean) => void
}

export function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  modId,
  activeView,
  completed,
  progress,
  xp,
  streak,
  hearts,
  xpAnim,
  unlockedBadges,
  navigate,
  setActiveView,
  setAboutOpen,
}: SidebarProps) {
  return (
    <>
      {/* Off-canvas backdrop — fades in/out with the drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="sidebar-backdrop"
            className="fixed inset-0 z-30"
            style={{ background: 'rgba(26,26,46,0.55)', backdropFilter: 'blur(3px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-72 h-dvh flex flex-col
          border-r-4 border-[#1A1A2E]
          transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
          will-change-transform
          ${sidebarOpen
            ? 'translate-x-0 shadow-[6px_0_24px_rgba(26,26,46,0.18)]'
            : '-translate-x-full'}
        `}
        style={{ background: '#FFFBF0' }}
      >
        {/* Logo — click to open About modal */}
        <button
          onClick={() => setAboutOpen(true)}
          className="p-5 border-b-4 border-[#1A1A2E] flex items-center gap-3 w-full text-left hover:bg-[#1A1A2E]/5 transition-colors"
          title="Sobre el proyecto"
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-3 border-[#1A1A2E] font-black flex-shrink-0 transition-transform hover:scale-110"
            style={{ background: '#FF4B4B', boxShadow: '3px 3px 0 #1A1A2E', borderWidth: 3 }}
          >
            🇪🇸
          </div>
          <div>
            <div className="font-black text-[#1A1A2E] text-lg leading-tight" style={{ fontFamily: "'Fredoka One', cursive" }}>
              Prueba CCSE
            </div>
            <div className="text-xs font-bold text-[#1A1A2E]/50 uppercase tracking-wider">Toca para saber más ✨</div>
          </div>
        </button>

        {/* Progress */}
        <div className="px-5 py-4 border-b-2 border-[#1A1A2E]/20">
          <div className="flex justify-between text-xs font-black text-[#1A1A2E]/60 uppercase tracking-wider mb-2">
            <span>Progreso</span>
            <span>{progress}%</span>
          </div>
          <div className="h-3 w-full bg-[#1A1A2E]/10 rounded-full overflow-hidden border border-[#1A1A2E]/20">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: '#58CC02' }}
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-2">
          {MODULES.map(m => {
            const isActive = activeView === 'module' && m.id === modId
            const isDone = completed.has(m.id)
            return (
              <button
                key={m.id}
                onClick={() => navigate(m.id)}
                className="w-full text-left px-4 py-3 rounded-xl border-2 flex items-center gap-3 transition-all font-bold"
                style={{
                  borderColor: isActive ? m.color : 'transparent',
                  background: isActive ? m.color + '20' : 'transparent',
                  boxShadow: isActive ? `3px 3px 0 ${m.color}` : 'none',
                  color: '#1A1A2E',
                }}
              >
                <span className="text-xl">{m.emoji}</span>
                <span className="flex-1 text-sm leading-snug">{m.title}</span>
                {isDone && <span className="text-[#58CC02] text-base">✓</span>}
              </button>
            )
          })}
          <button
            onClick={() => { setActiveView('timeline'); setSidebarOpen(false) }}
            className="w-full text-left px-4 py-3 rounded-xl border-2 flex items-center gap-3 transition-all font-bold"
            style={{
              borderColor: activeView === 'timeline' ? '#FF6B35' : 'transparent',
              background: activeView === 'timeline' ? '#FF6B3520' : 'transparent',
              boxShadow: activeView === 'timeline' ? '3px 3px 0 #FF6B35' : 'none',
              color: '#1A1A2E',
            }}
          >
            <span className="text-xl">🗺️</span>
            <span className="flex-1 text-sm leading-snug">Historia de España</span>
          </button>
          <button
            onClick={() => { setActiveView('sociedad'); setSidebarOpen(false) }}
            className="w-full text-left px-4 py-3 rounded-xl border-2 flex items-center gap-3 transition-all font-bold"
            style={{
              borderColor: activeView === 'sociedad' ? '#1CB0F6' : 'transparent',
              background: activeView === 'sociedad' ? '#1CB0F620' : 'transparent',
              boxShadow: activeView === 'sociedad' ? '3px 3px 0 #1CB0F6' : 'none',
              color: '#1A1A2E',
            }}
          >
            <span className="text-xl">🏙️</span>
            <span className="flex-1 text-sm leading-snug">Sociedad y trámites</span>
          </button>
          {/* Mi Progresión — last in nav */}
          <button
            onClick={() => { setActiveView('progress'); setSidebarOpen(false) }}
            className="w-full text-left px-4 py-3 rounded-xl border-2 flex items-center gap-3 transition-all font-bold"
            style={{
              borderColor: activeView === 'progress' ? '#CE82FF' : 'transparent',
              background: activeView === 'progress' ? '#CE82FF20' : 'transparent',
              boxShadow: activeView === 'progress' ? '3px 3px 0 #CE82FF' : 'none',
              color: '#1A1A2E',
            }}
          >
            <span className="text-xl">🏅</span>
            <span className="flex-1 text-sm leading-snug">Mi Progresión</span>
            <span className="text-xs font-black text-[#CE82FF]">{unlockedBadges.size}/{BADGES.length}</span>
          </button>
        </nav>

        {/* XP display */}
        <div className="p-4 border-t-4 border-[#1A1A2E]">
          <div
            className={`rounded-xl border-2 border-[#1A1A2E] p-3 flex items-center justify-between transition-all duration-300 ${xpAnim ? 'scale-105' : ''}`}
            style={{ background: xpAnim ? '#FFC800' : '#FFC80030', boxShadow: xpAnim ? '4px 4px 0 #1A1A2E' : 'none' }}
          >
            <div className="flex items-center gap-2">
              <span className={`text-xl transition-transform ${xpAnim ? 'animate-pop' : ''}`}>⭐</span>
              <span className={`font-black text-[#1A1A2E] text-lg transition-all ${xpAnim ? 'animate-pop' : ''}`}>
                {xp} XP
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm font-black">
              <span>🔥 {streak}</span>
              <span>❤️ {hearts}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
