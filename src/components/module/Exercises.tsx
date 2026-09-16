import { useState, useMemo, type CSSProperties } from 'react'
import type { Mod, QuizState, DropState } from '../../types'
import { SpainMapSVG } from './SpainMapSVG'
import { SPAIN_REGIONS } from '../../data/regions'
import { shuffle } from '../../utils/helpers'


export function Exercises({ mod, onXP, onHeartLost }: { mod: Mod; onXP: (n: number) => void; onHeartLost: () => void }) {
  const [quizState, setQuizState] = useState<QuizState>({})
  const [dropState, setDropState] = useState<DropState>({})
  const [dragWord, setDragWord] = useState<string | null>(null)
  const [shakeKey, setShakeKey] = useState<string | null>(null)
  const [matchSel, setMatchSel] = useState<Record<string, string | null>>({})
  const [matchFlash, setMatchFlash] = useState<Record<string, { left: string; right: string } | null>>({})

  // Shuffle options once per module — prevents re-shuffling on every state update
  const stableOpts = useMemo(
    () => mod.challenges.map(q =>
      q.type === 'checkbox' ? { ...q, options: shuffle(q.options) } : q
    ),
    [mod.id] // eslint-disable-line react-hooks/exhaustive-deps
  )

  // Shuffle right-side items for matching questions once per module
  const stableMatchRights = useMemo<Record<number, string[]>>(
    () => {
      const result: Record<number, string[]> = {}
      mod.challenges.forEach((q, i) => {
        if (q.type === 'matching') result[i] = shuffle(q.pairs.map(p => p.right))
      })
      return result
    },
    [mod.id] // eslint-disable-line react-hooks/exhaustive-deps
  )

  // Shuffle figure options for visual_scenario questions once per module
  const stableSceneFigures = useMemo<Record<number, string[]>>(
    () => {
      const result: Record<number, string[]> = {}
      mod.challenges.forEach((q, i) => {
        if (q.type === 'visual_scenario') result[i] = shuffle([q.answer, ...q.distractors])
      })
      return result
    },
    [mod.id] // eslint-disable-line react-hooks/exhaustive-deps
  )

  function handleSceneDrop(qKey: string, figure: string, answer: string) {
    if (dropState[`${qKey}-vs`] === answer) return
    setDropState(s => ({ ...s, [`${qKey}-vs`]: figure }))
    setDragWord(null)
    if (figure === answer) {
      onXP(15)
    } else {
      setShakeKey(qKey)
      setTimeout(() => {
        setShakeKey(null)
        setDropState(s => { const next = { ...s }; delete next[`${qKey}-vs`]; return next })
      }, 1200)
    }
  }

  function answerQuiz(key: string, opt: { text: string; correct: boolean }) {
    if (quizState[key] !== undefined) return
    setQuizState(s => ({ ...s, [key]: { optionText: opt.text, correct: opt.correct } }))
    if (opt.correct) onXP(10)
    else {
      onHeartLost()
      setShakeKey(key)
      setTimeout(() => setShakeKey(null), 400)
    }
  }

  function answerDrop(key: string, expected: string, value: string) {
    if (dropState[key] === expected) return
    const correct = value === expected
    setDropState(s => ({ ...s, [key]: value }))
    if (correct) onXP(10)
    else {
      setShakeKey(key)
      setTimeout(() => setShakeKey(null), 400)
      // Keep wrong selection visible so user sees what they picked — no jarring reset
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-px flex-1 bg-[#1A1A2E]/20" />
        <span className="text-xs font-black tracking-widest text-[#1A1A2E]/50 uppercase">🎯 Práctica de Examen</span>
        <div className="h-px flex-1 bg-[#1A1A2E]/20" />
      </div>

      {stableOpts.map((q, qi) => {
        const qKey = `${mod.id}-${qi}`
        const isShaking = shakeKey === qKey

        if (q.type === 'checkbox') {
          return (
            <div key={qi} className={`${isShaking ? 'animate-shake' : ''}`}>
              <div className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                  style={{ background: mod.color }}
                >
                  {qi + 1}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[#1A1A2E] mb-3 leading-snug">{q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const ans = quizState[qKey]
                      const isAnswered = !!ans
                      const isSelected = ans?.optionText === opt.text
                      const revealCorrect = isAnswered && !ans.correct && opt.correct

                      let cardStyle = `border-2 ${isAnswered ? 'border-[#1A1A2E]/20' : 'border-[#1A1A2E]'} bg-white ${!isAnswered ? 'hover:bg-[#FFC800]/20' : ''}`
                      let shadow: CSSProperties = { boxShadow: isAnswered ? 'none' : '3px 3px 0 #1A1A2E' }

                      if (isSelected && ans?.correct) {
                        cardStyle = 'border-2 border-[#58CC02] bg-[#58CC02]/10'
                        shadow = { boxShadow: '3px 3px 0 #58CC02' }
                      } else if (isSelected && !ans?.correct) {
                        cardStyle = 'border-2 border-[#FF4B4B] bg-[#FF4B4B]/10'
                        shadow = { boxShadow: '3px 3px 0 #FF4B4B' }
                      } else if (revealCorrect) {
                        cardStyle = 'border-2 border-[#58CC02] bg-[#58CC02]/10'
                        shadow = { boxShadow: '3px 3px 0 #58CC02' }
                      }

                      return (
                        <button
                          key={oi}
                          onClick={() => answerQuiz(qKey, opt)}
                          disabled={isAnswered}
                          className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-[#1A1A2E] transition-all ${cardStyle} btn-choice`}
                          style={shadow}
                        >
                          <span className="mr-2 font-black">{oi === 0 ? 'A' : oi === 1 ? 'B' : 'C'}</span>
                          {opt.text}
                          {revealCorrect && <span className="ml-2 text-[#58CC02] text-xs font-black">✓ correcta</span>}
                        </button>
                      )
                    })}
                  </div>
                  {quizState[qKey] && (
                    <div className={`mt-3 px-4 py-2 rounded-xl text-sm font-bold animate-bounce-in ${quizState[qKey].correct ? 'bg-[#58CC02]/15 text-[#2d6e00] border-2 border-[#58CC02]' : 'bg-[#FF4B4B]/10 text-[#cc1a1a] border-2 border-[#FF4B4B]'}`}>
                      {quizState[qKey].correct
                        ? '✅ ¡Correcto! +10 XP'
                        : (() => {
                            const selected = q.options.find(o => o.text === quizState[qKey].optionText)
                            return selected?.specificFeedback
                              ? `❌ ${selected.specificFeedback}`
                              : '❌ Respuesta incorrecta — la correcta está destacada arriba'
                          })()
                      }
                    </div>
                  )}
                  {quizState[qKey] && q.explanation && (
                    <div className="mt-2 px-4 py-2 rounded-xl text-xs text-[#4B4B6B] border border-[#1A1A2E]/10 bg-white/60">
                      💡 {q.explanation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        }

        if (q.type === 'dropdown') {
          const allCorrect = q.parts
            .filter(p => typeof p !== 'string')
            .every(p => {
              if (typeof p === 'string') return true
              const k = `${qKey}-${(p as any).answer}`
              return dropState[k] === (p as any).answer
            })

          return (
            <div key={qi} className={`${isShaking ? 'animate-shake' : ''}`}>
              <div className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                  style={{ background: mod.color }}
                >
                  {qi + 1}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[#1A1A2E] leading-relaxed text-base">
                    {q.parts.map((part, pi) => {
                      if (typeof part === 'string') return <span key={pi}>{part}</span>
                      const k = `${qKey}-${part.answer}`
                      const val = dropState[k] || ''
                      const isCorrect = val === part.answer
                      const isWrong = val && !isCorrect
                      return (
                        <select
                          key={pi}
                          value={val}
                          onChange={e => answerDrop(k, part.answer, e.target.value)}
                          disabled={isCorrect}
                          className={`inline-block mx-1 px-2 py-0.5 rounded-lg border-2 font-bold text-sm outline-none transition-all ${isCorrect ? 'cursor-default' : 'cursor-pointer'} ${shakeKey === k ? 'animate-shake' : ''}`}
                          style={{
                            borderColor: isCorrect ? '#58CC02' : isWrong ? '#FF4B4B' : mod.color,
                            background: isCorrect ? 'rgba(88, 204, 2, 0.12)' : isWrong ? 'rgba(255, 75, 75, 0.1)' : '#fff',
                            color: '#1A1A2E',
                          }}
                        >
                          <option value="" disabled>···</option>
                          {part.options.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      )
                    })}
                  </p>
                  {allCorrect && (
                    <div className="mt-2 px-4 py-2 rounded-xl text-sm font-bold animate-bounce-in bg-[#58CC02]/15 text-[#2d6e00] border-2 border-[#58CC02]">
                      ✅ ¡Correcto! +10 XP
                    </div>
                  )}
                  {allCorrect && q.explanation && (
                    <div className="mt-2 px-4 py-2 rounded-xl text-xs text-[#4B4B6B] border border-[#1A1A2E]/10 bg-white/60">
                      💡 {q.explanation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        }

        if (q.type === 'dragdrop') {
          const blanksCorrect = q.parts
            .filter(p => typeof p !== 'string')
            .every(p => {
              if (typeof p === 'string') return true
              const k = `${qKey}-${(p as any).answer}`
              return dropState[k] === (p as any).answer
            })

          return (
            <div key={qi}>
              <div className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                  style={{ background: mod.color }}
                >
                  {qi + 1}
                </div>
                <div className="flex-1">
                  <div
                    className="rounded-xl px-4 py-3 border-2 border-dashed border-[#1A1A2E]/30 mb-3 flex flex-wrap gap-2 items-center"
                    style={{ background: mod.color + '15' }}
                  >
                    <span className="text-xs font-black text-[#1A1A2E]/40 uppercase tracking-wider mr-1">Arrastra →</span>
                    {q.wordBank.map(word => {
                      // Scope check to this question only — prevents cross-question greying
                      const used = q.parts
                        .filter((p): p is { answer: string } => typeof p !== 'string')
                        .some(p => dropState[`${qKey}-${p.answer}`] === word)
                      return (
                        <div
                          key={word}
                          draggable={!used}
                          onDragStart={() => setDragWord(word)}
                          onDragEnd={() => setDragWord(null)}
                          onClick={() => !used && setDragWord(dragWord === word ? null : word)}
                          className="px-3 py-1.5 rounded-lg border-2 border-[#1A1A2E] font-bold text-sm text-[#1A1A2E] cursor-grab select-none transition-all"
                          style={{
                            background: used ? '#e5e5e5' : dragWord === word ? mod.color + '30' : '#fff',
                            opacity: used ? 0.4 : 1,
                            boxShadow: dragWord === word ? `0 0 0 2px ${mod.color}` : used ? 'none' : '2px 2px 0 #1A1A2E',
                            outline: dragWord === word ? `2px solid ${mod.color}` : 'none',
                          }}
                        >
                          {word}
                        </div>
                      )
                    })}
                  </div>

                  <p className="font-bold text-[#1A1A2E] leading-loose text-base">
                    {q.parts.map((part, pi) => {
                      if (typeof part === 'string') return <span key={pi}>{part}</span>
                      const k = `${qKey}-${part.answer}`
                      const val = dropState[k]
                      const isCorrect = val === part.answer
                      const isWrong = val && !isCorrect

                      return (
                        <span
                          key={pi}
                          onDragOver={e => e.preventDefault()}
                          onDrop={e => {
                            e.preventDefault()
                            if (dragWord && !isCorrect) answerDrop(k, part.answer, dragWord)
                          }}
                          onClick={() => {
                            if (dragWord && !isCorrect) {
                              answerDrop(k, part.answer, dragWord)
                              setDragWord(null)
                            }
                          }}
                          className={`inline-block mx-1 px-3 py-0.5 rounded-lg border-2 font-bold text-sm align-middle transition-all min-w-[80px] text-center ${isCorrect ? 'cursor-default' : dragWord ? 'cursor-pointer ring-2 ring-offset-1' : 'cursor-pointer'} ${shakeKey === k ? 'animate-shake' : ''}`}
                          style={{
                            borderStyle: val ? 'solid' : 'dashed',
                            borderColor: isCorrect ? '#58CC02' : isWrong ? '#FF4B4B' : '#1A1A2E',
                            background: isCorrect ? 'rgba(88, 204, 2, 0.12)' : isWrong ? 'rgba(255, 75, 75, 0.1)' : '#f8f4e8',
                            color: isCorrect ? '#2d6e00' : isWrong ? '#cc1a1a' : '#999',
                          }}
                        >
                          {val || '···'}
                        </span>
                      )
                    })}
                  </p>

                  {blanksCorrect && Object.keys(dropState).filter(k => k.startsWith(qKey)).length > 0 && (
                    <div className="mt-2 px-4 py-2 rounded-xl text-sm font-bold animate-bounce-in bg-[#58CC02]/15 text-[#2d6e00] border-2 border-[#58CC02]">
                      ✅ ¡Correcto! +10 XP
                    </div>
                  )}
                  {blanksCorrect && Object.keys(dropState).filter(k => k.startsWith(qKey)).length > 0 && q.explanation && (
                    <div className="mt-2 px-4 py-2 rounded-xl text-xs text-[#4B4B6B] border border-[#1A1A2E]/10 bg-white/60">
                      💡 {q.explanation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        }

        if (q.type === 'map_pin') {
          const ans = quizState[qKey]
          const isAnswered = !!ans

          return (
            <div key={qi} className={`${isShaking ? 'animate-shake' : ''}`}>
              <div className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                  style={{ background: mod.color }}
                >
                  {qi + 1}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[#1A1A2E] mb-3">
                    📍 Encuentra en el mapa: <span style={{ color: mod.color }}>{q.targetName}</span>
                  </p>
                  <div className="rounded-2xl overflow-hidden border-3 border-[#1A1A2E] mb-2" style={{ borderWidth: 3, boxShadow: '3px 3px 0 #1A1A2E' }}>
                    <div className="relative w-full" style={{ paddingBottom: '78%' }}>
                      <SpainMapSVG />
                      {SPAIN_REGIONS.map(r => {
                        const isTarget = r.id === q.targetId
                        const isClicked = ans?.optionText === r.id
                        const isCorrectReveal = isAnswered && isTarget

                        let bg = mod.color
                        if (isAnswered) {
                          if (isCorrectReveal) bg = '#58CC02'
                          else if (isClicked && !ans?.correct) bg = '#FF4B4B'
                          else bg = '#ccc'
                        }

                        return (
                          <button
                            key={r.id}
                            onClick={() => {
                              if (isAnswered) return
                              const correct = r.id === q.targetId
                              setQuizState(s => ({ ...s, [qKey]: { optionText: r.id, correct } }))
                              if (correct) onXP(10)
                              else { setShakeKey(qKey); setTimeout(() => setShakeKey(null), 400) }
                            }}
                            disabled={isAnswered}
                            title={isAnswered ? r.name : '?'}
                            className={`absolute w-5 h-5 rounded-full border-2 border-white transition-all duration-200 hover:scale-125`}
                            style={{
                              left: `${r.x}%`,
                              top: `${r.y}%`,
                              transform: 'translate(-50%, -50%)',
                              background: bg,
                              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                              opacity: isAnswered && !isTarget && !isClicked ? 0.3 : 1,
                              zIndex: isCorrectReveal ? 5 : 2,
                              cursor: isAnswered ? 'default' : 'pointer',
                            }}
                          />
                        )
                      })}
                    </div>
                  </div>
                  {isAnswered && (
                    <div className={`mt-2 px-4 py-2 rounded-xl text-sm font-bold animate-bounce-in ${ans.correct ? 'bg-[#58CC02]/15 text-[#2d6e00] border-2 border-[#58CC02]' : 'bg-[#FF4B4B]/10 text-[#cc1a1a] border-2 border-[#FF4B4B]'}`}>
                      {ans.correct ? `✅ ¡Correcto! +10 XP — ${q.targetName}` : `❌ Incorrecto — el punto verde es ${q.targetName}`}
                    </div>
                  )}
                  {isAnswered && q.explanation && (
                    <div className="mt-2 px-4 py-2 rounded-xl text-xs text-[#4B4B6B] border border-[#1A1A2E]/10 bg-white/60">
                      💡 {q.explanation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        }

        if (q.type === 'matching') {
          const rights = stableMatchRights[qi] ?? q.pairs.map(p => p.right)
          const selectedLeft = matchSel[qKey] ?? null
          const flash = matchFlash[qKey] ?? null
          const allMatched = q.pairs.every(p => dropState[`${qKey}-m-${p.left}`] === p.right)
          const isFlashing = !!flash

          const handleMatchLeft = (left: string) => {
            if (allMatched || isFlashing) return
            const isAlreadyMatched = dropState[`${qKey}-m-${left}`] === q.pairs.find(p => p.left === left)?.right
            if (isAlreadyMatched) return
            setMatchSel(s => ({ ...s, [qKey]: s[qKey] === left ? null : left }))
          }

          const handleMatchRight = (right: string) => {
            if (allMatched || !selectedLeft || isFlashing) return
            const isAlreadyMatchedRight = q.pairs.some(p => dropState[`${qKey}-m-${p.left}`] === right)
            if (isAlreadyMatchedRight) return
            const expectedRight = q.pairs.find(p => p.left === selectedLeft)?.right
            const left = selectedLeft
            setMatchSel(s => ({ ...s, [qKey]: null }))
            if (right === expectedRight) {
              setDropState(s => ({ ...s, [`${qKey}-m-${left}`]: right }))
              onXP(10)
            } else {
              setMatchFlash(s => ({ ...s, [qKey]: { left, right } }))
              setTimeout(() => setMatchFlash(s => ({ ...s, [qKey]: null })), 1000)
            }
          }

          return (
            <div key={qi}>
              <div className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                  style={{ background: mod.color }}
                >
                  {qi + 1}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[#1A1A2E] mb-1">{q.prompt}</p>
                  {/* Status hint — fixed height prevents layout jump */}
                  <p className="text-xs font-semibold mb-3 leading-snug" style={{ minHeight: '2.4em' }}>
                    {flash ? (
                      <span className="text-[#cc1a1a]">
                        ✗ <strong>«{flash.left}»</strong> no corresponde a <strong>«{flash.right}»</strong>.{' '}
                        <span className="font-normal opacity-80">{q.wrongHint ?? 'Inténtalo de nuevo.'}</span>
                      </span>
                    ) : selectedLeft ? (
                      <span style={{ color: mod.color }}>
                        Seleccionado: <strong>«{selectedLeft}»</strong> — ahora toca su pareja →
                      </span>
                    ) : (
                      <span className="text-[#4B4B6B]">Toca un elemento de la izquierda y luego su pareja de la derecha</span>
                    )}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Left column */}
                    <div className="flex flex-col gap-2">
                      {q.pairs.map((pair, pi) => {
                        const isMatched = dropState[`${qKey}-m-${pair.left}`] === pair.right
                        const isSelected = selectedLeft === pair.left
                        const isFlashWrong = flash?.left === pair.left
                        return (
                          <button
                            key={pi}
                            onClick={() => handleMatchLeft(pair.left)}
                            disabled={isMatched || allMatched || isFlashing}
                            className="px-3 py-2.5 rounded-xl border-2 font-bold text-sm text-[#1A1A2E] text-left transition-all duration-200"
                            style={{
                              borderColor: isMatched ? '#58CC02' : isFlashWrong ? '#FF4B4B' : isSelected ? mod.color : '#1A1A2E',
                              background: isMatched ? 'rgba(88,204,2,0.12)' : isFlashWrong ? 'rgba(255,75,75,0.12)' : isSelected ? mod.color + '22' : '#fff',
                              boxShadow: isMatched ? '2px 2px 0 #58CC02' : isFlashWrong ? '2px 2px 0 #FF4B4B' : isSelected ? `2px 2px 0 ${mod.color}` : '2px 2px 0 #1A1A2E',
                              opacity: isMatched || isFlashWrong || isSelected ? 1 : (allMatched ? 0.5 : 1),
                            }}
                          >
                            {isMatched && <span className="text-[#58CC02] mr-1">✓</span>}
                            {isFlashWrong && <span className="text-[#FF4B4B] mr-1">✗</span>}
                            {pair.left}
                          </button>
                        )
                      })}
                    </div>
                    {/* Right column */}
                    <div className="flex flex-col gap-2">
                      {rights.map((right, ri) => {
                        const isMatched = q.pairs.some(p => dropState[`${qKey}-m-${p.left}`] === right)
                        const isFlashWrong = flash?.right === right
                        const isActive = !!selectedLeft && !isMatched && !isFlashing
                        return (
                          <button
                            key={ri}
                            onClick={() => handleMatchRight(right)}
                            disabled={isMatched || allMatched || isFlashing}
                            className="px-3 py-2.5 rounded-xl border-2 font-bold text-sm text-[#1A1A2E] text-left transition-all duration-200"
                            style={{
                              borderColor: isMatched ? '#58CC02' : isFlashWrong ? '#FF4B4B' : isActive ? '#1A1A2E' : 'rgba(26,26,46,0.3)',
                              background: isMatched ? 'rgba(88,204,2,0.12)' : isFlashWrong ? 'rgba(255,75,75,0.12)' : isActive ? '#FFFBF0' : '#f0ede4',
                              boxShadow: isMatched ? '2px 2px 0 #58CC02' : isFlashWrong ? '2px 2px 0 #FF4B4B' : isActive ? '2px 2px 0 #1A1A2E' : 'none',
                              opacity: isMatched || isFlashWrong || isActive ? 1 : 0.5,
                            }}
                          >
                            {isMatched && <span className="text-[#58CC02] mr-1">✓</span>}
                            {isFlashWrong && <span className="text-[#FF4B4B] mr-1">✗</span>}
                            {right}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  {allMatched && (
                    <div className="mt-3 px-4 py-2 rounded-xl text-sm font-bold animate-bounce-in bg-[#58CC02]/15 text-[#2d6e00] border-2 border-[#58CC02]">
                      ✅ ¡Todas las parejas correctas! +{q.pairs.length * 10} XP
                    </div>
                  )}
                  {allMatched && q.explanation && (
                    <div className="mt-2 px-4 py-2 rounded-xl text-xs text-[#4B4B6B] border border-[#1A1A2E]/10 bg-white/60 leading-relaxed">
                      💡 {q.explanation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        }

        if (q.type === 'visual_scenario') {
          const figures = stableSceneFigures[qi] ?? [q.answer, ...q.distractors]
          const vsKey = `${qKey}-vs`
          const placed = dropState[vsKey]
          const isCorrect = placed === q.answer
          const isWrong = !!placed && placed !== q.answer
          const isShakingVS = shakeKey === qKey

          return (
            <div key={qi}>
              <div className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                  style={{ background: mod.color }}
                >
                  {qi + 1}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[#1A1A2E] mb-1">{q.scene.emoji} {q.scene.title}</p>
                  <p className="text-xs text-[#4B4B6B] mb-3">{q.scene.setting} — <em>¿Quién pertenece a esta escena?</em></p>

                  {/* Stage */}
                  <div
                    className="relative rounded-2xl border-3 border-[#1A1A2E] mb-4 overflow-hidden"
                    style={{
                      background: q.scene.stageBg,
                      minHeight: '120px',
                      boxShadow: '4px 4px 0 #1A1A2E',
                    }}
                    onDragOver={e => { e.preventDefault() }}
                    onDrop={e => {
                      e.preventDefault()
                      const fig = e.dataTransfer.getData('text/plain')
                      if (fig) handleSceneDrop(qKey, fig, q.answer)
                    }}
                    onClick={() => {
                      if (!dragWord || isCorrect) return
                      handleSceneDrop(qKey, dragWord, q.answer)
                    }}
                  >
                    {/* Background emoji scenery */}
                    <div className="absolute inset-0 flex items-end justify-around pb-2 pointer-events-none select-none opacity-60 text-3xl px-3">
                      {q.scene.bgEmojis.map((em, i) => <span key={i}>{em}</span>)}
                    </div>

                    {/* Drop zone */}
                    <div className="relative z-10 flex flex-col items-center justify-center" style={{ minHeight: '120px' }}>
                      {isCorrect ? (
                        <div className="flex flex-col items-center gap-1 animate-land">
                          <span className="text-5xl drop-shadow-lg">{q.scene.successEmoji}</span>
                          <span className="text-sm font-black text-white drop-shadow px-3 py-1 rounded-xl" style={{ background: 'rgba(0,0,0,0.45)' }}>
                            {placed}
                          </span>
                          <span className="text-xs font-bold text-[#58CC02] bg-white/80 px-2 py-0.5 rounded-full">+15 XP ✅</span>
                        </div>
                      ) : isWrong ? (
                        <div className={`flex flex-col items-center gap-1 ${isShakingVS ? 'animate-shake' : ''}`}>
                          <span className="text-4xl opacity-50">😕</span>
                          <span className="text-xs font-bold text-white/80 bg-black/30 px-3 py-1 rounded-xl text-center max-w-[180px]">
                            {q.wrongHint ?? 'No es correcto. Inténtalo de nuevo.'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-white/70">
                          <span className="text-3xl">🎯</span>
                          <span className="text-xs font-bold border-2 border-dashed border-white/40 rounded-xl px-4 py-2 text-center" style={{ minWidth: '140px' }}>
                            {q.scene.dropZoneLabel}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Figure buttons */}
                  {!isCorrect && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {figures.map((fig, fi) => {
                        const isSelected = dragWord === fig
                        return (
                          <button
                            key={fi}
                            draggable
                            onDragStart={e => { e.dataTransfer.setData('text/plain', fig); setDragWord(fig) }}
                            onDragEnd={() => setDragWord(null)}
                            onClick={() => {
                              if (dragWord === fig) {
                                handleSceneDrop(qKey, fig, q.answer)
                              } else {
                                setDragWord(fig)
                              }
                            }}
                            className="px-4 py-2.5 rounded-xl border-2 font-black text-sm transition-all duration-150 cursor-grab active:cursor-grabbing select-none"
                            style={{
                              borderColor: isSelected ? mod.color : '#1A1A2E',
                              background: isSelected ? mod.color + '22' : '#FFFBF0',
                              boxShadow: isSelected ? `3px 3px 0 ${mod.color}` : '3px 3px 0 #1A1A2E',
                              transform: isSelected ? 'translateY(-2px)' : 'none',
                              color: '#1A1A2E',
                            }}
                          >
                            {fig}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {isCorrect && q.scene.successText && (
                    <div className="mt-2 px-4 py-2 rounded-xl text-xs text-[#2d6e00] border-2 border-[#58CC02] bg-[#58CC02]/10 font-bold">
                      🎉 {q.scene.successText}
                    </div>
                  )}
                  {isCorrect && q.explanation && (
                    <div className="mt-2 px-4 py-2 rounded-xl text-xs text-[#4B4B6B] border border-[#1A1A2E]/10 bg-white/60 leading-relaxed">
                      💡 {q.explanation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        }

        return null
      })}
    </div>
  )
}
