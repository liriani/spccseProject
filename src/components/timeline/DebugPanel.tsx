/**
 * DebugPanel — drop inside <TimelineMindMap> to observe raw state.
 *
 *   <TimelineMindMap>
 *     <DebugPanel />
 *   </TimelineMindMap>
 *
 * Remove before shipping; it has no production value.
 */

import { useTimeline } from './TimelineMindMap'

// ─── Tiny inline styles kept as constants so there is zero CSS dependency ────

const PANEL: React.CSSProperties = {
  position: 'fixed',
  bottom: 16,
  right: 16,
  zIndex: 9999,
  background: '#0d0d0d',
  color: '#e5e5e5',
  fontFamily: 'monospace',
  fontSize: 12,
  lineHeight: 1.5,
  padding: '12px 16px',
  borderRadius: 6,
  border: '1px solid #333',
  maxWidth: 340,
  pointerEvents: 'none',
  userSelect: 'none',
}

const HEADING: React.CSSProperties = {
  margin: '0 0 8px',
  fontSize: 10,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#888',
}

const PRE: React.CSSProperties = {
  margin: 0,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
}

const DIVIDER: React.CSSProperties = {
  border: 'none',
  borderTop: '1px solid #333',
  margin: '8px 0',
}

const ROW: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 8,
}

const LABEL: React.CSSProperties = { color: '#888' }

const VALUE_ACTIVE: React.CSSProperties = { color: '#4ade80' }   // green
const VALUE_HOVER: React.CSSProperties  = { color: '#facc15' }   // yellow
const VALUE_NONE: React.CSSProperties   = { color: '#555' }

// ─── Component ───────────────────────────────────────────────────────────────

export function DebugPanel() {
  const { state, data } = useTimeline()

  // Resolve human-readable labels from ids
  const activeEvent   = data.find(e => e.id === state.activeNodeId)
  const hoveredEvent  = data.find(e => e.id === state.hoveredNodeId)
  const activeSubNode = activeEvent?.subNodes.find(s => s.id === state.activeSubNodeId)

  const isExpanded = state.activeNodeId !== null

  return (
    <aside style={PANEL} aria-label="Timeline state debugger" data-debug-panel>

      {/* ── Header ── */}
      <p style={HEADING}>⬡ Timeline Debug</p>

      {/* ── Raw state JSON ── */}
      <pre style={PRE} data-debug-raw-state>
        {JSON.stringify(state, null, 2)}
      </pre>

      <hr style={DIVIDER} />

      {/* ── Derived / readable values ── */}
      <div data-debug-derived>

        <DerivedRow
          label="isExpanded"
          value={String(isExpanded)}
          style={isExpanded ? VALUE_ACTIVE : VALUE_NONE}
          dataAttr="data-debug-is-expanded"
        />

        <DerivedRow
          label="activeNode"
          value={activeEvent ? `${activeEvent.year} — ${activeEvent.title}` : 'null'}
          style={activeEvent ? VALUE_ACTIVE : VALUE_NONE}
          dataAttr="data-debug-active-node"
        />

        <DerivedRow
          label="hoveredNode"
          value={hoveredEvent ? hoveredEvent.title : 'null'}
          style={hoveredEvent ? VALUE_HOVER : VALUE_NONE}
          dataAttr="data-debug-hovered-node"
        />

        <DerivedRow
          label="activeSubNode"
          value={activeSubNode?.label ?? 'null'}
          style={activeSubNode ? VALUE_ACTIVE : VALUE_NONE}
          dataAttr="data-debug-active-subnode"
        />

        <DerivedRow
          label="hoveredSubNode"
          value={state.hoveredSubNodeId ?? 'null'}
          style={state.hoveredSubNodeId ? VALUE_HOVER : VALUE_NONE}
          dataAttr="data-debug-hovered-subnode"
        />

      </div>
    </aside>
  )
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function DerivedRow({
  label,
  value,
  style,
  dataAttr,
}: {
  label: string
  value: string
  style: React.CSSProperties
  dataAttr: string
}) {
  return (
    <div style={ROW} {...{ [dataAttr]: value }}>
      <span style={LABEL}>{label}</span>
      <span style={style}>{value}</span>
    </div>
  )
}
