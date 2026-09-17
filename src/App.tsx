import { useState, useRef, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'

// Data
import { MODULES } from './data/modules'
import { BADGES } from './data/badges'

// Types
import type { Badge, ActiveView } from './types'

// Layout
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'

// Module view components
import { AccordionItem } from './components/module/AccordionItem'
import { MediaCard } from './components/module/MediaCard'
import { FloatingXP } from './components/module/FloatingXP'
import { MapGame } from './components/module/MapGame'
import { Exercises } from './components/module/Exercises'

// Overlays & views
import { OnboardingCarousel } from './components/onboarding/OnboardingCarousel'
import { AboutModal } from './components/about/AboutModal'
import { ProgressionMap } from './components/progress/ProgressionMap'

// Feature views
import { TimelineMindMap } from './components/timeline/TimelineMindMap'
import { DocumentWallet } from './components/sociedad/DocumentWallet'
import { RoutineTimeSlider } from './components/sociedad/RoutineTimeSlider'
import { EmergencyPhone } from './components/sociedad/EmergencyPhone'
import { FestiveCalendar } from './components/cultura/FestiveCalendar'

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [modId, setModId] = useState(1)
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const [xp, setXp] = useState(0)
  const [streak] = useState(3)
  const [hearts, setHearts] = useState(5)
  const [xpAnim, setXpAnim] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [floatingXPs, setFloatingXPs] = useState<{ id: number; amount: number }[]>([])
  const [activeView, setActiveView] = useState<ActiveView>('module')
  const [unlockedBadges, setUnlockedBadges] = useState<Set<string>>(new Set(['b0']))
  const [newBadgeAlert, setNewBadgeAlert] = useState<Badge | null>(null)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [onboardingDone, setOnboardingDone] = useState<boolean>(() => {
    try { return !!localStorage.getItem('ccse_onboarded') } catch { return false }
  })
  const xpIdRef = useRef(0)
  const mainRef = useRef<HTMLDivElement>(null)
  const unlockedBadgeIdsRef = useRef<Set<string>>(new Set(['b0']))

  const mod = MODULES.find(m => m.id === modId)!
  const progress = Math.round((completed.size / MODULES.length) * 100)

  // Prevent page scroll while the off-canvas drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  function gainXP(n: number) {
    setXp(x => {
      const next = x + n
      const newlyUnlocked = BADGES.filter(b => b.xpRequired > x && b.xpRequired <= next && !unlockedBadgeIdsRef.current.has(b.id))
      if (newlyUnlocked.length > 0) {
        const badge = newlyUnlocked[newlyUnlocked.length - 1]
        unlockedBadgeIdsRef.current = new Set([...unlockedBadgeIdsRef.current, ...newlyUnlocked.map(b => b.id)])
        setUnlockedBadges(prev => new Set([...prev, ...newlyUnlocked.map(b => b.id)]))
        setNewBadgeAlert(badge)
        setTimeout(() => setNewBadgeAlert(null), 4500)
      }
      return next
    })
    setXpAnim(true)
    setTimeout(() => setXpAnim(false), 700)
    const id = ++xpIdRef.current
    setFloatingXPs(prev => [...prev, { id, amount: n }])
  }

  function removeFloatingXP(id: number) {
    setFloatingXPs(prev => prev.filter(f => f.id !== id))
  }

  function navigate(id: number) {
    setModId(id)
    setActiveView('module')
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#FFFBF0', fontFamily: "'Nunito', sans-serif" }}>

      {/* Onboarding carousel — shows only on first visit */}
      <AnimatePresence>
        {!onboardingDone && (
          <OnboardingCarousel onDone={() => {
            try { localStorage.setItem('ccse_onboarded', '1') } catch {}
            setOnboardingDone(true)
          }} />
        )}
      </AnimatePresence>

      {/* About / Sobre el proyecto modal */}
      <AnimatePresence>
        {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
      </AnimatePresence>

      {/* Floating XP notifications */}
      {floatingXPs.map(f => (
        <FloatingXP key={f.id} id={f.id} amount={f.amount} onDone={removeFloatingXP} />
      ))}

      {/* Badge unlock toast */}
      {newBadgeAlert && (
        <div
          className="fixed top-4 right-4 z-50 animate-bounce-in"
          style={{ maxWidth: '280px' }}
        >
          <div
            className="rounded-2xl p-4 flex items-start gap-3"
            style={{ background: '#1A1A2E', border: '3px solid #FFC800', boxShadow: '4px 4px 0 #FFC800' }}
          >
            <span className="text-3xl flex-shrink-0">{newBadgeAlert.emoji}</span>
            <div>
              <p className="text-[#FFC800] text-xs font-black uppercase tracking-widest mb-0.5">¡Insignia desbloqueada!</p>
              <p className="text-white font-black text-sm leading-tight">{newBadgeAlert.name}</p>
              <p className="text-white/60 text-xs mt-1 leading-snug">{newBadgeAlert.trivia}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar + backdrop */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        modId={modId}
        activeView={activeView}
        completed={completed}
        progress={progress}
        xp={xp}
        streak={streak}
        hearts={hearts}
        xpAnim={xpAnim}
        unlockedBadges={unlockedBadges}
        navigate={navigate}
        setActiveView={setActiveView}
        setAboutOpen={setAboutOpen}
      />

      {/* ── Main ── */}
      <div ref={mainRef} className="flex-1 relative min-w-0">

        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          modId={modId}
          completed={completed}
          xp={xp}
          streak={streak}
          hearts={hearts}
          xpAnim={xpAnim}
          navigate={navigate}
          setActiveView={setActiveView}
        />

        {/* Content */}
        {activeView === 'progress' ? (
          <ProgressionMap xp={xp} unlockedBadges={unlockedBadges} />
        ) : activeView === 'timeline' ? (
          <TimelineMindMap />
        ) : activeView === 'sociedad' ? (
          <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 space-y-16">
            <DocumentWallet />
            <RoutineTimeSlider />
            <EmergencyPhone />
          </div>
        ) : null}
        <div className={`max-w-3xl mx-auto px-4 md:px-8 py-8 pb-24 space-y-10 ${activeView !== 'module' ? 'hidden' : ''}`}>

          {/* ── Hero ── */}
          <div
            className="rounded-3xl overflow-hidden border-4 border-[#1A1A2E] relative"
            style={{ boxShadow: `6px 6px 0 #1A1A2E` }}
          >
            <div className="relative h-52 md:h-64">
              <img
                src={mod.heroImage}
                alt={mod.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 60%)' }} />
              <div className="absolute bottom-4 left-5 right-5">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-2 border-2 border-white/50"
                  style={{ background: mod.color }}
                >
                  <span>{mod.emoji}</span>
                  <span className="text-white">Módulo {mod.id}</span>
                </div>
                <h1
                  className="text-white text-2xl md:text-3xl leading-tight font-black"
                  style={{ fontFamily: "'Fredoka One', cursive", textShadow: '2px 2px 0 rgba(0,0,0,0.5)' }}
                >
                  {mod.title}
                </h1>
              </div>
            </div>
          </div>

          {/* ── Theory ── */}
          <div
            className="rounded-2xl border-3 border-[#1A1A2E] p-6"
            style={{ borderWidth: 3, background: mod.color + '12', boxShadow: `4px 4px 0 ${mod.color}` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">📖</span>
              <h2 className="font-black text-[#1A1A2E] uppercase text-xs tracking-widest">Teoría Principal</h2>
            </div>
            <div dangerouslySetInnerHTML={{ __html: mod.theory }} />
          </div>

          {/* ── Key Points Accordion ── */}
          {mod.steps.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">📌</span>
                <h2 className="font-black text-[#1A1A2E] uppercase text-xs tracking-widest">Datos Clave</h2>
              </div>
              <div className="flex flex-col gap-3">
                {mod.steps.map((step, i) => (
                  <AccordionItem key={i} step={step} index={i} color={mod.color} />
                ))}
              </div>
            </div>
          )}

          {/* ── GIF Gallery ── */}
          {mod.gifs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🎬</span>
                <h2 className="font-black text-[#1A1A2E] uppercase text-xs tracking-widest">Ejemplos Culturales</h2>
              </div>
              <div className={`grid gap-4 ${mod.gifs.length >= 3 ? 'grid-cols-3' : mod.gifs.length === 2 ? 'grid-cols-2' : 'grid-cols-1 max-w-lg mx-auto w-full'}`}>
                {mod.gifs.map((gif, i) => (
                  <MediaCard key={i} gif={gif} color={mod.color} />
                ))}
              </div>
            </div>
          )}

          {/* ── Festive Calendar (Module 4 only) ── */}
          {mod.id === 4 && (
            <div>
              <FestiveCalendar />
            </div>
          )}

          {/* ── Pro Tip / Warning ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mod.proTip && (
              <div
                className="rounded-2xl border-3 border-[#1A1A2E] p-5"
                style={{ borderWidth: 3, background: '#FFC800' + '20', boxShadow: '3px 3px 0 #FFC800' }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <h3 className="font-black text-[#1A1A2E] mb-1">¿Sabías que...?</h3>
                    <p className="text-sm text-[#1A1A2E]/80 font-semibold leading-relaxed">{mod.proTip}</p>
                  </div>
                </div>
              </div>
            )}
            {mod.mistakes && (
              <div
                className="rounded-2xl border-3 border-[#1A1A2E] p-5"
                style={{ borderWidth: 3, background: '#FF4B4B' + '15', boxShadow: '3px 3px 0 #FF4B4B' }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h3 className="font-black text-[#1A1A2E] mb-1">¡Atención!</h3>
                    <p className="text-sm text-[#1A1A2E]/80 font-semibold leading-relaxed">{mod.mistakes}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Interactive Map ── */}
          {mod.showMap && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">📍</span>
                <h2 className="font-black text-[#1A1A2E] uppercase text-xs tracking-widest">Mapa Interactivo: Comunidades Autónomas</h2>
              </div>
              <MapGame color={mod.color} />
            </div>
          )}

          {/* ── Exercises ── */}
          <div
            className="rounded-2xl border-3 border-[#1A1A2E] p-6"
            style={{ borderWidth: 3, background: '#fff', boxShadow: `5px 5px 0 #1A1A2E` }}
          >
            <Exercises mod={mod} onXP={gainXP} onHeartLost={() => setHearts(h => Math.max(0, h - 1))} />
          </div>

          {/* ── Complete ── */}
          <div className="pt-4 border-t-4 border-dashed border-[#1A1A2E]/20">
            <button
              onClick={() => {
                setCompleted(prev => {
                  const next = new Set(prev)
                  if (next.has(mod.id)) next.delete(mod.id)
                  else { next.add(mod.id); gainXP(50) }
                  return next
                })
              }}
              className="px-6 py-3 rounded-2xl border-3 border-[#1A1A2E] font-black text-sm flex items-center gap-2 transition-all"
              style={{
                borderWidth: 3,
                background: completed.has(mod.id) ? '#58CC02' : mod.color,
                color: '#fff',
                boxShadow: completed.has(mod.id) ? '4px 4px 0 #1A1A2E' : `4px 4px 0 #1A1A2E`,
              }}
            >
              {completed.has(mod.id) ? '✅ Módulo Completado — +50 XP!' : '⬜ Marcar como Completado (+50 XP)'}
            </button>
          </div>

          {/* ── Navigation ── */}
          <div className="flex justify-between items-center pt-2">
            <button
              disabled={mod.id === 1}
              onClick={() => navigate(mod.id - 1)}
              className="px-5 py-2.5 rounded-xl border-2 border-[#1A1A2E] font-black text-sm disabled:opacity-30 flex items-center gap-2 transition-all hover:bg-[#1A1A2E]/5"
              style={{ boxShadow: mod.id === 1 ? 'none' : '3px 3px 0 #1A1A2E' }}
            >
              ← Anterior
            </button>
            <span className="text-sm font-black text-[#1A1A2E]/40">
              {mod.id} / {MODULES.length}
            </span>
            <button
              disabled={mod.id === MODULES.length}
              onClick={() => navigate(mod.id + 1)}
              className="px-5 py-2.5 rounded-xl border-2 border-[#1A1A2E] font-black text-sm disabled:opacity-30 flex items-center gap-2 transition-all"
              style={{
                background: mod.color,
                color: '#fff',
                boxShadow: mod.id === MODULES.length ? 'none' : `3px 3px 0 #1A1A2E`,
              }}
            >
              Siguiente →
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
