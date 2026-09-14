// ─── Data shape ───────────────────────────────────────────────────────────────

export interface NotableWork {
  title: string
  year: number
  medium: 'painting' | 'novel' | 'poem' | 'film' | 'play' | 'sculpture' | 'architecture' | 'other'
}

export interface Figure {
  id: string
  name: string
  born: number
  died?: number
  role: string
  notableWorks: NotableWork[]
  /** ids of other figures this person cross-connects to */
  connections?: string[]
}

export interface SubNode {
  id: string
  type: 'movement' | 'event' | 'battle' | 'faction' | 'figure'
  label: string
  year?: number
  description: string
  /** Layout hint — which side of the timeline axis this branch extends to */
  branchSide?: 'left' | 'right'
  figures: Figure[]
}

export interface TimelineEvent {
  id: string
  year: number
  era: string
  title: string
  shortDesc: string
  fullDesc: string
  tags: string[]
  subNodes: SubNode[]
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface TimelineState {
  /** ID of the main node currently expanded into mind-map mode */
  activeNodeId: string | null
  /** ID of the main node currently hovered (preview state) */
  hoveredNodeId: string | null
  /** ID of the sub-node whose figure leaves are currently shown */
  activeSubNodeId: string | null
  /** ID of the sub-node currently hovered */
  hoveredSubNodeId: string | null
}

export type TimelineAction =
  | { type: 'NODE_HOVER_ENTER'; nodeId: string }
  | { type: 'NODE_HOVER_LEAVE' }
  | { type: 'NODE_CLICK'; nodeId: string }
  | { type: 'SUBNODE_HOVER_ENTER'; subNodeId: string }
  | { type: 'SUBNODE_HOVER_LEAVE' }
  | { type: 'SUBNODE_CLICK'; subNodeId: string }
  | { type: 'CLOSE_ALL' }
