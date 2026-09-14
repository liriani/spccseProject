import { type Figure } from './types'

// ── Medium → emoji ───────────────────────────────────────────────────────────

const MEDIUM_EMOJI: Record<string, string> = {
  painting:     '🎨',
  novel:        '📖',
  poem:         '✍️',
  film:         '🎬',
  play:         '🎭',
  sculpture:    '🗿',
  architecture: '🏛️',
  other:        '📝',
}

// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  figure: Figure
  parentSubNodeId: string
  accentColor?: string
}

export function FigureLeaf({ figure, parentSubNodeId, accentColor = '#FF6B35' }: Props) {
  return (
    /*
     * figure-card
     *   data-figure-id        — stable id for GSAP targeting / cross-connection lines
     *   data-parent-subnode   — which sub-node this leaf belongs to
     *   data-connections      — comma-separated ids this figure connects to
     */
    <article
      className="figure-card"
      data-figure-id={figure.id}
      data-parent-subnode={parentSubNodeId}
      data-connections={figure.connections?.join(',') ?? ''}
      style={{
        padding: '0.625rem 0.75rem',
        borderRadius: '0.625rem',
        border: '2px solid rgba(26,26,46,0.1)',
        background: '#FFFBF0',
        borderLeft: `3px solid ${accentColor}`,
      }}
    >
      {/* ── Header: name, role, dates ── */}
      <header className="figure-header" style={{ marginBottom: '0.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
          <h5
            className="figure-name"
            style={{
              fontFamily: "'Fredoka One', cursive",
              fontSize: '0.82rem',
              fontWeight: 900,
              color: '#1A1A2E',
              margin: 0,
            }}
          >
            {figure.name}
          </h5>
          <span
            className="figure-dates"
            style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(26,26,46,0.35)' }}
          >
            {figure.born}{figure.died !== undefined ? `–${figure.died}` : '–'}
          </span>
        </div>
        <span
          className="figure-role"
          style={{
            display: 'inline-block',
            marginTop: '0.15rem',
            fontSize: '0.6rem',
            fontWeight: 700,
            color: accentColor,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {figure.role}
        </span>
      </header>

      {/* ── Notable works ── */}
      {figure.notableWorks.length > 0 && (
        <section className="figure-works" aria-label={`Notable works by ${figure.name}`}>
          <h6
            className="figure-works-heading"
            style={{
              fontSize: '0.55rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'rgba(26,26,46,0.35)',
              margin: '0 0 0.3rem',
            }}
          >
            Obras destacadas
          </h6>
          <ul className="works-list" style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {figure.notableWorks.map((work, i) => (
              /*
               * work-item
               *   data-medium — drives medium-specific icon / colour swatch for GSAP
               */
              <li
                key={i}
                className="work-item"
                data-medium={work.medium}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <span style={{ fontSize: '0.7rem', lineHeight: 1, flexShrink: 0 }}>
                  {MEDIUM_EMOJI[work.medium] ?? '📝'}
                </span>
                <span
                  className="work-title"
                  style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1A1A2E', flex: 1, minWidth: 0 }}
                >
                  {work.title}
                </span>
                <time
                  className="work-year"
                  dateTime={String(work.year)}
                  style={{ fontSize: '0.6rem', color: 'rgba(26,26,46,0.38)', flexShrink: 0 }}
                >
                  {work.year}
                </time>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/*
       * Connection chips — hover these to trigger GSAP lines between figure-cards:
       *   const target = document.querySelector(`[data-figure-id="${id}"]`)
       */}
      {figure.connections && figure.connections.length > 0 && (
        <footer className="figure-connections" style={{ marginTop: '0.4rem' }}>
          <span
            className="figure-connections-label"
            style={{ fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(26,26,46,0.35)', marginRight: '0.3rem' }}
          >
            Conexiones
          </span>
          <ul
            className="figure-connections-list"
            aria-label={`Connections for ${figure.name}`}
            style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.25rem', margin: 0, padding: 0, listStyle: 'none' }}
          >
            {figure.connections.map((id) => (
              <li key={id}>
                <span
                  className="figure-connection-chip"
                  data-connects-to={id}
                  role="note"
                  aria-label={`Connected to ${id}`}
                  style={{
                    display: 'inline-block',
                    fontSize: '0.58rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.4rem',
                    borderRadius: '9999px',
                    border: '1.5px solid #1CB0F630',
                    background: '#1CB0F610',
                    color: '#1CB0F6',
                    cursor: 'default',
                  }}
                >
                  {id}
                </span>
              </li>
            ))}
          </ul>
        </footer>
      )}
    </article>
  )
}
