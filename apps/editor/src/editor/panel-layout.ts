import { reactive, watch } from 'vue'

export type PanelId = 'settings' | 'entities' | 'animations' | 'environment' | 'simulation' | 'debug' | 'diagnostics'

export interface PanelState {
  x: number
  y: number
  width: number
  height: number
  hasAutomaticHeight: boolean
  isCollapsed: boolean
  isVisible: boolean
  z: number
}

export type PanelLayout = Record<PanelId, PanelState>

const STORAGE_KEY = 'luz.editor.layout'
const MINIMUM_WIDTH = 280
const MINIMUM_HEIGHT = 160
const HEADER_HEIGHT = 42
const HORIZONTAL_EDGE_MARGIN = 10
const VERTICAL_EDGE_MARGIN = 8
const RIGHT_PANEL_WIDTH = 340
const PANEL_STACK_GAP = 16
const PANEL_GAP = 8

type PanelRectangle = Pick<PanelState, 'x' | 'y' | 'width' | 'height' | 'isCollapsed'>

const calculateVisibleHeight = (panel: PanelRectangle) => (panel.isCollapsed ? HEADER_HEIGHT : panel.height)

export const doPanelsOverlap = (firstPanel: PanelRectangle, secondPanel: PanelRectangle, gap = PANEL_GAP): boolean =>
  firstPanel.x < secondPanel.x + secondPanel.width + gap &&
  firstPanel.x + firstPanel.width + gap > secondPanel.x &&
  firstPanel.y < secondPanel.y + calculateVisibleHeight(secondPanel) + gap &&
  firstPanel.y + calculateVisibleHeight(firstPanel) + gap > secondPanel.y

export const placePanelWithoutOverlap = (
  panel: PanelState,
  occupiedPanels: PanelState[],
  viewportWidth = window.innerWidth,
  viewportHeight = window.innerHeight
): PanelState => {
  const preferredPanel = clampPanel(panel, viewportWidth, viewportHeight)

  if (!occupiedPanels.some((occupied) => doPanelsOverlap(preferredPanel, occupied))) {
    return preferredPanel
  }

  const maximumX = Math.max(HORIZONTAL_EDGE_MARGIN, viewportWidth - preferredPanel.width - HORIZONTAL_EDGE_MARGIN)
  const maximumY = Math.max(58, viewportHeight - calculateVisibleHeight(preferredPanel) - VERTICAL_EDGE_MARGIN)
  const xPositions = new Set([preferredPanel.x, HORIZONTAL_EDGE_MARGIN, maximumX])
  const yPositions = new Set([preferredPanel.y, 58, maximumY])

  occupiedPanels.forEach((occupied) => {
    xPositions.add(occupied.x + occupied.width + PANEL_GAP)
    xPositions.add(occupied.x - preferredPanel.width - PANEL_GAP)
    yPositions.add(occupied.y + calculateVisibleHeight(occupied) + PANEL_GAP)
    yPositions.add(occupied.y - calculateVisibleHeight(preferredPanel) - PANEL_GAP)
  })

  const candidates = Array.from(xPositions)
    .flatMap((x) =>
      Array.from(yPositions).map((y) => ({
        ...preferredPanel,
        x: Math.min(Math.max(HORIZONTAL_EDGE_MARGIN, x), maximumX),
        y: Math.min(Math.max(58, y), maximumY)
      }))
    )
    .sort(
      (firstCandidate, secondCandidate) =>
        Math.hypot(firstCandidate.x - preferredPanel.x, firstCandidate.y - preferredPanel.y) -
        Math.hypot(secondCandidate.x - preferredPanel.x, secondCandidate.y - preferredPanel.y)
    )

  return (
    candidates.find((candidate) => !occupiedPanels.some((occupied) => doPanelsOverlap(candidate, occupied))) ??
    preferredPanel
  )
}

export const createDefaultPanelLayout = (
  viewportWidth = window.innerWidth,
  viewportHeight = window.innerHeight
): PanelLayout => {
  const environmentHeight = 238
  const entitiesHeight = Math.max(
    MINIMUM_HEIGHT,
    Math.min(280, viewportHeight - 58 - PANEL_STACK_GAP * 2 - environmentHeight - MINIMUM_HEIGHT - VERTICAL_EDGE_MARGIN)
  )
  const calculateRightPanelX = (width: number) =>
    Math.max(HORIZONTAL_EDGE_MARGIN, viewportWidth - width - HORIZONTAL_EDGE_MARGIN)

  return {
    settings: {
      x: calculateRightPanelX(360),
      y: 58,
      width: 360,
      height: Math.max(MINIMUM_HEIGHT, Math.min(720, viewportHeight - 74)),
      hasAutomaticHeight: true,
      isCollapsed: false,
      isVisible: true,
      z: 4
    },
    entities: {
      x: HORIZONTAL_EDGE_MARGIN,
      y: 58,
      width: RIGHT_PANEL_WIDTH,
      height: entitiesHeight,
      hasAutomaticHeight: false,
      isCollapsed: false,
      isVisible: true,
      z: 1
    },
    animations: {
      x: HORIZONTAL_EDGE_MARGIN + RIGHT_PANEL_WIDTH + PANEL_GAP,
      y: 58,
      width: RIGHT_PANEL_WIDTH,
      height: Math.max(MINIMUM_HEIGHT, Math.min(520, viewportHeight - 74)),
      hasAutomaticHeight: false,
      isCollapsed: false,
      isVisible: false,
      z: 7
    },
    environment: {
      x: HORIZONTAL_EDGE_MARGIN,
      y: 58 + entitiesHeight + PANEL_STACK_GAP,
      width: RIGHT_PANEL_WIDTH,
      height: environmentHeight,
      hasAutomaticHeight: true,
      isCollapsed: false,
      isVisible: true,
      z: 2
    },
    simulation: {
      x: HORIZONTAL_EDGE_MARGIN,
      y: 58 + entitiesHeight + PANEL_STACK_GAP * 2 + environmentHeight,
      width: RIGHT_PANEL_WIDTH,
      height: MINIMUM_HEIGHT,
      hasAutomaticHeight: true,
      isCollapsed: false,
      isVisible: true,
      z: 3
    },
    debug: {
      x: calculateRightPanelX(RIGHT_PANEL_WIDTH),
      y: 58,
      width: RIGHT_PANEL_WIDTH,
      height: Math.max(MINIMUM_HEIGHT, Math.min(380, viewportHeight - 74)),
      hasAutomaticHeight: true,
      isCollapsed: false,
      isVisible: false,
      z: 5
    },
    diagnostics: {
      x: calculateRightPanelX(RIGHT_PANEL_WIDTH),
      y: Math.max(58, viewportHeight - 438),
      width: RIGHT_PANEL_WIDTH,
      height: Math.max(MINIMUM_HEIGHT, Math.min(380, viewportHeight - 74)),
      hasAutomaticHeight: true,
      isCollapsed: false,
      isVisible: false,
      z: 6
    }
  }
}

const resolveFiniteValue = (value: unknown, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

export const clampPanel = (
  panel: PanelState,
  viewportWidth = window.innerWidth,
  viewportHeight = window.innerHeight,
  renderedHeight?: number
): PanelState => {
  const availableWidth = Math.max(1, viewportWidth - HORIZONTAL_EDGE_MARGIN * 2)
  const availableHeight = Math.max(HEADER_HEIGHT, viewportHeight - 58 - VERTICAL_EDGE_MARGIN)
  const minimumWidth = Math.min(MINIMUM_WIDTH, availableWidth)
  const minimumHeight = Math.min(MINIMUM_HEIGHT, availableHeight)
  const width = Math.min(Math.max(minimumWidth, resolveFiniteValue(panel.width, minimumWidth)), availableWidth)
  const height = Math.min(Math.max(minimumHeight, resolveFiniteValue(panel.height, minimumHeight)), availableHeight)
  const maximumX = Math.max(HORIZONTAL_EDGE_MARGIN, viewportWidth - width - HORIZONTAL_EDGE_MARGIN)
  const clampedHeight = panel.isCollapsed
    ? HEADER_HEIGHT
    : panel.hasAutomaticHeight && renderedHeight !== undefined
      ? Math.min(Math.max(HEADER_HEIGHT, resolveFiniteValue(renderedHeight, height)), availableHeight)
      : height
  const maximumY = Math.max(58, viewportHeight - clampedHeight - VERTICAL_EDGE_MARGIN)

  return {
    x: Math.min(Math.max(HORIZONTAL_EDGE_MARGIN, resolveFiniteValue(panel.x, HORIZONTAL_EDGE_MARGIN)), maximumX),
    y: Math.min(Math.max(58, resolveFiniteValue(panel.y, 58)), maximumY),
    width,
    height,
    hasAutomaticHeight: typeof panel.hasAutomaticHeight === 'boolean' ? panel.hasAutomaticHeight : true,
    isCollapsed: typeof panel.isCollapsed === 'boolean' ? panel.isCollapsed : false,
    isVisible: typeof panel.isVisible === 'boolean' ? panel.isVisible : true,
    z: Math.max(1, Math.round(resolveFiniteValue(panel.z, 1)))
  }
}

export const parsePanelLayout = (
  serialized: string | null,
  viewportWidth = window.innerWidth,
  viewportHeight = window.innerHeight
): PanelLayout => {
  const defaults = createDefaultPanelLayout(viewportWidth, viewportHeight)

  if (!serialized) {
    return defaults
  }

  try {
    const parsed = JSON.parse(serialized) as Partial<PanelLayout> | null

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return defaults
    }

    const panels = Object.fromEntries(
      (Object.keys(defaults) as PanelId[]).map((id) => [
        id,
        clampPanel(
          { ...defaults[id], ...(parsed[id] ?? {}), ...(id === 'entities' ? { hasAutomaticHeight: false } : {}) },
          viewportWidth,
          viewportHeight
        )
      ])
    ) as PanelLayout
    const ids = Object.keys(defaults) as PanelId[]
    const occupied = ids.filter((id) => parsed[id] && panels[id].isVisible).map((id) => panels[id])

    for (const id of ids) {
      if (parsed[id] || !panels[id].isVisible) {
        continue
      }

      panels[id] = placePanelWithoutOverlap(panels[id], occupied, viewportWidth, viewportHeight)

      occupied.push(panels[id])
    }

    return panels
  } catch {
    return defaults
  }
}

export const createPanelLayout = () => {
  const panels = reactive<PanelLayout>(parsePanelLayout(localStorage.getItem(STORAGE_KEY)))

  const persist = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(panels))

  persist()
  watch(panels, persist, { deep: true })

  const bringToFront = (id: PanelId) => {
    panels[id].z = Math.max(...Object.values(panels).map(({ z }) => z)) + 1
  }

  const move = (id: PanelId, x: number, y: number, renderedHeight?: number) => {
    Object.assign(
      panels[id],
      clampPanel({ ...panels[id], x, y }, window.innerWidth, window.innerHeight, renderedHeight)
    )
  }

  const resize = (id: PanelId, width: number, height: number, isHeightResizeEnabled = false) => {
    const maximumWidth = Math.max(1, window.innerWidth - panels[id].x - HORIZONTAL_EDGE_MARGIN)
    const maximumHeight = Math.max(HEADER_HEIGHT, window.innerHeight - panels[id].y - VERTICAL_EDGE_MARGIN)

    Object.assign(
      panels[id],
      clampPanel({
        ...panels[id],
        width: Math.min(width, maximumWidth),
        height: Math.min(height, maximumHeight),
        hasAutomaticHeight: isHeightResizeEnabled ? false : panels[id].hasAutomaticHeight
      })
    )
  }

  const fitContent = (id: PanelId) => {
    panels[id].hasAutomaticHeight = true
  }

  const toggleCollapsed = (id: PanelId) => {
    panels[id].isCollapsed = !panels[id].isCollapsed

    bringToFront(id)
  }

  const setVisible = (id: PanelId, isVisible: boolean) => {
    if (isVisible && !panels[id].isVisible) {
      const occupiedPanels = (Object.keys(panels) as PanelId[])
        .filter((candidateId) => candidateId !== id && panels[candidateId].isVisible)
        .map((candidateId) => panels[candidateId])

      Object.assign(panels[id], placePanelWithoutOverlap(panels[id], occupiedPanels))
    }

    panels[id].isVisible = isVisible

    if (isVisible) {
      bringToFront(id)
    }
  }

  const clampAll = () => {
    ;(Object.keys(panels) as PanelId[]).forEach((id) => Object.assign(panels[id], clampPanel(panels[id])))
  }

  const reset = () => {
    const defaults = createDefaultPanelLayout()

    ;(Object.keys(defaults) as PanelId[]).forEach((id) => Object.assign(panels[id], defaults[id]))
  }

  return { panels, bringToFront, move, resize, fitContent, toggleCollapsed, setVisible, clampAll, reset }
}
