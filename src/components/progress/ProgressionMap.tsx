import { BADGES } from '../../data/badges'

// ─── Progression Map ──────────────────────────────────────────────────────────

export function ProgressionMap({ xp, unlockedBadges }: { xp: number; unlockedBadges: Set<string> }) {
  const nextBadge = BADGES.find(b => !unlockedBadges.has(b.id))
  const xpToNext = nextBadge ? nextBadge.xpRequired - xp : 0
  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-black text-[#1A1A2E] text-2xl mb-1" style={{ fontFamily: "'Fredoka One', cursive" }}>Mi Progresión</h1>
        <p className="text-[#4B4B6B] text-sm font-semibold">Desbloquea monumentos icónicos de España a medida que ganas XP</p>
      </div>

      {/* XP progress to next badge */}
      {nextBadge && (
        <div className="rounded-2xl p-4" style={{ border: '3px solid #1A1A2E', background: '#fff', boxShadow: '4px 4px 0 #CE82FF' }}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{nextBadge.emoji}</span>
            <div>
              <p className="font-black text-[#1A1A2E] text-sm">Próxima insignia: <span style={{ color: '#CE82FF' }}>{nextBadge.name}</span></p>
              <p className="text-[#4B4B6B] text-xs font-semibold">Faltan <strong>{xpToNext} XP</strong> — tienes {xp} XP</p>
            </div>
          </div>
          <div className="h-3 w-full bg-[#1A1A2E]/10 rounded-full overflow-hidden border border-[#1A1A2E]/20">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.round((xp / nextBadge.xpRequired) * 100))}%`, background: '#CE82FF' }}
            />
          </div>
        </div>
      )}
      {!nextBadge && (
        <div className="rounded-2xl p-4 text-center" style={{ border: '3px solid #58CC02', background: '#58CC0215', boxShadow: '4px 4px 0 #58CC02' }}>
          <p className="font-black text-[#1A1A2E] text-lg">🏆 ¡Colección completa!</p>
          <p className="text-[#4B4B6B] text-sm">Has desbloqueado todas las insignias de España.</p>
        </div>
      )}

      {/* Badge grid */}
      <div className="grid grid-cols-2 gap-4">
        {BADGES.map(badge => {
          const unlocked = unlockedBadges.has(badge.id)
          return (
            <div
              key={badge.id}
              className="rounded-2xl p-4 flex flex-col gap-2 transition-all"
              style={{
                border: `3px solid ${unlocked ? '#1A1A2E' : '#1A1A2E40'}`,
                background: unlocked ? '#fff' : '#1A1A2E08',
                boxShadow: unlocked ? '3px 3px 0 #CE82FF' : 'none',
                opacity: unlocked ? 1 : 0.5,
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-3xl flex-shrink-0" style={{ filter: unlocked ? 'none' : 'grayscale(1)' }}>{badge.emoji}</span>
                <div className="min-w-0">
                  <p className="font-black text-[#1A1A2E] text-sm leading-tight truncate">{badge.name}</p>
                  <p className="text-xs font-bold truncate" style={{ color: unlocked ? '#CE82FF' : '#1A1A2E60' }}>
                    {unlocked ? '✓ Desbloqueada' : `${badge.xpRequired} XP`}
                  </p>
                </div>
              </div>
              {unlocked && (
                <p className="text-xs text-[#4B4B6B] leading-snug">{badge.trivia}</p>
              )}
              {!unlocked && (
                <p className="text-xs text-[#1A1A2E]/40 leading-snug">Necesitas {badge.xpRequired} XP para desbloquear</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
