import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CardType = 'identity' | 'health' | 'driving' | 'social' | 'tax' | 'municipal'

export interface DocumentCard {
  id: string
  acronym: string
  nameEs: string
  nameEn: string
  issuer: string
  purpose: string
  requiredFor: string[]
  validity: string
  cardType: CardType
  stackIndex: number
}

export interface WalletState {
  activeCardId: string | null
  hoveredCardId: string | null
  isWalletHovered: boolean
}

// ─── Design tokens per card type ─────────────────────────────────────────────

const CARD_THEMES: Record<CardType, { gradient: string; chip: string; label: string }> = {
  municipal: {
    gradient: 'linear-gradient(135deg, #4a5568 0%, #2d3748 50%, #1a202c 100%)',
    chip: '#9CA3AF',
    label: 'Padrón',
  },
  tax: {
    gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 50%, #92400e 100%)',
    chip: '#FCD34D',
    label: 'NIE',
  },
  identity: {
    gradient: 'linear-gradient(135deg, #2563EB 0%, #1d4ed8 50%, #1e3a8a 100%)',
    chip: '#93C5FD',
    label: 'TIE',
  },
  health: {
    gradient: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
    chip: '#6EE7B7',
    label: 'SIP',
  },
  social: {
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 50%, #4C1D95 100%)',
    chip: '#C4B5FD',
    label: 'NASS',
  },
  driving: {
    gradient: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 50%, #7f1d1d 100%)',
    chip: '#FCA5A5',
    label: 'DGT',
  },
}

// ─── Data ─────────────────────────────────────────────────────────────────────

export const WALLET_DOCUMENTS: DocumentCard[] = [
  {
    id: 'padron',
    acronym: 'Padrón',
    nameEs: 'Certificado de Empadronamiento',
    nameEn: 'Certificado municipal de residencia',
    issuer: 'Ayuntamiento',
    purpose: 'Acredita tu domicilio registrado en España. Sin él, casi ningún otro trámite es posible.',
    requiredFor: ['Solicitar la TIE / NIE', 'Escolarizar a los hijos en colegios públicos', 'Obtener la tarjeta sanitaria', 'Ciertas renovaciones de visado', 'Elecciones municipales'],
    validity: 'Válido 3 meses para trámites oficiales',
    cardType: 'municipal',
    stackIndex: 0,
  },
  {
    id: 'nie',
    acronym: 'NIE',
    nameEs: 'Número de Identificación de Extranjero',
    nameEn: 'Número de identificación fiscal para extranjeros',
    issuer: 'Dirección General de Policía',
    purpose: 'Tu número de identificación fiscal en España. Necesario para casi cualquier acto económico o jurídico.',
    requiredFor: ['Comprar o alquilar una vivienda', 'Abrir una cuenta bancaria en España', 'Firmar contratos de trabajo', 'Pagar impuestos (IRPF, IVA)', 'Comprar un coche o motocicleta'],
    validity: 'Número permanente — el certificado caduca periódicamente',
    cardType: 'tax',
    stackIndex: 1,
  },
  {
    id: 'tie',
    acronym: 'TIE',
    nameEs: 'Tarjeta de Identidad de Extranjero',
    nameEn: 'Tarjeta de identidad para residentes extranjeros',
    issuer: 'Ministerio del Interior',
    purpose: 'Tu documento de identidad físico como extranjero en España. Acredita tu derecho legal de residencia.',
    requiredFor: ['Identificación cotidiana', 'Apertura de cuenta bancaria', 'Alquiler de vivienda', 'Contratos laborales', 'Viajes dentro del espacio Schengen'],
    validity: '1 año inicial, luego 2–5 años',
    cardType: 'identity',
    stackIndex: 2,
  },
  {
    id: 'sip',
    acronym: 'SIP / TSI',
    nameEs: 'Tarjeta Sanitaria Individual',
    nameEn: 'Tarjeta de acceso a la sanidad pública',
    issuer: 'Servicio de Salud Autonómico',
    purpose: 'Da acceso a la sanidad pública española. Cada comunidad autónoma emite su propia versión.',
    requiredFor: ['Citas con el médico de cabecera', 'Derivaciones a especialistas', 'Urgencias hospitalarias', 'Medicamentos subvencionados', 'Atención al embarazo y maternidad'],
    validity: 'Se renueva automáticamente si estás empadronado',
    cardType: 'health',
    stackIndex: 3,
  },
  {
    id: 'nass',
    acronym: 'NASS',
    nameEs: 'Número de Afiliación a la SS',
    nameEn: 'Número de afiliación a la Seguridad Social',
    issuer: 'Tesorería General de la SS',
    purpose: 'Te vincula al sistema de la Seguridad Social española. Imprescindible para trabajar legalmente.',
    requiredFor: ['Contratos de trabajo', 'Prestación por desempleo (el paro)', 'Baja por enfermedad (baja médica)', 'Pensión de jubilación', 'Baja por maternidad o paternidad'],
    validity: 'Permanente — se asigna una sola vez y no cambia',
    cardType: 'social',
    stackIndex: 4,
  },
  {
    id: 'conducir',
    acronym: 'Carné B',
    nameEs: 'Permiso de Conducir Categoría B',
    nameEn: 'Permiso de conducir (Cat. B)',
    issuer: 'Dirección General de Tráfico',
    purpose: 'Autoriza la conducción de vehículos de pasajeros en España y en toda la UE.',
    requiredFor: ['Conducir cualquier automóvil en España', 'Alquilar un vehículo', 'Identificación fotográfica en el extranjero', 'Ciertos empleos que requieren conducción'],
    validity: '10 años (ciclos de renovación más cortos a partir de los 65)',
    cardType: 'driving',
    stackIndex: 5,
  },
]

const TOTAL = WALLET_DOCUMENTS.length

// ─── Fan-out positions ────────────────────────────────────────────────────────

function getFanTransform(index: number, isHovered: boolean, isActive: boolean, anyActive: boolean) {
  if (isActive) {
    return { x: 0, y: -20, rotate: 0, scale: 1.05, zIndex: 50 }
  }
  if (anyActive) {
    // Push non-active cards slightly away
    const side = index < TOTAL / 2 ? -1 : 1
    return { x: side * 30, y: 30, rotate: side * 5, scale: 0.9, zIndex: index }
  }
  if (isHovered) {
    // Fan-out: spread cards in a semicircle
    const spread = 110
    const midpoint = (TOTAL - 1) / 2
    const offset = index - midpoint
    return {
      x: offset * spread * 0.5,
      y: Math.abs(offset) * 10 - 10,
      rotate: offset * 8,
      scale: 1 + (index === Math.round(midpoint) ? 0.05 : 0),
      zIndex: index,
    }
  }
  // Stacked: cards slightly offset for depth
  return {
    x: (index - TOTAL / 2) * 2,
    y: (TOTAL - 1 - index) * -3,
    rotate: (index - TOTAL / 2) * 0.5,
    scale: 1 - (TOTAL - 1 - index) * 0.02,
    zIndex: index,
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DocumentWallet() {
  const [state, setState] = useState<WalletState>({
    activeCardId: null,
    hoveredCardId: null,
    isWalletHovered: false,
  })

  const handleWalletMouseEnter = useCallback(() => {
    setState(s => ({ ...s, isWalletHovered: true }))
  }, [])
  const handleWalletMouseLeave = useCallback(() => {
    setState(s => ({ ...s, isWalletHovered: false, hoveredCardId: null }))
  }, [])
  const handleCardMouseEnter = useCallback((id: string) => {
    setState(s => ({ ...s, hoveredCardId: id }))
  }, [])
  const handleCardMouseLeave = useCallback(() => {
    setState(s => ({ ...s, hoveredCardId: null }))
  }, [])
  const handleCardClick = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setState(s => ({ ...s, activeCardId: s.activeCardId === id ? null : id }))
  }, [])
  const handleBackdropClick = useCallback(() => {
    setState(s => ({ ...s, activeCardId: null }))
  }, [])
  const handleCardKeyDown = useCallback((e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setState(s => ({ ...s, activeCardId: s.activeCardId === id ? null : id }))
    }
    if (e.key === 'Escape') setState(s => ({ ...s, activeCardId: null }))
  }, [])

  const activeCard = WALLET_DOCUMENTS.find(d => d.id === state.activeCardId) ?? null
  const anyActive = state.activeCardId !== null

  return (
    <section
      className="relative"
      onClick={handleBackdropClick}
      aria-label="Documentos importantes para vivir en España"
    >
      {/* ── Section header ── */}
      <div className="mb-8">
        <p className="text-xs font-black uppercase tracking-widest text-[#FF6B35] mb-1">Trámites</p>
        <h2 className="font-black text-2xl text-[#1A1A2E]" style={{ fontFamily: "'Fredoka One', cursive" }}>
          Tu Cartera de Documentos 🪪
        </h2>
        <p className="text-sm text-[#1A1A2E]/50 mt-1">
          {state.isWalletHovered ? 'Haz clic en una tarjeta para ver los detalles' : 'Pasa el ratón por la cartera para desplegar'}
        </p>
      </div>

      {/* ── Wallet container ── */}
      <div
        className="rounded-3xl border-2 border-[#1A1A2E]/10 p-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(255,251,240,0.8) 0%, rgba(255,245,225,0.9) 100%)', boxShadow: '0 8px 32px rgba(26,26,46,0.08)' }}
      >
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #1A1A2E 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* ── Stack area ── */}
        <div
          className="relative flex items-center justify-center"
          style={{ height: 220 }}
          data-wallet-hovered={String(state.isWalletHovered)}
          data-active-card={state.activeCardId ?? ''}
          onMouseEnter={handleWalletMouseEnter}
          onMouseLeave={handleWalletMouseLeave}
          role="list"
          aria-label="Pila de documentos"
        >
          {/* Wallet base (shadow/pocket) */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-2xl border-2 border-[#1A1A2E]/10"
            style={{ width: 280, height: 180, background: 'rgba(26,26,46,0.04)', boxShadow: 'inset 0 4px 12px rgba(26,26,46,0.08)' }}
          />

          {[...WALLET_DOCUMENTS].reverse().map(doc => {
            const isActive = state.activeCardId === doc.id
            const isHovered = state.hoveredCardId === doc.id
            const theme = CARD_THEMES[doc.cardType]
            const { x, y, rotate, scale, zIndex } = getFanTransform(doc.stackIndex, state.isWalletHovered, isActive, anyActive)

            return (
              <motion.article
                key={doc.id}
                role="listitem"
                data-card-id={doc.id}
                data-card-index={doc.stackIndex}
                data-card-type={doc.cardType}
                data-active={String(isActive)}
                data-hovered={String(isHovered)}
                tabIndex={0}
                aria-expanded={isActive}
                aria-label={`${doc.acronym} — ${doc.nameEs}`}
                className="absolute cursor-pointer rounded-2xl select-none focus:outline-none"
                style={{ width: 256, height: 160, zIndex, background: theme.gradient, boxShadow: isActive ? `0 20px 60px rgba(0,0,0,0.35), 0 0 0 2px rgba(255,255,255,0.2)` : isHovered ? '0 12px 32px rgba(0,0,0,0.25)' : '0 4px 16px rgba(0,0,0,0.2)' }}
                animate={{ x, y, rotate, scale }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                onClick={e => handleCardClick(e, doc.id)}
                onMouseEnter={() => handleCardMouseEnter(doc.id)}
                onMouseLeave={handleCardMouseLeave}
                onKeyDown={e => handleCardKeyDown(e, doc.id)}
                whileTap={{ scale: scale * 0.96 }}
              >
                {/* Card content */}
                <div className="relative w-full h-full p-4 overflow-hidden">
                  {/* Glossy overlay */}
                  <div className="absolute inset-0 rounded-2xl opacity-20" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 60%)' }} />

                  {/* EMV chip */}
                  <div className="absolute top-4 left-4 w-8 h-6 rounded-md border border-white/20" style={{ background: theme.chip, opacity: 0.9 }}>
                    <div className="grid grid-cols-2 gap-px p-0.5 h-full">
                      {[...Array(4)].map((_, i) => <div key={i} className="rounded-sm bg-black/20" />)}
                    </div>
                  </div>

                  {/* Contactless icon */}
                  <div className="absolute top-4 right-4 text-white/40 text-lg">◉</div>

                  {/* Acronym */}
                  <div className="absolute bottom-10 left-4">
                    <span className="text-white font-black text-2xl tracking-wider" style={{ fontFamily: "'Fredoka One', cursive", textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                      {doc.acronym}
                    </span>
                  </div>

                  {/* Issuer */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest leading-tight" style={{ maxWidth: '70%' }}>
                      {doc.issuer}
                    </span>
                    <span className="text-white/40 text-xs font-bold">
                      {isActive ? '✕' : '＋'}
                    </span>
                  </div>

                  {/* Expand hint on hover */}
                  <AnimatePresence>
                    {isHovered && !isActive && !anyActive && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl flex items-center justify-center"
                        style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <span className="text-white font-black text-sm bg-white/20 px-3 py-1 rounded-full">
                          Ver detalles →
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.article>
            )
          })}
        </div>

        {/* ── Detail panel ── */}
        <AnimatePresence>
          {activeCard && (
            <motion.div
              key={activeCard.id}
              className="mt-4 rounded-2xl overflow-hidden border-2 border-[#1A1A2E]/10"
              style={{ background: CARD_THEMES[activeCard.cardType].gradient }}
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              onClick={e => e.stopPropagation()}
              role="region"
              aria-label={`Detalle: ${activeCard.nameEs}`}
            >
              <div className="p-6 text-white">
                <header className="mb-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-black text-3xl" style={{ fontFamily: "'Fredoka One', cursive" }}>
                      {activeCard.acronym}
                    </h3>
                    <motion.button
                      className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm hover:bg-white/30"
                      onClick={handleBackdropClick}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Cerrar detalle"
                    >
                      ✕
                    </motion.button>
                  </div>
                  <p className="font-bold text-white/90 text-sm">{activeCard.nameEs}</p>
                  <p className="text-white/50 text-xs">{activeCard.nameEn}</p>
                </header>

                <p className="text-white/80 text-sm mb-4 leading-relaxed border-l-2 border-white/30 pl-3">
                  {activeCard.purpose}
                </p>

                <div className="mb-4">
                  <h4 className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-2">
                    ¿Para qué lo necesitas?
                  </h4>
                  <ul className="space-y-1.5">
                    {activeCard.requiredFor.map((use, i) => (
                      <motion.li
                        key={use}
                        className="flex items-start gap-2 text-sm text-white/80"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <span className="text-white/40 mt-0.5 flex-shrink-0">→</span>
                        {use}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-white/20">
                  <span className="text-white/40 text-xs font-black uppercase tracking-wider">Validez</span>
                  <span className="text-white/80 text-xs bg-white/10 px-2 py-0.5 rounded-full">{activeCard.validity}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Hover hint strip ── */}
      <AnimatePresence>
        {state.hoveredCardId && !anyActive && (() => {
          const hovered = WALLET_DOCUMENTS.find(d => d.id === state.hoveredCardId)!
          return (
            <motion.aside
              key={hovered.id}
              className="mt-3 px-4 py-2 rounded-xl border border-[#1A1A2E]/10 bg-white/80 backdrop-blur-sm"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              aria-hidden="true"
            >
              <span className="text-xs font-black text-[#1A1A2E]/40 uppercase tracking-wider mr-2">{hovered.acronym}</span>
              <span className="text-xs text-[#1A1A2E]/60">{hovered.purpose}</span>
            </motion.aside>
          )
        })()}
      </AnimatePresence>
    </section>
  )
}
