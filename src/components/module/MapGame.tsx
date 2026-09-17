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
          // Label goes above the pin for southern regions to avoid bottom overflow
          const labelAbove = r.y >= 68
          return (
            <div
              key={r.id}
              style={{
                position: 'absolute',
                left: `${r.x}%`,
                top: `${r.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: isFound ? 10 : 2,
              }}
            >
              <button
                onClick={() => click(r.id)}
                className={`rounded-full border-2 border-white cursor-pointer transition-all duration-200 hover:scale-125 ${isShaking ? 'animate-shake' : ''}`}
                style={{
                  display: 'block',
                  background: isFound ? '#58CC02' : (done ? '#1CB0F6' : color),
                  boxShadow: '0 2px 5px rgba(0,0,0,0.35)',
                  width: '1.0rem',
                  height: '1.0rem',
                  minWidth: '1.0rem',
                  minHeight: '1.0rem',
                }}
                title={isFound ? r.name : '?'}
              />
              {isFound && (
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    [labelAbove ? 'bottom' : 'top']: 'calc(100% + 3px)',
                    transform: 'translateX(-50%)',
                    background: 'rgba(255,255,255,0.96)',
                    border: '1.5px solid #1A1A2E',
                    borderRadius: '4px',
                    padding: '1px 5px',
                    fontSize: '8px',
                    fontWeight: 800,
                    color: '#1A1A2E',
                    whiteSpace: 'nowrap',
                    boxShadow: '1px 1px 0 #1A1A2E',
                    pointerEvents: 'none',
                    lineHeight: 1.4,
                  }}
                >
                  {r.name}
                </div>
              )}
            </div>
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
