import type { MaterialGraphInput } from './material-graph'
import type { SurfaceDefinition } from './surface'

type PropertyRule = 'string' | 'number' | 'boolean' | readonly string[]

export interface NodeLayout {
  inputs: readonly string[]
  indexedInputs?: readonly string[]
  properties: Readonly<Record<string, PropertyRule>>
}

// Property enum values preserve Blender's external identifiers.
export const materialNodeLayouts = {
  textureCoordinate: { inputs: [], properties: { uvMap: 'string' } },
  geometry: { inputs: [], properties: {} },
  imageTexture: { inputs: ['vector'], properties: {} },
  value: { inputs: ['value'], properties: {} },
  rgb: { inputs: ['value'], properties: {} },
  mapping: {
    inputs: ['vector', 'location', 'rotation', 'scale'],
    properties: { vectorType: ['POINT', 'VECTOR', 'NORMAL', 'TEXTURE'] }
  },
  math: {
    inputs: ['value1', 'value2'],
    properties: {
      operation: [
        'ADD',
        'SUBTRACT',
        'MULTIPLY',
        'DIVIDE',
        'MODULO',
        'ROUND',
        'POWER',
        'SNAP',
        'GREATER_THAN',
        'LESS_THAN',
        'SINE',
        'COSINE',
        'RADIANS'
      ],
      isClampingEnabled: 'boolean'
    }
  },
  vectorMath: { inputs: ['vector1', 'vector2', 'scale'], properties: { operation: ['ADD', 'MULTIPLY', 'SCALE'] } },
  mix: {
    inputs: ['factor', 'a', 'b'],
    properties: {
      dataType: ['FLOAT', 'VECTOR', 'RGBA'],
      blendType: [
        'MIX',
        'MULTIPLY',
        'LIGHTEN',
        'DARKEN',
        'DIFFERENCE',
        'SUBTRACT',
        'SOFT_LIGHT',
        'BURN',
        'HUE',
        'COLOR'
      ],
      isResultClampingEnabled: 'boolean'
    }
  },
  hueSaturation: { inputs: ['color', 'hue', 'saturation', 'value', 'factor'], properties: {} },
  brightContrast: { inputs: ['color', 'bright', 'contrast'], properties: {} },
  gamma: { inputs: ['color', 'gamma'], properties: {} },
  invert: { inputs: ['color', 'factor'], properties: {} },
  rgbToBW: { inputs: ['color'], properties: {} },
  separateColor: { inputs: ['color'], properties: { mode: ['RGB'] } },
  clamp: { inputs: ['value', 'minimum', 'maximum'], properties: { clampType: ['MINMAX'] } },
  mapRange: {
    inputs: ['value', 'fromMinimum', 'fromMaximum', 'toMinimum', 'toMaximum'],
    properties: { dataType: ['FLOAT'], interpolation: ['LINEAR', 'SMOOTHSTEP'], isClampingEnabled: 'boolean' }
  },
  colorRamp: {
    inputs: ['factor'],
    indexedInputs: ['position', 'color'],
    properties: { elementCount: 'number', interpolation: ['CONSTANT', 'LINEAR', 'EASE', 'B_SPLINE'] }
  },
  rgbCurves: {
    inputs: ['color', 'factor'],
    indexedInputs: ['position', 'value'],
    properties: { pointCount: 'number', extensionMode: ['HORIZONTAL', 'EXTRAPOLATED'] }
  },
  separateXYZ: { inputs: ['vector'], properties: {} },
  combineXYZ: { inputs: ['x', 'y', 'z'], properties: {} },
  noiseTexture: {
    inputs: ['vector', 'w', 'scale', 'detail', 'roughness', 'lacunarity', 'distortion'],
    properties: { dimensions: ['3D', '4D'] }
  },
  waveTexture: {
    inputs: ['vector', 'scale', 'distortion', 'detail', 'detailScale', 'detailRoughness', 'phaseOffset'],
    properties: {
      waveType: ['BANDS', 'RINGS'],
      bandsDirection: ['X', 'Y', 'Z', 'DIAGONAL'],
      ringsDirection: ['X', 'Y', 'Z', 'SPHERICAL'],
      waveProfile: ['SIN']
    }
  },
  gradientTexture: { inputs: ['vector'], properties: { gradientType: ['LINEAR'] } },
  ambientOcclusion: {
    inputs: ['color', 'distance', 'normal'],
    properties: { inside: 'boolean', localOnly: 'boolean' }
  },
  checkerTexture: { inputs: ['vector', 'color1', 'color2', 'scale'], properties: {} },
  voronoiTexture: {
    inputs: ['vector', 'w', 'scale', 'randomness', 'exponent'],
    properties: {
      dimensions: ['3D', '4D'],
      feature: ['F1', 'DISTANCE_TO_EDGE'],
      distance: ['EUCLIDEAN', 'MANHATTAN', 'CHEBYCHEV', 'MINKOWSKI'],
      isNormalizationEnabled: 'boolean'
    }
  },
  fresnel: { inputs: ['indexOfRefraction', 'normal'], properties: {} },
  layerWeight: { inputs: ['blend', 'normal'], properties: {} },
  vectorRotate: { inputs: ['vector', 'center', 'axis', 'angle'], properties: { isInversionEnabled: 'boolean' } },
  normalMap: { inputs: ['color', 'strength'], properties: { space: ['TANGENT', 'OBJECT', 'WORLD'] } },
  bump: { inputs: ['height', 'strength', 'distance', 'normal'], properties: { isInversionEnabled: 'boolean' } }
} as const satisfies Record<string, NodeLayout>

export type MaterialNodeType = keyof typeof materialNodeLayouts

type PropertyValue<Rule extends PropertyRule> = Rule extends readonly string[]
  ? Rule[number]
  : Rule extends 'number'
    ? number
    : Rule extends 'boolean'
      ? boolean
      : string
type IndexedInput<Layout> = Layout extends { indexedInputs: readonly (infer Prefix extends string)[] }
  ? `${Prefix}${number}`
  : never
type InputNames<Layout extends NodeLayout> = Layout['inputs'][number] | IndexedInput<Layout>
type NodeInputs<Layout extends NodeLayout> = [InputNames<Layout>] extends [never]
  ? Record<string, never>
  : Partial<Record<InputNames<Layout>, MaterialGraphInput>>
type NodeProperties<Layout extends NodeLayout> = keyof Layout['properties'] extends never
  ? Record<string, never>
  : {
      [Name in keyof Layout['properties']]?: PropertyValue<Layout['properties'][Name]>
    }
type NodeDocument<Kind extends MaterialNodeType> = {
  type: Kind
  inputs?: NodeInputs<(typeof materialNodeLayouts)[Kind]>
  properties?: NodeProperties<(typeof materialNodeLayouts)[Kind]>
} & (Kind extends 'imageTexture' ? { surface: SurfaceDefinition } : { surface?: never })

export type MaterialNode = { [Kind in MaterialNodeType]: NodeDocument<Kind> }[MaterialNodeType]
