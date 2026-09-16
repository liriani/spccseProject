import { useState } from 'react'
import { SpainMapSVG } from './SpainMapSVG'
import { SPAIN_REGIONS } from '../../data/regions'
import { shuffle } from '../../utils/helpers'

export function MapGame({ color }: { color: string }) {
  const [queue] = useState(() => shuffle(SPAIN_REGIONS))
  const [idx, setIdx] = useState(0)
  const [found, setFound] = useState<Set<string>>(new Set())
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null)
  const [shake, setShake] = useState<string | null>(null)

  const target = queue[idx]
  const done = idx >= queue.length

  function click(id: string) {
    if (done || found.has(id)) return
    if (id === target.id) {
      const next = new Set(found)
      next.add(id)
      setFound(next)
      setIdx(i => i + 1)
      setFeedback({ text: `✅ ¡Correcto! ${target.name}`, ok: true })
    } else {
      setShake(id)
      setFeedback({ text: '❌ Esa no es. ¡Inténtalo de nuevo!', ok: false })
      setTimeout(() => setShake(null), 400)
    }
  }

  function reset() {
    setIdx(0)
    setFound(new Set())
    setFeedback(null)
  }

  return (
    <div className="rounded-2xl border-3 border-[#1A1A2E] overflow-hidden" style={{ borderWidth: 3, boxShadow: '4px 4px 0 #1A1A2E' }}>
      <div className="p-4 flex items-center justify-between" style={{ background: color + '33' }}>
        <div className="font-bold text-[#1A1A2E]">
          {done ? '🎉 ¡Completado!' : (
            <span>Encuentra: <span className="text-lg" style={{ color }}>{target.name}</span></span>
          )}
        </div>
        <div className="text-sm font-bold text-[#1A1A2E]">{found.size} / {SPAIN_REGIONS.length}</div>
      </div>

      {/* aspect-ratio: ~1.5:1 matches Spain's geographic proportions; preserveAspectRatio="none" on SVG fills this area */}
      <div className="relative w-full" style={{ paddingBottom: '78%' }}>
        <SpainMapSVG />
        {SPAIN_REGIONS.map(r => {
          const isFound = found.has(r.id)
          const isShaking = shake === r.id
          return (
            <button
              key={r.id}
              onClick={() => click(r.id)}
              className={`absolute rounded-full border-2 border-white cursor-pointer transition-all duration-200 hover:scale-125 ${isShaking ? 'animate-shake' : ''}`}
              style={{
                left: `${r.x}%`,
                top: `${r.y}%`,
                transform: 'translate(-50%, -50%)',
                background: isFound ? '#58CC02' : (done ? '#1CB0F6' : color),
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                zIndex: isFound ? 5 : 2,
                width: '2rem',
                height: '2rem',
                minWidth: '2rem',
                minHeight: '2rem',
              }}
              title={isFound ? r.name : '?'}
            />
          )
        })}
      </div>

      <div className="px-4 py-3 border-t-2 border-[#1A1A2E] flex items-center justify-between gap-4" style={{ background: '#FFFBF0' }}>
        <span className={`text-sm font-bold ${feedback ? (feedback.ok ? 'text-[#58CC02]' : 'text-[#FF4B4B]') : 'text-transparent'}`}>
          {feedback?.text ?? '·'}
        </span>
        {done && (
          <button
            onClick={reset}
            className="text-xs font-bold px-3 py-1.5 rounded-lg border-2 border-[#1A1A2E] bg-white hover:bg-[#FFC800] transition-colors"
          >
            🔄 Reiniciar
          </button>
        )}
      </div>
    </div>
  )
}
