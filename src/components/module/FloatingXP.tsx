import { useEffect } from 'react'

// Floating "+XP" notification — appears on correct answer, floats up and fades
export function FloatingXP({ amount, id, onDone }: { amount: number; id: number; onDone: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDone(id), 1200)
    return () => clearTimeout(t)
  }, [id, onDone])

  return (
    <div className="fixed z-50 pointer-events-none animate-float-score" style={{ top: '3.5rem', right: '1rem' }}>
      <div
        className="flex items-center gap-1.5 font-black text-[#1A1A2E] px-3 py-1.5 rounded-2xl border-2 border-[#1A1A2E]"
        style={{ background: '#FFC800', boxShadow: '3px 3px 0 #1A1A2E', fontSize: '1rem' }}
      >
        ⭐ +{amount} XP
      </div>
    </div>
  )
}
