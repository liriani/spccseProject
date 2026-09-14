import { type RefObject } from 'react'
import { type TimelineEvent } from './types'
import { useTimeline } from './TimelineMindMap'
import { SubNode } from './SubNode'

interface Props {
  event: TimelineEvent
  parentNodeRef: RefObject<HTMLElement | null>
}

export function NodeBranches({ event, parentNodeRef: _ }: Props) {
  const { state } = useTimeline()

  return (
    /*
     * branches-container
     *   data-parent-id — lets you query all branches for a given node:
     *     document.querySelectorAll('[data-parent-id="guerra-civil"]')
     */
    <div
      className="branches-container"
      data-parent-id={event.id}
      role="region"
      aria-label={`Detail for ${event.title}`}
      style={{ marginTop: '0.75rem' }}
    >
      {/* ── Full-text deep dive ── */}
      <div
        className="expanded-content"
        style={{
          padding: '0.875rem 1rem',
          marginBottom: '0.875rem',
          background: 'rgba(255,107,53,0.05)',
          border: '2px solid rgba(255,107,53,0.25)',
          borderRadius: '0.75rem',
          borderLeft: '4px solid #FF6B35',
        }}
      >
        <p
          className="expanded-full-desc"
          style={{
            fontSize: '0.78rem',
            color: 'rgba(26,26,46,0.68)',
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          {event.fullDesc}
        </p>
      </div>

      {/*
       * branches-layout
       * data-branch-count tells GSAP how many children to stagger.
       * Sub-nodes stack to a 2-col grid when space allows.
       */}
      <div
        className="branches-layout"
        data-branch-count={event.subNodes.length}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '0.625rem',
        }}
      >
        {event.subNodes.map((subNode, index) => {
          const branchSide = subNode.branchSide ?? (index % 2 === 0 ? 'left' : 'right')

          return (
            <SubNode
              key={subNode.id}
              subNode={{ ...subNode, branchSide }}
              branchIndex={index}
              totalBranches={event.subNodes.length}
              parentId={event.id}
              isActive={state.activeSubNodeId === subNode.id}
              isHovered={state.hoveredSubNodeId === subNode.id}
            />
          )
        })}
      </div>
    </div>
  )
}
