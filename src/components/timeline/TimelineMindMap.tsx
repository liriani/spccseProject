import {
  useReducer,
  createContext,
  useContext,
  useCallback,
  type ReactNode,
} from 'react'
import { type TimelineState, type TimelineAction, type TimelineEvent } from './types'
import { SPAIN_HISTORY } from './spainHistory.data'
import { TimelineNode } from './TimelineNode'

// ─── Context ──────────────────────────────────────────────────────────────────

interface TimelineContextValue {
  state: TimelineState
  dispatch: React.Dispatch<TimelineAction>
  data: TimelineEvent[]
}

const TimelineContext = createContext<TimelineContextValue | null>(null)

export function useTimeline(): TimelineContextValue {
  const ctx = useContext(TimelineContext)
  if (!ctx) throw new Error('useTimeline must be used inside <TimelineMindMap />')
  return ctx
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

const initialState: TimelineState = {
  activeNodeId: null,
  hoveredNodeId: null,
  activeSubNodeId: null,
  hoveredSubNodeId: null,
}

function timelineReducer(state: TimelineState, action: TimelineAction): TimelineState {
  switch (action.type) {
    case 'NODE_HOVER_ENTER':
      return { ...state, hoveredNodeId: action.nodeId }

    case 'NODE_HOVER_LEAVE':
      return { ...state, hoveredNodeId: null }

    case 'NODE_CLICK':
      if (state.activeNodeId === action.nodeId) {
        return { ...initialState }
      }
      return {
        ...state,
        activeNodeId: action.nodeId,
        activeSubNodeId: null,
        hoveredSubNodeId: null,
      }

    case 'SUBNODE_HOVER_ENTER':
      return { ...state, hoveredSubNodeId: action.subNodeId }

    case 'SUBNODE_HOVER_LEAVE':
      return { ...state, hoveredSubNodeId: null }

    case 'SUBNODE_CLICK':
      return {
        ...state,
        activeSubNodeId: state.activeSubNodeId === action.subNodeId ? null : action.subNodeId,
      }

    case 'CLOSE_ALL':
      return { ...initialState }

    default:
      return state
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────

function TimelineProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(timelineReducer, initialState)

  return (
    <TimelineContext.Provider value={{ state, dispatch, data: SPAIN_HISTORY }}>
      {children}
    </TimelineContext.Provider>
  )
}

// ─── Root Component ───────────────────────────────────────────────────────────

export function TimelineMindMap({ children }: { children?: ReactNode }) {
  return (
    <TimelineProvider>
      <TimelineMindMapInner />
      {children}
    </TimelineProvider>
  )
}

function TimelineMindMapInner() {
  const { state, dispatch } = useTimeline()

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement
      if (!target.closest('.timeline-node')) {
        dispatch({ type: 'CLOSE_ALL' })
      }
    },
    [dispatch],
  )

  return (
    <div
      className="timeline-container"
      data-active-node={state.activeNodeId ?? ''}
      onClick={handleBackdropClick}
      style={{ background: '#FFFBF0', minHeight: '100vh', paddingBottom: '6rem' }}
    >
      {/* ── Header ── */}
      <div
        style={{
          borderBottom: '4px solid #1A1A2E',
          padding: '2rem 1.5rem 1.5rem',
          marginBottom: '0',
          background: '#1A1A2E',
        }}
      >
        <div style={{ maxWidth: '38rem', margin: '0 auto' }}>
          <span style={{
            display: 'inline-block',
            fontSize: '0.625rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: '#FF6B35',
            marginBottom: '0.5rem',
          }}>
            Módulo Cultura
          </span>
          <h2 style={{
            fontFamily: "'Fredoka One', cursive",
            fontSize: '1.75rem',
            fontWeight: 900,
            color: '#FFFBF0',
            lineHeight: 1.1,
            margin: 0,
          }}>
            Historia y Cultura de España
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,251,240,0.5)', marginTop: '0.5rem', marginBottom: 0 }}>
            Haz clic en un evento para explorar el mapa conceptual
          </p>
        </div>
      </div>

      {/* ── Timeline track ── */}
      <div
        style={{
          maxWidth: '38rem',
          margin: '0 auto',
          padding: '2.5rem 1.5rem 1rem',
          position: 'relative',
        }}
      >
        {/*
         * Vertical spine — sits behind the dots.
         * Left position = left padding (1.5rem) + year col (4rem) + gap (1rem) + half dot (0.4375rem)
         * ≈ 7rem from the container left edge.
         */}
        <div
          className="timeline-axis"
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 'calc(1.5rem + 4rem + 1rem + 0.4375rem)',
            top: '2.5rem',
            bottom: '1rem',
            width: '3px',
            background: 'linear-gradient(to bottom, #FF6B35, rgba(26,26,46,0.15) 60%, transparent)',
            borderRadius: '9999px',
          }}
        />

        <div className="timeline-track" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {SPAIN_HISTORY.map((event, index) => {
            const isActive = state.activeNodeId === event.id
            const isHovered = state.hoveredNodeId === event.id
            const isDimmed = state.activeNodeId !== null && !isActive

            return (
              <TimelineNode
                key={event.id}
                event={event}
                index={index}
                isActive={isActive}
                isHovered={isHovered}
                isDimmed={isDimmed}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
