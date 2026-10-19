import { DEBUG_COLORS } from '@luz/graphics'

export const OVERLAY_STYLES = {
  camera: { color: DEBUG_COLORS.camera, label: 'Camera frustums · direction arrow' },
  light: { color: DEBUG_COLORS.light, label: 'Light frustums · direction arrow' },
  bodyInside: { color: DEBUG_COLORS.bodyInside, label: 'Body bounding boxes · intersects view' },
  bodyOutside: { color: DEBUG_COLORS.bodyOutside, label: 'Body bounding boxes · outside view (dashed)' },
  model: { color: DEBUG_COLORS.model, label: 'Model bounding boxes · current pose' },
  armature: { color: DEBUG_COLORS.armature, label: 'Armatures · bones and joints' },
  collider: { color: DEBUG_COLORS.collider, label: 'Colliders · shape wireframes' },
  contact: { color: DEBUG_COLORS.contact, label: 'Contacts · points and normal arrows' },
  scissor: { color: DEBUG_COLORS.scissor, label: 'Light scissors · screen rectangles' }
} as const

export type OverlayCategory = keyof typeof OVERLAY_STYLES
