export const DEBUG_COLORS = {
  camera: '#56B4E9',
  light: '#E69F00',
  bodyInside: '#2ECC71',
  bodyOutside: '#E74C3C',
  model: '#00BFA5',
  armature: '#CC79A7',
  collider: '#9E8CFF',
  contact: '#FF7043',
  scissor: '#FFFFFF'
} as const

export type OverlayCategory = keyof typeof DEBUG_COLORS
