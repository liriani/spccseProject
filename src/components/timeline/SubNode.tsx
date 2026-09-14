import { useRef, useCallback } from 'react'
import { type SubNode as SubNodeType } from './types'
import { useTimeline } from './TimelineMindMap'
import { FigureLeaf } from './FigureLeaf'

interface Props {
  subNode: SubNodeType
  branchIndex: number
  totalBranches: number
  parentId: string
  isActive: boolean
  isHovered: boolean
}

// ── Type → accent color ──────────────────────────────────────────────────────

const TYPE_COLOR: Record<string, string> = {
  movement: '#CE82FF',
  event:    '#1CB0F6',
  battle:   '#FF4B4B',
  faction:  '#FFC800',
  figure:   '#58CC02',
}

const TYPE_EMOJI: Record<string, string> = {
  movement: '🎨',
  event:    '📅',
  battle:   '⚔️',
  faction:  '🏴',
  figure:   '👤',
}

// ─────────────────────────────────────────────────────────────────────────────

export function SubNode({
  subNode,
  branchIndex,
  totalBranches,
  parentId,
  isActive,
  isHovered,
}: Props) {
  const { dispatch } = useTimeline()
  const subNodeRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = useCallback(() => {
    dispatch({ type: 'SUBNODE_HOVER_ENTER', subNodeId: subNode.id })
  }, [dispatch, subNode.id])

  const handleMouseLeave = useCallback(() => {
    dispatch({ type: 'SUBNODE_HOVER_LEAVE' })
  }, [dispatch])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      dispatch({ type: 'SUBNODE_CLICK', subNodeId: subNode.id })
    },
    [dispatch, subNode.id],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        dispatch({ type: 'SUBNODE_CLICK', subNodeId: subNode.id })
      }
    },
    [dispatch, subNode.id],
  )

  const typeColor = TYPE_COLOR[subNode.type] ?? '#FF6B35'
  const typeEmoji = TYPE_EMOJI[subNode.type] ?? '📌'

  const cardBorderColor = isActive ? typeColor : isHovered ? typeColor : 'rgba(26,26,46,0.2)'
  const cardBg = isActive
    ? `${typeColor}10`
    : isHovered
    ? `${typeColor}08`
    : '#ffffff'
  const cardShadow = isActive
    ? `3px 3px 0 ${typeColor}`
    : isHovered
    ? `2px 2px 0 ${typeColor}`
    : '2px 2px 0 rgba(26,26,46,0.12)'

  return (
    /*
     * subnode-wrapper
     *   data-subnode-id   — stable id for GSAP targeting
     *   data-branch-index — position among siblings (stagger)
     *   data-branch-side  — 'left' | 'right'
     *   data-branch-total — sibling count (SVG path curves)
     *   data-parent-id    — parent main node
     *   data-active       — figures leaf-panel open
     *   data-hovered      — currently hovered
     *   data-type         — semantic category
     */
    <div
      ref={subNodeRef}
      className="subnode-wrapper"
      data-subnode-id={subNode.id}
      data-branch-index={branchIndex}
      data-branch-side={subNode.branchSide}
      data-branch-total={totalBranches}
      data-parent-id={parentId}
      data-active={String(isActive)}
      data-hovered={String(isHovered)}
      data-type={subNode.type}
    >
      {/*
       * branch-connector — drawing surface for the mind-map line.
       * Styled as a subtle top accent; swap for an <svg> with DrawSVG.
       */}
      <div
        className="branch-connector"
        aria-hidden="true"
        data-branch-side={subNode.branchSide}
        data-branch-index={branchIndex}
        style={{ height: '3px', background: typeColor, borderRadius: '9999px', marginBottom: '0.375rem', opacity: 0.35 }}
      />

      {/* ── Sub-node card ── */}
      <div
        className="subnode-card"
        role="button"
        tabIndex={0}
        aria-expanded={isActive}
        aria-label={`${subNode.label}. ${isActive ? 'Collapse' : 'Expand'} figures.`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        style={{
          padding: '0.75rem',
          borderRadius: '0.75rem',
          border: `2px solid ${cardBorderColor}`,
          background: cardBg,
          boxShadow: cardShadow,
          cursor: 'pointer',
          transition: 'all 0.18s ease',
          userSelect: 'none',
        }}
      >
        {/* Type badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem' }}>{typeEmoji}</span>
          <span
            className="subnode-type-badge"
            data-type={subNode.type}
            style={{
              fontSize: '0.55rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: typeColor,
              background: `${typeColor}18`,
              padding: '0.1rem 0.4rem',
              borderRadius: '9999px',
              border: `1px solid ${typeColor}40`,
            }}
          >
            {subNode.type}
          </span>
          {subNode.year !== undefined && (
            <time
              className="subnode-year"
              dateTime={String(subNode.year)}
              style={{ marginLeft: 'auto', fontSize: '0.6rem', fontWeight: 700, color: 'rgba(26,26,46,0.38)' }}
            >
              {subNode.year}
            </time>
          )}
        </div>

        <h4
          className="subnode-label"
          style={{
            fontFamily: "'Fredoka One', cursive",
            fontSize: '0.9rem',
            fontWeight: 900,
            color: '#1A1A2E',
            margin: '0 0 0.3rem',
            lineHeight: 1.2,
          }}
        >
          {subNode.label}
        </h4>

        <p
          className="subnode-description"
          style={{ fontSize: '0.7rem', color: 'rgba(26,26,46,0.58)', lineHeight: 1.5, margin: 0 }}
        >
          {subNode.description}
        </p>

        {subNode.figures.length > 0 && (
          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span
              className="subnode-figure-count"
              aria-hidden="true"
              style={{
                fontSize: '0.6rem',
                fontWeight: 700,
                color: typeColor,
                background: `${typeColor}15`,
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                border: `1px solid ${typeColor}30`,
              }}
            >
              {subNode.figures.length} figura{subNode.figures.length !== 1 ? 's' : ''}
            </span>
            <span style={{ fontSize: '0.6rem', color: 'rgba(26,26,46,0.35)', marginLeft: 'auto' }}>
              {isActive ? '▲' : '▼'}
            </span>
          </div>
        )}
      </div>

      {/* Figure leaves — conditionally mounted when active */}
      {isActive && subNode.figures.length > 0 && (
        <ul
          className="figures-list"
          aria-label={`Figures in ${subNode.label}`}
          data-subnode-parent={subNode.id}
          style={{ margin: '0.375rem 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}
        >
          {subNode.figures.map((figure) => (
            <li key={figure.id} className="figure-list-item">
              <FigureLeaf figure={figure} parentSubNodeId={subNode.id} accentColor={typeColor} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
