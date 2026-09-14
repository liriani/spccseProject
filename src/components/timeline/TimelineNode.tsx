import { useRef, useCallback } from 'react'
import { type TimelineEvent } from './types'
import { useTimeline } from './TimelineMindMap'
import { NodeBranches } from './NodeBranches'

interface Props {
  event: TimelineEvent
  index: number
  isActive: boolean
  isHovered: boolean
  isDimmed: boolean
}

export function TimelineNode({ event, index, isActive, isHovered, isDimmed }: Props) {
  const { dispatch } = useTimeline()
  const nodeRef = useRef<HTMLElement>(null)

  const handleMouseEnter = useCallback(() => {
    dispatch({ type: 'NODE_HOVER_ENTER', nodeId: event.id })
  }, [dispatch, event.id])

  const handleMouseLeave = useCallback(() => {
    dispatch({ type: 'NODE_HOVER_LEAVE' })
  }, [dispatch])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      dispatch({ type: 'NODE_CLICK', nodeId: event.id })
    },
    [dispatch, event.id],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        dispatch({ type: 'NODE_CLICK', nodeId: event.id })
      }
    },
    [dispatch, event.id],
  )

  // Dynamic card styles derived from state
  const cardBorderColor = isActive ? '#FF6B35' : '#1A1A2E'
  const cardBg = isActive ? 'rgba(255,107,53,0.06)' : isHovered ? 'rgba(255,107,53,0.03)' : '#ffffff'
  const cardShadow = isActive
    ? '5px 5px 0 #FF6B35'
    : isHovered
    ? '4px 4px 0 #FF6B35'
    : '4px 4px 0 #1A1A2E'

  return (
    /*
     * <article> is the semantic unit for one historical milestone.
     *
     * data attributes for GSAP targeting:
     *   data-node-id      — unique id, stable across renders
     *   data-node-index   — position in the list (0-based)
     *   data-active       — "true" when this node is expanded
     *   data-hovered      — "true" during hover preview state
     *   data-dimmed       — "true" when another node is active
     */
    <article
      ref={nodeRef}
      className="timeline-node"
      data-node-id={event.id}
      data-node-index={index}
      data-active={String(isActive)}
      data-hovered={String(isHovered)}
      data-dimmed={String(isDimmed)}
      aria-expanded={isActive}
      aria-label={`${event.year} — ${event.title}`}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        opacity: isDimmed ? 0.3 : 1,
        transform: isDimmed ? 'scale(0.99)' : 'scale(1)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
    >
      {/* ── Year column (left of spine) ── */}
      <div style={{ width: '4rem', flexShrink: 0, paddingTop: '1rem', textAlign: 'right' }}>
        <time
          className="node-year"
          dateTime={String(event.year)}
          style={{
            display: 'block',
            fontFamily: "'Fredoka One', cursive",
            fontSize: '1rem',
            fontWeight: 900,
            color: isActive ? '#FF6B35' : 'rgba(26,26,46,0.5)',
            lineHeight: 1,
            transition: 'color 0.2s ease',
          }}
        >
          {event.year}
        </time>
      </div>

      {/* ── Pulse dot on the spine ── */}
      <span
        className="node-pulse"
        aria-hidden="true"
        style={{
          display: 'block',
          width: '0.875rem',
          height: '0.875rem',
          flexShrink: 0,
          marginTop: '1.1875rem',
          borderRadius: '50%',
          background: isActive ? '#FF6B35' : '#1A1A2E',
          border: `3px solid ${isActive ? '#FF6B35' : '#1A1A2E'}`,
          boxShadow: isActive ? '0 0 0 4px rgba(255,107,53,0.25)' : 'none',
          transition: 'all 0.25s ease',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <span className="node-pulse-ring" />
      </span>

      {/* ── Card + branches (right of spine) ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Clickable card */}
        <div
          className="node-main"
          role="button"
          tabIndex={0}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            padding: '0.875rem 1rem',
            borderRadius: '0.875rem',
            border: `3px solid ${cardBorderColor}`,
            background: cardBg,
            boxShadow: cardShadow,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            userSelect: 'none',
          }}
        >
          {/* Content */}
          <div className="node-content" style={{ flex: 1, minWidth: 0 }}>
            <span
              className="node-era"
              style={{
                display: 'block',
                fontSize: '0.6rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'rgba(26,26,46,0.38)',
                marginBottom: '0.2rem',
              }}
            >
              {event.era}
            </span>

            <h3
              className="node-title"
              style={{
                fontFamily: "'Fredoka One', cursive",
                fontSize: '1.05rem',
                fontWeight: 900,
                color: '#1A1A2E',
                margin: '0 0 0.5rem',
                lineHeight: 1.2,
              }}
            >
              {event.title}
            </h3>

            {/* Tag chips */}
            <ul
              className="node-tags"
              aria-label="Topics covered"
              style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', margin: 0, padding: 0, listStyle: 'none' }}
            >
              {event.tags.map((tag) => (
                <li
                  key={tag}
                  className="node-tag"
                  data-tag={tag}
                  style={{
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    padding: '0.125rem 0.45rem',
                    borderRadius: '9999px',
                    border: '1.5px solid rgba(26,26,46,0.18)',
                    color: 'rgba(26,26,46,0.55)',
                    background: 'rgba(26,26,46,0.04)',
                    lineHeight: 1.6,
                  }}
                >
                  {tag}
                </li>
              ))}
            </ul>

            {/*
             * Short description — hover preview.
             * data-preview-state is the GSAP animation hook.
             * max-height trick gives a smooth CSS fallback while you add GSAP.
             */}
            <p
              className="node-short-desc"
              data-preview-state={isHovered && !isActive ? 'visible' : 'hidden'}
              aria-hidden={!(isHovered && !isActive)}
              style={{
                fontSize: '0.75rem',
                color: 'rgba(26,26,46,0.6)',
                lineHeight: 1.55,
                margin: isHovered && !isActive ? '0.5rem 0 0' : '0',
                maxHeight: isHovered && !isActive ? '6rem' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.25s ease, margin 0.25s ease',
              }}
            >
              {event.shortDesc}
            </p>
          </div>

          {/* Expand / collapse chevron */}
          <span
            className="node-expand-indicator"
            aria-hidden="true"
            data-active={String(isActive)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '1.5rem',
              height: '1.5rem',
              borderRadius: '50%',
              border: `2px solid ${isActive ? '#FF6B35' : 'rgba(26,26,46,0.2)'}`,
              background: isActive ? '#FF6B35' : 'transparent',
              color: isActive ? '#ffffff' : 'rgba(26,26,46,0.4)',
              fontSize: '0.7rem',
              flexShrink: 0,
              transform: isActive ? 'rotate(180deg)' : 'none',
              transition: 'all 0.25s ease',
            }}
          >
            ↓
          </span>
        </div>

        {/*
         * Mind-map branches — conditionally mounted when active.
         * Wrap in AnimatePresence (Framer) or GSAP useLayoutEffect for entrance.
         */}
        {isActive && <NodeBranches event={event} parentNodeRef={nodeRef} />}
      </div>
    </article>
  )
}
