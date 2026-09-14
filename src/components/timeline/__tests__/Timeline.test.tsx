import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { TimelineMindMap } from '../TimelineMindMap'
import { SPAIN_HISTORY } from '../spainHistory.data'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the div[role="button"] (.node-main) for a given event title.
 * Uses the h3 title text — always visible, not aria-hidden.
 */
function getMainNodeButton(title: string) {
  return screen.getByRole('button', { name: new RegExp(title) })
}

/**
 * Returns the <article> wrapping a main node.
 * We identify it by its data-node-id attribute.
 */
function getArticle(nodeId: string): HTMLElement {
  const el = document.querySelector(`[data-node-id="${nodeId}"]`)
  if (!el) throw new Error(`No article found for node id: ${nodeId}`)
  return el as HTMLElement
}

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('TimelineMindMap — rendering', () => {
  it('renders every main historical node from SPAIN_HISTORY', () => {
    render(<TimelineMindMap />)

    for (const event of SPAIN_HISTORY) {
      // Each title is in an <h3 class="node-title">
      expect(screen.getByText(event.title)).toBeInTheDocument()
      // Each year is in a <time> element
      expect(screen.getByText(event.year.toString())).toBeInTheDocument()
    }
  })

  it('renders the correct number of interactive node buttons', () => {
    render(<TimelineMindMap />)

    // One div[role="button"] per main node — sub-nodes are not mounted yet
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(SPAIN_HISTORY.length)
  })

  it('all nodes start as not-active, not-hovered, not-dimmed', () => {
    render(<TimelineMindMap />)

    for (const event of SPAIN_HISTORY) {
      const article = getArticle(event.id)
      expect(article).toHaveAttribute('data-active', 'false')
      expect(article).toHaveAttribute('data-hovered', 'false')
      expect(article).toHaveAttribute('data-dimmed', 'false')
    }
  })

  it('renders the correct number of era labels', () => {
    render(<TimelineMindMap />)

    for (const event of SPAIN_HISTORY) {
      // Scope to the specific article so shared era strings (e.g. "Contemporary")
      // don't cause getByText to find multiple elements
      expect(within(getArticle(event.id)).getByText(event.era)).toBeInTheDocument()
    }
  })
})

// ─── Hover state ──────────────────────────────────────────────────────────────

describe('TimelineMindMap — hover state', () => {
  it('sets data-hovered="true" on the article when mouse enters the node button', () => {
    render(<TimelineMindMap />)

    const firstEvent = SPAIN_HISTORY[0]
    const button = getMainNodeButton(firstEvent.title)

    fireEvent.mouseEnter(button)

    expect(getArticle(firstEvent.id)).toHaveAttribute('data-hovered', 'true')
  })

  it('flips shortDesc data-preview-state to "visible" during hover', () => {
    render(<TimelineMindMap />)

    const firstEvent = SPAIN_HISTORY[0]
    const button = getMainNodeButton(firstEvent.title)

    // Before hover — shortDesc is in DOM but hidden from preview
    const shortDescEl = screen.getByText(firstEvent.shortDesc)
    expect(shortDescEl).toHaveAttribute('data-preview-state', 'hidden')

    fireEvent.mouseEnter(button)

    expect(shortDescEl).toHaveAttribute('data-preview-state', 'visible')
  })

  it('clears hover state when mouse leaves', () => {
    render(<TimelineMindMap />)

    const firstEvent = SPAIN_HISTORY[0]
    const button = getMainNodeButton(firstEvent.title)

    fireEvent.mouseEnter(button)
    fireEvent.mouseLeave(button)

    expect(getArticle(firstEvent.id)).toHaveAttribute('data-hovered', 'false')
    expect(screen.getByText(firstEvent.shortDesc)).toHaveAttribute(
      'data-preview-state',
      'hidden',
    )
  })

  it('only one node is hovered at a time', () => {
    render(<TimelineMindMap />)

    const [first, second] = SPAIN_HISTORY

    fireEvent.mouseEnter(getMainNodeButton(first.title))
    fireEvent.mouseLeave(getMainNodeButton(first.title))
    fireEvent.mouseEnter(getMainNodeButton(second.title))

    expect(getArticle(first.id)).toHaveAttribute('data-hovered', 'false')
    expect(getArticle(second.id)).toHaveAttribute('data-hovered', 'true')
  })

  it('suppresses shortDesc preview while the node is expanded (active)', () => {
    render(<TimelineMindMap />)

    const firstEvent = SPAIN_HISTORY[0]
    const button = getMainNodeButton(firstEvent.title)

    // Expand the node first, then hover over it
    fireEvent.click(button)
    fireEvent.mouseEnter(button)

    // isActive=true → shortDesc stays hidden even while hovered
    expect(screen.getByText(firstEvent.shortDesc)).toHaveAttribute(
      'data-preview-state',
      'hidden',
    )
  })
})

// ─── Click / expand state ─────────────────────────────────────────────────────

describe('TimelineMindMap — click / expand state', () => {
  it('sets data-active="true" and aria-expanded on click', () => {
    render(<TimelineMindMap />)

    const firstEvent = SPAIN_HISTORY[0]
    const button = getMainNodeButton(firstEvent.title)

    fireEvent.click(button)

    const article = getArticle(firstEvent.id)
    expect(article).toHaveAttribute('data-active', 'true')
    expect(article).toHaveAttribute('aria-expanded', 'true')
  })

  it('mounts the expanded-content block with fullDesc on click', () => {
    render(<TimelineMindMap />)

    const firstEvent = SPAIN_HISTORY[0]

    // fullDesc is NOT in the DOM before expansion
    expect(screen.queryByText(firstEvent.fullDesc)).not.toBeInTheDocument()

    fireEvent.click(getMainNodeButton(firstEvent.title))

    expect(screen.getByText(firstEvent.fullDesc)).toBeInTheDocument()
  })

  it('mounts all sub-node cards for the clicked node', () => {
    render(<TimelineMindMap />)

    // Use the 'Guerra Civil' event because it has 4 sub-nodes — good coverage
    const civilWar = SPAIN_HISTORY.find(e => e.id === 'guerra-civil')!

    fireEvent.click(getMainNodeButton(civilWar.title))

    for (const subNode of civilWar.subNodes) {
      expect(screen.getByText(subNode.label)).toBeInTheDocument()
    }
  })

  it('collapses back to initial state when the same node is clicked twice', () => {
    render(<TimelineMindMap />)

    const firstEvent = SPAIN_HISTORY[0]
    const button = getMainNodeButton(firstEvent.title)

    fireEvent.click(button) // expand
    fireEvent.click(button) // collapse

    const article = getArticle(firstEvent.id)
    expect(article).toHaveAttribute('data-active', 'false')
    expect(screen.queryByText(firstEvent.fullDesc)).not.toBeInTheDocument()

    // Sub-nodes are also unmounted
    for (const sub of firstEvent.subNodes) {
      expect(screen.queryByText(sub.label)).not.toBeInTheDocument()
    }
  })

  it('dims all other nodes when one is expanded', () => {
    render(<TimelineMindMap />)

    const activeEvent = SPAIN_HISTORY[0]
    fireEvent.click(getMainNodeButton(activeEvent.title))

    // Every other node must be dimmed
    for (const event of SPAIN_HISTORY) {
      if (event.id === activeEvent.id) continue
      expect(getArticle(event.id)).toHaveAttribute('data-dimmed', 'true')
    }

    // The active node itself is not dimmed
    expect(getArticle(activeEvent.id)).toHaveAttribute('data-dimmed', 'false')
  })

  it('switches active node and clears dimming on the previous one', () => {
    render(<TimelineMindMap />)

    const [first, second] = SPAIN_HISTORY

    fireEvent.click(getMainNodeButton(first.title))
    expect(getArticle(first.id)).toHaveAttribute('data-active', 'true')

    fireEvent.click(getMainNodeButton(second.title))

    // First node is now inactive and dimmed
    expect(getArticle(first.id)).toHaveAttribute('data-active', 'false')
    expect(getArticle(first.id)).toHaveAttribute('data-dimmed', 'true')

    // Second node is now active
    expect(getArticle(second.id)).toHaveAttribute('data-active', 'true')
    expect(getArticle(second.id)).toHaveAttribute('data-dimmed', 'false')
  })

  it('resets sub-node selection when switching to a different main node', () => {
    render(<TimelineMindMap />)

    const civilWar = SPAIN_HISTORY.find(e => e.id === 'guerra-civil')!
    const gen27 = civilWar.subNodes.find(s => s.id === 'generacion-27')!

    // Expand main node and expand a sub-node
    fireEvent.click(getMainNodeButton(civilWar.title))
    fireEvent.click(screen.getByRole('button', { name: new RegExp(gen27.label) }))

    // Sub-node figures should be visible
    expect(screen.getByText(gen27.figures[0].name)).toBeInTheDocument()

    // Click a different main node — sub-node selection should reset
    const sigloDeOro = SPAIN_HISTORY.find(e => e.id === 'siglo-de-oro')!
    fireEvent.click(getMainNodeButton(sigloDeOro.title))

    // Gen27 figures must no longer be in the DOM
    expect(screen.queryByText(gen27.figures[0].name)).not.toBeInTheDocument()
  })
})

// ─── Sub-node expansion ───────────────────────────────────────────────────────

describe('TimelineMindMap — sub-node expansion', () => {
  beforeEach(() => {
    render(<TimelineMindMap />)
    // Expand 'guerra-civil' first — it has the richest sub-node data
    const civilWar = SPAIN_HISTORY.find(e => e.id === 'guerra-civil')!
    fireEvent.click(getMainNodeButton(civilWar.title))
  })

  it('mounts figure cards when a sub-node is clicked', () => {
    const civilWar = SPAIN_HISTORY.find(e => e.id === 'guerra-civil')!
    const gen27 = civilWar.subNodes.find(s => s.id === 'generacion-27')!

    const subNodeButton = screen.getByRole('button', { name: new RegExp(gen27.label) })
    fireEvent.click(subNodeButton)

    for (const figure of gen27.figures) {
      expect(screen.getByText(figure.name)).toBeInTheDocument()
    }
  })

  it('sets data-active on the sub-node card when clicked', () => {
    const civilWar = SPAIN_HISTORY.find(e => e.id === 'guerra-civil')!
    const gen27 = civilWar.subNodes.find(s => s.id === 'generacion-27')!

    const subNodeButton = screen.getByRole('button', { name: new RegExp(gen27.label) })
    fireEvent.click(subNodeButton)

    const wrapper = subNodeButton.closest('[data-subnode-id]')
    expect(wrapper).toHaveAttribute('data-active', 'true')
  })

  it('collapses sub-node figures when the same sub-node is clicked twice', () => {
    const civilWar = SPAIN_HISTORY.find(e => e.id === 'guerra-civil')!
    const gen27 = civilWar.subNodes.find(s => s.id === 'generacion-27')!

    const subNodeButton = screen.getByRole('button', { name: new RegExp(gen27.label) })
    fireEvent.click(subNodeButton) // expand
    fireEvent.click(subNodeButton) // collapse

    expect(screen.queryByText(gen27.figures[0].name)).not.toBeInTheDocument()
  })

  it('renders notable works for each figure', () => {
    const civilWar = SPAIN_HISTORY.find(e => e.id === 'guerra-civil')!
    const gen27 = civilWar.subNodes.find(s => s.id === 'generacion-27')!
    const lorca = gen27.figures.find(f => f.id === 'garcia-lorca')!

    fireEvent.click(screen.getByRole('button', { name: new RegExp(gen27.label) }))

    // Find Lorca's figure card
    const figureCard = document.querySelector('[data-figure-id="garcia-lorca"]')!

    for (const work of lorca.notableWorks) {
      expect(within(figureCard as HTMLElement).getByText(work.title)).toBeInTheDocument()
    }
  })

  it('renders data-connects-to attributes for cross-connected figures', () => {
    const civilWar = SPAIN_HISTORY.find(e => e.id === 'guerra-civil')!
    const surrealism = civilWar.subNodes.find(s => s.id === 'surrealismo-espanol')!

    fireEvent.click(screen.getByRole('button', { name: new RegExp(surrealism.label) }))

    // Dalí should have connection chips pointing to Lorca and Buñuel
    const daliCard = document.querySelector('[data-figure-id="dali"]')!
    expect(daliCard).toHaveAttribute('data-connections', expect.stringContaining('garcia-lorca'))
    expect(daliCard).toHaveAttribute('data-connections', expect.stringContaining('bunuel'))
  })

  it('sets hoveredSubNodeId on sub-node mouseEnter and clears on mouseLeave', () => {
    const civilWar = SPAIN_HISTORY.find(e => e.id === 'guerra-civil')!
    const gen27 = civilWar.subNodes.find(s => s.id === 'generacion-27')!

    const subNodeButton = screen.getByRole('button', { name: new RegExp(gen27.label) })
    const wrapper = subNodeButton.closest('[data-subnode-id]')!

    fireEvent.mouseEnter(subNodeButton)
    expect(wrapper).toHaveAttribute('data-hovered', 'true')

    fireEvent.mouseLeave(subNodeButton)
    expect(wrapper).toHaveAttribute('data-hovered', 'false')
  })
})

// ─── CLOSE_ALL via backdrop click ────────────────────────────────────────────

describe('TimelineMindMap — CLOSE_ALL', () => {
  it('collapses everything when clicking outside all timeline nodes', () => {
    const { container } = render(<TimelineMindMap />)

    const civilWar = SPAIN_HISTORY.find(e => e.id === 'guerra-civil')!
    fireEvent.click(getMainNodeButton(civilWar.title))

    expect(getArticle(civilWar.id)).toHaveAttribute('data-active', 'true')

    // Click the .timeline-container backdrop (not on any .timeline-node)
    const backdrop = container.querySelector('.timeline-container')!
    fireEvent.click(backdrop)

    // Everything should be reset
    expect(getArticle(civilWar.id)).toHaveAttribute('data-active', 'false')

    for (const event of SPAIN_HISTORY) {
      expect(getArticle(event.id)).toHaveAttribute('data-dimmed', 'false')
    }
  })
})
