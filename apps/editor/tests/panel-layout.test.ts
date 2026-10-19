import { beforeEach, describe, expect, it } from 'vitest'
import {
  clampPanel,
  createPanelLayout,
  createDefaultPanelLayout,
  doPanelsOverlap,
  parsePanelLayout,
  placePanelWithoutOverlap
} from '../src/editor/panel-layout'

describe('editor panel layout', () => {
  beforeEach(() => localStorage.clear())
  it('recovers from corrupt persisted state', () => {
    expect(parsePanelLayout('{nope', 1200, 800)).toEqual(createDefaultPanelLayout(1200, 800))
  })
  it('places the primary panels and hides secondary panels by default', () => {
    const panels = createDefaultPanelLayout(1200, 800)

    expect(panels.entities).toMatchObject({ x: 10, y: 58, isVisible: true, hasAutomaticHeight: false })
    expect(panels.environment).toMatchObject({
      x: 10,
      y: panels.entities.y + panels.entities.height + 16,
      isVisible: true
    })
    expect(panels.simulation).toMatchObject({
      x: 10,
      y: panels.environment.y + panels.environment.height + 16,
      isVisible: true
    })
    expect(panels.settings).toMatchObject({ x: 830, y: 58, isVisible: true })
    expect(panels.settings.x + panels.settings.width).toBe(1190)
    expect(panels.debug.x + panels.debug.width).toBe(1190)
    expect(panels.diagnostics.x + panels.diagnostics.width).toBe(1190)
    expect(panels.animations).toMatchObject({ isVisible: false, hasAutomaticHeight: false })
    expect(panels.debug.isVisible).toBe(false)
    expect(panels.diagnostics.isVisible).toBe(false)
  })
  it('clamps movement and resizing to the viewport', () => {
    const panel = clampPanel(
      {
        x: -100,
        y: 4000,
        width: 4000,
        height: 4000,
        hasAutomaticHeight: true,
        isCollapsed: false,
        isVisible: true,
        z: 2
      },
      1000,
      700
    )

    expect(panel.x).toBe(10)
    expect(panel.y).toBe(58)
    expect(panel.width).toBe(980)
    expect(panel.height).toBe(634)

    const narrow = clampPanel({ ...panel, width: 500, height: 500 }, 240, 200)

    expect(narrow.width).toBe(220)
    expect(narrow.height).toBe(134)
  })
  it('fits newly introduced panels around saved panel positions', () => {
    const defaults = createDefaultPanelLayout(1600, 900)
    const saved = { settings: defaults.settings, simulation: { ...defaults.simulation, y: 454 } }
    const panels = parsePanelLayout(JSON.stringify(saved), 1600, 900)

    expect(panels.settings).toEqual(saved.settings)
    expect(panels.simulation).toEqual(saved.simulation)

    for (const panel of [panels.entities, panels.environment]) {
      expect(doPanelsOverlap(panel, panels.settings)).toBe(false)
      expect(doPanelsOverlap(panel, panels.simulation)).toBe(false)
    }

    expect(doPanelsOverlap(panels.entities, panels.environment)).toBe(false)
  })
  it('uses the rendered height when dragging a content-sized panel', () => {
    const panel = clampPanel(
      { x: 10, y: 4000, width: 340, height: 380, hasAutomaticHeight: true, isCollapsed: false, isVisible: true, z: 2 },
      1200,
      800,
      220
    )

    expect(panel.y).toBe(572)
    expect(panel.height).toBe(380)
  })
  it('places a newly opened panel in the nearest available non-overlapping space', () => {
    const panels = createDefaultPanelLayout(1600, 900)
    const opened = placePanelWithoutOverlap(
      { ...panels.debug, x: panels.settings.x, y: panels.settings.y, isVisible: true },
      [panels.entities, panels.environment, panels.simulation, panels.settings],
      1600,
      900
    )

    expect(opened).toMatchObject({ x: panels.settings.x - opened.width - 8, y: 58 })
    expect(
      [panels.entities, panels.environment, panels.simulation, panels.settings].some((panel) =>
        doPanelsOverlap(opened, panel)
      )
    ).toBe(false)
  })
  it('moves, resizes, stacks, hides, collapses, persists, and resets panels', async () => {
    const layout = createPanelLayout()

    layout.move('settings', 90, 60)
    layout.resize('entities', 420, layout.panels.entities.height)
    layout.resize('settings', 500, 420, true)
    expect(layout.panels.settings.hasAutomaticHeight).toBe(false)
    layout.fitContent('settings')
    layout.bringToFront('settings')
    layout.toggleCollapsed('entities')
    layout.setVisible('diagnostics', false)
    layout.setVisible('animations', true)
    layout.move('animations', 360, 80)
    layout.resize('animations', 400, 480, true)

    await Promise.resolve()
    expect(layout.panels.settings).toMatchObject({ x: 90, y: 60, width: 500, height: 420, hasAutomaticHeight: true })
    expect(layout.panels.entities).toMatchObject({ width: 420, hasAutomaticHeight: false })
    expect(layout.panels.settings.z).toBeGreaterThan(layout.panels.diagnostics.z)
    expect(layout.panels.entities.isCollapsed).toBe(true)
    expect(layout.panels.diagnostics.isVisible).toBe(false)

    const persisted = JSON.parse(localStorage.getItem('luz.editor.layout')!)

    expect(persisted.settings).toBeDefined()
    expect(persisted.simulation).toBeDefined()
    expect(persisted.debug).toBeDefined()
    expect(persisted.animations).toMatchObject({ x: 360, y: 80, width: 400, height: 480, isVisible: true })
    expect(parsePanelLayout(JSON.stringify(persisted)).animations).toEqual(persisted.animations)
    expect(persisted.render).toBeUndefined()
    layout.reset()
    expect(layout.panels.settings).toMatchObject(createDefaultPanelLayout().settings)
  })
})
