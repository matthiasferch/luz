export type CullMode = 'none' | 'front' | 'back'
export type BlendMode = 'none' | 'additive' | 'transparent' | 'transmissive'
export type DepthTest =
  'none' | 'never' | 'always' | 'equal' | 'notEqual' | 'less' | 'lessEqual' | 'greater' | 'greaterEqual'
export type AlphaMode = 'opaque' | 'mask' | 'blend'
export type MaterialBlendMode = Exclude<BlendMode, 'transparent'>
export type PrimitiveTopology =
  'points' | 'lines' | 'lineLoop' | 'lineStrip' | 'triangles' | 'triangleFan' | 'triangleStrip'
export type ColorMask = readonly [r: boolean, g: boolean, b: boolean, a: boolean]
