import { Vector2, Vector3, Vector4 } from '@luz/math'
import type {
  MaterialClosure,
  MaterialGraph,
  MaterialGraphInput,
  MaterialNode,
  MaterialGraphOutput,
  MaterialGraphValue
} from '../../renderer/material-graph'
import { Surface } from '../../renderer/surface'
import type { UniformValue } from '../../types/uniform'
import { materialGraphHelpers } from './shader-source'

type ValueType = 'float' | 'vec2' | 'vec3' | 'vec4'

interface Expression {
  code: string
  type: ValueType
}

export interface GraphSource {
  source: string
  uniforms: Record<string, UniformValue>
  textures: Record<string, Surface>
}

export function generateGraphSource(graph: MaterialGraph): GraphSource {
  const uniforms: Record<string, UniformValue> = Object.create(null)
  const textures: Record<string, Surface> = Object.create(null)
  const declarations: string[] = []
  const statements: string[] = []
  const expressionCache = new Map<string, Expression>()
  const sampleCache = new Map<string, Expression>()
  const colorRampCache = new Map<string, Expression>()
  const resolving = new Set<string>()

  let valueIndex = 0
  let textureIndex = 0
  let temporaryIndex = 0

  const addConstant = (value: MaterialGraphValue): Expression => {
    const name = `materialGraphValue${valueIndex++}`

    let type: ValueType
    let uniformValue: UniformValue

    if (Array.isArray(value)) {
      if (value.length < 2 || value.length > 4) {
        throw new Error(`Material graph constant '${name}' must have between 2 and 4 components`)
      }

      type = `vec${value.length}` as ValueType
      uniformValue =
        value.length === 2 ? new Vector2(value) : value.length === 3 ? new Vector3(value) : new Vector4(value)
    } else {
      type = 'float'
      uniformValue = value
    }

    declarations.push(`uniform ${type} ${name};`)

    uniforms[name] = uniformValue

    return { code: name, type }
  }

  const convert = (expression: Expression, type: ValueType): Expression => {
    if (expression.type === type) {
      return expression
    }

    if (type === 'float') {
      return { code: `${expression.code}.x`, type }
    }

    if (type === 'vec2') {
      if (expression.type === 'float') {
        return { code: `vec2(${expression.code})`, type }
      }

      return { code: `${expression.code}.xy`, type }
    }

    if (type === 'vec3') {
      if (expression.type === 'float') {
        return { code: `vec3(${expression.code})`, type }
      }

      if (expression.type === 'vec2') {
        return { code: `vec3(${expression.code}, 0.0)`, type }
      }

      return { code: `${expression.code}.xyz`, type }
    }

    if (expression.type === 'float') {
      return { code: `vec4(${expression.code})`, type }
    }

    if (expression.type === 'vec2') {
      return { code: `vec4(${expression.code}, 0.0, 1.0)`, type }
    }

    return { code: `vec4(${expression.code}, 1.0)`, type }
  }

  const resolveNodeInput = (
    node: MaterialNode,
    name: string,
    fallback: MaterialGraphValue,
    type?: ValueType
  ): Expression => {
    const inputs: Readonly<Record<string, MaterialGraphInput | undefined>> = node.inputs ?? {}
    const expression = resolveInput(inputs[name] ?? { value: fallback })

    return type ? convert(expression, type) : expression
  }

  const emit = (key: string, expression: Expression): Expression => {
    const name = `materialGraphTemporary${temporaryIndex++}`

    statements.push(`  ${expression.type} ${name} = ${expression.code};`)

    const result = { code: name, type: expression.type }

    expressionCache.set(key, result)

    return result
  }

  const resolveInput = (graphInput: MaterialGraphInput): Expression => {
    return 'node' in graphInput ? compileOutput(graphInput.node, graphInput.output) : addConstant(graphInput.value)
  }

  const compileOutput = (nodeId: string, output: string): Expression => {
    const key = `${nodeId}:${output}`
    const cachedExpression = expressionCache.get(key)

    if (cachedExpression) {
      return cachedExpression
    }

    if (resolving.has(key)) {
      throw new Error(`Material graph cycle detected at '${key}'`)
    }

    const node = graph.nodes[nodeId]

    if (!node) {
      throw new Error(`Material graph references missing node '${nodeId}'`)
    }

    resolving.add(key)

    let result: Expression

    switch (node.type) {
      case 'textureCoordinate': {
        if (output === 'UV') {
          result = { code: 'vec3(context.textureCoordinates, 0.0)', type: 'vec3' }
        } else if (output === 'Object') {
          result = { code: 'context.objectPosition', type: 'vec3' }
        } else if (output === 'Generated') {
          result = {
            code: `clamp((context.objectPosition - generatedCoordinateMinimum) / max(abs(generatedCoordinateExtent), vec3(1e-8)), 0.0, 1.0)`,
            type: 'vec3'
          }
        } else {
          throw new Error(`TextureCoordinate does not support output '${output}'`)
        }

        break
      }
      case 'geometry': {
        if (output === 'Incoming') {
          result = { code: '-luzCalculateMaterialWorldViewDirection(context)', type: 'vec3' }
        } else if (output === 'Normal') {
          result = { code: 'normalize(context.geometricNormal)', type: 'vec3' }
        } else if (output === 'Position') {
          result = { code: 'context.worldPosition', type: 'vec3' }
        } else {
          throw new Error(`Geometry does not support output '${output}'`)
        }

        break
      }
      case 'imageTexture': {
        let sample = sampleCache.get(nodeId)

        if (!sample) {
          if (!node.surface) {
            throw new Error(`ImageTexture '${nodeId}' has no surface`)
          }

          const name = `materialGraphTexture${textureIndex++}`

          declarations.push(`uniform sampler2D ${name};`)

          textures[name] = Surface.createFromDefinition(node.surface)

          const vector = node.inputs?.vector
            ? resolveNodeInput(node, 'vector', [0, 0, 0], 'vec3')
            : { code: 'vec3(context.textureCoordinates, 0.0)', type: 'vec3' as ValueType }

          sample = emit(`${nodeId}:sample`, { code: `texture(${name}, ${vector.code}.xy)`, type: 'vec4' })

          sampleCache.set(nodeId, sample)
        }

        result =
          output === 'Color'
            ? sample
            : output === 'Alpha'
              ? { code: `${sample.code}.a`, type: 'float' }
              : (() => {
                  throw new Error(`ImageTexture does not support output '${output}'`)
                })()
        break
      }
      case 'value':
      case 'rgb': {
        const expectedOutput = node.type === 'value' ? 'Value' : 'Color'

        if (output !== expectedOutput) {
          throw new Error(`${node.type} does not support output '${output}'`)
        }

        result = resolveNodeInput(node, 'value', node.type === 'value' ? 0 : [0, 0, 0, 1])
        break
      }
      case 'mapping': {
        if (output !== 'Vector') {
          throw new Error(`Mapping does not support output '${output}'`)
        }

        const vector = resolveNodeInput(node, 'vector', [0, 0, 0], 'vec3')
        const location = resolveNodeInput(node, 'location', [0, 0, 0], 'vec3')
        const rotation = resolveNodeInput(node, 'rotation', [0, 0, 0], 'vec3')
        const scale = resolveNodeInput(node, 'scale', [1, 1, 1], 'vec3')
        const vectorType = String(node.properties?.vectorType ?? 'POINT')
        const source =
          vectorType === 'POINT'
            ? `luzApplyMapping(${vector.code}, ${location.code}, ${rotation.code}, ${scale.code})`
            : vectorType === 'VECTOR'
              ? `luzApplyMapping(${vector.code}, vec3(0.0), ${rotation.code}, ${scale.code})`
              : vectorType === 'NORMAL'
                ? `normalize(luzApplyMapping(${vector.code}, vec3(0.0), ${rotation.code}, 1.0 / max(abs(${scale.code}), vec3(1e-5))))`
                : vectorType === 'TEXTURE'
                  ? `luzApplyTextureMapping(${vector.code}, ${location.code}, ${rotation.code}, ${scale.code})`
                  : null

        if (!source) {
          throw new Error(`Unsupported Mapping vector type '${vectorType}' in '${nodeId}'`)
        }

        result = { code: source, type: 'vec3' }
        break
      }
      case 'math': {
        const firstValue = resolveNodeInput(node, 'value1', 0, 'float')
        const secondValue = resolveNodeInput(node, 'value2', 0, 'float')
        const operation = String(node.properties?.operation ?? 'ADD')
        const operations: Record<string, string> = {
          ADD: `(${firstValue.code} + ${secondValue.code})`,
          SUBTRACT: `(${firstValue.code} - ${secondValue.code})`,
          MULTIPLY: `(${firstValue.code} * ${secondValue.code})`,
          DIVIDE: `(${firstValue.code} / (abs(${secondValue.code}) < 1e-8 ? (${secondValue.code} < 0.0 ? -1e-8 : 1e-8) : ${secondValue.code}))`,
          MODULO: `mod(${firstValue.code}, abs(${secondValue.code}) < 1e-8 ? 1e-8 : ${secondValue.code})`,
          ROUND: `floor(${firstValue.code} + 0.5)`,
          POWER: `pow(max(${firstValue.code}, 0.0), ${secondValue.code})`,
          SNAP: `floor(${firstValue.code} / (abs(${secondValue.code}) < 1e-8 ? 1e-8 : ${secondValue.code})) * ${secondValue.code}`,
          GREATER_THAN: `(${firstValue.code} > ${secondValue.code} ? 1.0 : 0.0)`,
          LESS_THAN: `(${firstValue.code} < ${secondValue.code} ? 1.0 : 0.0)`,
          SINE: `sin(${firstValue.code})`,
          COSINE: `cos(${firstValue.code})`,
          RADIANS: `radians(${firstValue.code})`
        }
        const operationSource = operations[operation]

        if (!operationSource) {
          throw new Error(`Unsupported Math operation '${operation}' in '${nodeId}'`)
        }

        const source = node.properties?.isClampingEnabled ? `clamp(${operationSource}, 0.0, 1.0)` : operationSource

        result = { code: source, type: 'float' }
        break
      }
      case 'vectorMath': {
        const firstVector = resolveNodeInput(node, 'vector1', [0, 0, 0], 'vec3')
        const operation = String(node.properties?.operation ?? 'ADD')

        if (operation === 'SCALE') {
          const scale = resolveNodeInput(node, 'scale', 1, 'float')

          result = { code: `(${firstVector.code} * ${scale.code})`, type: 'vec3' }
          break
        }

        if (!['ADD', 'MULTIPLY'].includes(operation)) {
          throw new Error(`Unsupported VectorMath operation '${operation}' in '${nodeId}'`)
        }

        const secondVector = resolveNodeInput(node, 'vector2', [0, 0, 0], 'vec3')

        result = {
          code: `(${firstVector.code} ${operation === 'ADD' ? '+' : '*'} ${secondVector.code})`,
          type: 'vec3'
        }
        break
      }
      case 'mix': {
        const dataType = String(node.properties?.dataType ?? 'RGBA')
        const valueType: ValueType = dataType === 'FLOAT' ? 'float' : dataType === 'VECTOR' ? 'vec3' : 'vec4'

        if (!['FLOAT', 'VECTOR', 'RGBA'].includes(dataType)) {
          throw new Error(`Unsupported Mix data type '${dataType}' in '${nodeId}'`)
        }

        const factor = resolveNodeInput(node, 'factor', 0.5, 'float')
        const fallback = valueType === 'float' ? 0 : valueType === 'vec3' ? [0, 0, 0] : [0, 0, 0, 1]
        const firstValue = resolveNodeInput(node, 'a', fallback, valueType)
        const secondValue = resolveNodeInput(node, 'b', fallback, valueType)
        const mode = String(node.properties?.blendType ?? 'MIX')
        const softLight =
          valueType === 'vec4'
            ? `vec4((vec3(1.0) - ${firstValue.code}.rgb) * ${secondValue.code}.rgb * ${firstValue.code}.rgb + ${firstValue.code}.rgb * (vec3(1.0) - (vec3(1.0) - ${secondValue.code}.rgb) * (vec3(1.0) - ${firstValue.code}.rgb)), ${firstValue.code}.a)`
            : `((${valueType}(1.0) - ${firstValue.code}) * ${secondValue.code} * ${firstValue.code} + ${firstValue.code} * (${valueType}(1.0) - (${valueType}(1.0) - ${secondValue.code}) * (${valueType}(1.0) - ${firstValue.code})))`
        const blended =
          mode === 'MIX'
            ? secondValue.code
            : mode === 'MULTIPLY'
              ? `${firstValue.code} * ${secondValue.code}`
              : mode === 'LIGHTEN'
                ? `max(${firstValue.code}, ${secondValue.code})`
                : mode === 'DARKEN'
                  ? `min(${firstValue.code}, ${secondValue.code})`
                  : mode === 'DIFFERENCE'
                    ? `abs(${firstValue.code} - ${secondValue.code})`
                    : mode === 'SUBTRACT'
                      ? `${firstValue.code} - ${secondValue.code}`
                      : mode === 'SOFT_LIGHT'
                        ? softLight
                        : mode === 'BURN' && valueType === 'vec4'
                          ? `luzApplyColorBurn(${firstValue.code}, ${secondValue.code})`
                          : mode === 'HUE' && valueType === 'vec4'
                            ? `vec4(luzConvertHsvToRgb(vec3(luzConvertRgbToHsv(${secondValue.code}.rgb).x, luzConvertRgbToHsv(${firstValue.code}.rgb).yz)), ${firstValue.code}.a)`
                            : mode === 'COLOR' && valueType === 'vec4'
                              ? `vec4(luzConvertHsvToRgb(vec3(luzConvertRgbToHsv(${secondValue.code}.rgb).xy, luzConvertRgbToHsv(${firstValue.code}.rgb).z)), ${firstValue.code}.a)`
                              : null

        if (!blended) {
          throw new Error(`Unsupported Mix mode '${mode}' in '${nodeId}'`)
        }

        const mixed = `mix(${firstValue.code}, ${blended}, clamp(${factor.code}, 0.0, 1.0))`

        result = {
          code: node.properties?.isResultClampingEnabled ? `clamp(${mixed}, 0.0, 1.0)` : mixed,
          type: valueType
        }
        break
      }
      case 'hueSaturation': {
        const color = resolveNodeInput(node, 'color', [0, 0, 0, 1], 'vec4')
        const hue = resolveNodeInput(node, 'hue', 0.5, 'float')
        const saturation = resolveNodeInput(node, 'saturation', 1, 'float')
        const value = resolveNodeInput(node, 'value', 1, 'float')
        const factor = resolveNodeInput(node, 'factor', 1, 'float')

        result = {
          code: `vec4(mix(${color.code}.rgb, luzApplyHueSaturation(${color.code}.rgb, ${hue.code}, ${saturation.code}, ${value.code}), ${factor.code}), ${color.code}.a)`,
          type: 'vec4'
        }
        break
      }
      case 'brightContrast': {
        const color = resolveNodeInput(node, 'color', [0, 0, 0, 1], 'vec4')
        const bright = resolveNodeInput(node, 'bright', 0, 'float')
        const contrast = resolveNodeInput(node, 'contrast', 0, 'float')

        result = {
          code: `vec4((${color.code}.rgb - 0.5) * (1.0 + ${contrast.code} / 100.0) + 0.5 + ${bright.code} / 100.0, ${color.code}.a)`,
          type: 'vec4'
        }
        break
      }
      case 'gamma': {
        if (output !== 'Color') {
          throw new Error(`Gamma does not support output '${output}'`)
        }

        const color = resolveNodeInput(node, 'color', [0, 0, 0, 1], 'vec4')
        const gamma = resolveNodeInput(node, 'gamma', 1, 'float')

        result = {
          code: `vec4(pow(max(${color.code}.rgb, vec3(0.0)), vec3(1.0 / max(${gamma.code}, 1e-6))), ${color.code}.a)`,
          type: 'vec4'
        }
        break
      }
      case 'invert': {
        if (output !== 'Color') {
          throw new Error(`Invert does not support output '${output}'`)
        }

        const color = resolveNodeInput(node, 'color', [0, 0, 0, 1], 'vec4')
        const factor = resolveNodeInput(node, 'factor', 1, 'float')

        result = {
          code: `vec4(mix(${color.code}.rgb, vec3(1.0) - ${color.code}.rgb, clamp(${factor.code}, 0.0, 1.0)), ${color.code}.a)`,
          type: 'vec4'
        }
        break
      }
      case 'rgbToBW': {
        if (output !== 'Val' && output !== 'Value') {
          throw new Error(`RGBToBW does not support output '${output}'`)
        }

        const color = resolveNodeInput(node, 'color', [0, 0, 0, 1], 'vec4')

        result = { code: `dot(${color.code}.rgb, vec3(0.2126, 0.7152, 0.0722))`, type: 'float' }
        break
      }
      case 'separateColor': {
        const color = resolveNodeInput(node, 'color', [0, 0, 0, 1], 'vec4')
        const component = ({ Red: 'r', Green: 'g', Blue: 'b' } as Record<string, string>)[output]

        if (String(node.properties?.mode ?? 'RGB') !== 'RGB' || !component) {
          throw new Error(`SeparateColor does not support output '${output}' in mode '${node.properties?.mode}'`)
        }

        result = { code: `${color.code}.${component}`, type: 'float' }
        break
      }
      case 'clamp': {
        if (output !== 'Result' && output !== 'Value') {
          throw new Error(`Clamp does not support output '${output}'`)
        }

        if (String(node.properties?.clampType ?? 'MINMAX') !== 'MINMAX') {
          throw new Error(`Unsupported Clamp mode in '${nodeId}'`)
        }

        const value = resolveNodeInput(node, 'value', 1, 'float')
        const minimumValue = resolveNodeInput(node, 'minimum', 0, 'float')
        const maximumValue = resolveNodeInput(node, 'maximum', 1, 'float')

        result = { code: `clamp(${value.code}, ${minimumValue.code}, ${maximumValue.code})`, type: 'float' }
        break
      }
      case 'mapRange': {
        if (output !== 'Result' && output !== 'Value') {
          throw new Error(`MapRange does not support output '${output}'`)
        }

        const interpolation = String(node.properties?.interpolation ?? 'LINEAR')

        if (
          String(node.properties?.dataType ?? 'FLOAT') !== 'FLOAT' ||
          !['LINEAR', 'SMOOTHSTEP'].includes(interpolation)
        ) {
          throw new Error(`Unsupported MapRange configuration in '${nodeId}'`)
        }

        const value = resolveNodeInput(node, 'value', 1, 'float')
        const fromMinimum = resolveNodeInput(node, 'fromMinimum', 0, 'float')
        const fromMaximum = resolveNodeInput(node, 'fromMaximum', 1, 'float')
        const toMinimum = resolveNodeInput(node, 'toMinimum', 0, 'float')
        const toMaximum = resolveNodeInput(node, 'toMaximum', 1, 'float')
        const denominator = `(${fromMaximum.code} - ${fromMinimum.code})`
        const factor = `(abs(${denominator}) < 1e-8 ? 0.0 : (${value.code} - ${fromMinimum.code}) / ${denominator})`
        const interpolatedFactor = interpolation === 'SMOOTHSTEP' ? `smoothstep(0.0, 1.0, ${factor})` : factor
        const mapped = `mix(${toMinimum.code}, ${toMaximum.code}, ${interpolatedFactor})`

        result = {
          code: node.properties?.isClampingEnabled
            ? `clamp(${mapped}, min(${toMinimum.code}, ${toMaximum.code}), max(${toMinimum.code}, ${toMaximum.code}))`
            : mapped,
          type: 'float'
        }
        break
      }
      case 'colorRamp': {
        let ramp = colorRampCache.get(nodeId)

        if (!ramp) {
          const elementCount = Number(node.properties?.elementCount)

          if (!Number.isInteger(elementCount) || elementCount < 2 || elementCount > 32) {
            throw new Error(`ColorRamp '${nodeId}' must contain between 2 and 32 elements`)
          }

          const interpolation = String(node.properties?.interpolation ?? 'LINEAR')

          if (!['CONSTANT', 'LINEAR', 'EASE', 'B_SPLINE'].includes(interpolation)) {
            throw new Error(`Unsupported ColorRamp interpolation '${interpolation}' in '${nodeId}'`)
          }

          const factor = resolveNodeInput(node, 'factor', 0.5, 'float')
          const positions = Array.from({ length: elementCount }, (_, index) =>
            resolveNodeInput(node, `position${index}`, index / (elementCount - 1), 'float')
          )
          const colors = Array.from({ length: elementCount }, (_, index) =>
            resolveNodeInput(node, `color${index}`, [0, 0, 0, 1], 'vec4')
          )

          let rampSource = colors[elementCount - 1].code

          for (let index = elementCount - 2; index >= 0; --index) {
            const nextPosition = positions[index + 1].code
            const segment =
              interpolation === 'CONSTANT'
                ? colors[index].code
                : (() => {
                    const linearFactor = `clamp((${factor.code} - ${positions[index].code}) / max(${nextPosition} - ${positions[index].code}, 1e-8), 0.0, 1.0)`
                    const blendFactor =
                      interpolation === 'EASE'
                        ? `(${linearFactor} * ${linearFactor} * (3.0 - 2.0 * ${linearFactor}))`
                        : interpolation === 'B_SPLINE'
                          ? `(${linearFactor} * ${linearFactor} * ${linearFactor} * (${linearFactor} * (${linearFactor} * 6.0 - 15.0) + 10.0))`
                          : linearFactor

                    return `mix(${colors[index].code}, ${colors[index + 1].code}, ${blendFactor})`
                  })()

            rampSource = `(${factor.code} < ${nextPosition} ? ${segment} : ${rampSource})`
          }

          ramp = emit(`${nodeId}:ramp`, { code: rampSource, type: 'vec4' })

          colorRampCache.set(nodeId, ramp)
        }

        if (output !== 'Color' && output !== 'Alpha') {
          throw new Error(`ColorRamp does not support output '${output}'`)
        }

        result = output === 'Color' ? ramp : { code: `${ramp.code}.a`, type: 'float' }
        break
      }
      case 'rgbCurves': {
        if (output !== 'Color') {
          throw new Error(`RGBCurves does not support output '${output}'`)
        }

        const pointCount = Number(node.properties?.pointCount)

        if (!Number.isInteger(pointCount) || pointCount < 2 || pointCount > 32) {
          throw new Error(`RGBCurves '${nodeId}' must contain between 2 and 32 points`)
        }

        const color = resolveNodeInput(node, 'color', [0, 0, 0, 1], 'vec4')
        const factor = resolveNodeInput(node, 'factor', 1, 'float')
        const positions = Array.from({ length: pointCount }, (_, index) =>
          resolveNodeInput(node, `position${index}`, index / (pointCount - 1), 'float')
        )
        const values = Array.from({ length: pointCount }, (_, index) =>
          resolveNodeInput(node, `value${index}`, index / (pointCount - 1), 'float')
        )
        const mapComponent = (component: 'r' | 'g' | 'b'): string => {
          const source = `${color.code}.${component}`
          const firstDelta = `max(${positions[1].code} - ${positions[0].code}, 1e-8)`
          const lastPointIndex = pointCount - 1
          const lastDelta = `max(${positions[lastPointIndex].code} - ${positions[lastPointIndex - 1].code}, 1e-8)`
          const below =
            node.properties?.extensionMode === 'EXTRAPOLATED'
              ? `(${values[0].code} + (${source} - ${positions[0].code}) * (${values[1].code} - ${values[0].code}) / ${firstDelta})`
              : values[0].code
          const above =
            node.properties?.extensionMode === 'EXTRAPOLATED'
              ? `(${values[lastPointIndex].code} + (${source} - ${positions[lastPointIndex].code}) * (${values[lastPointIndex].code} - ${values[lastPointIndex - 1].code}) / ${lastDelta})`
              : values[lastPointIndex].code

          let curve = above

          for (let index = pointCount - 2; index >= 0; --index) {
            const blend = `smoothstep(${positions[index].code}, ${positions[index + 1].code}, ${source})`
            const segment = `mix(${values[index].code}, ${values[index + 1].code}, ${blend})`

            curve = `(${source} < ${positions[index + 1].code} ? ${segment} : ${curve})`
          }

          return `(${source} < ${positions[0].code} ? ${below} : ${curve})`
        }
        const mapped = `vec4(${mapComponent('r')}, ${mapComponent('g')}, ${mapComponent('b')}, ${color.code}.a)`

        result = { code: `mix(${color.code}, ${mapped}, clamp(${factor.code}, 0.0, 1.0))`, type: 'vec4' }
        break
      }
      case 'separateXYZ': {
        const vector = resolveNodeInput(node, 'vector', [0, 0, 0], 'vec3')
        const component = ({ X: 'x', Y: 'y', Z: 'z' } as Record<string, string>)[output]

        if (!component) {
          throw new Error(`SeparateXYZ does not support output '${output}'`)
        }

        result = { code: `${vector.code}.${component}`, type: 'float' }
        break
      }
      case 'combineXYZ': {
        result = {
          code: `vec3(${resolveNodeInput(node, 'x', 0, 'float').code}, ${resolveNodeInput(node, 'y', 0, 'float').code}, ${resolveNodeInput(node, 'z', 0, 'float').code})`,
          type: 'vec3'
        }
        break
      }
      case 'noiseTexture': {
        const vector = resolveNodeInput(node, 'vector', [0, 0, 0], 'vec3')
        const scale = resolveNodeInput(node, 'scale', 5, 'float')
        const detail = resolveNodeInput(node, 'detail', 2, 'float')
        const roughness = resolveNodeInput(node, 'roughness', 0.5, 'float')
        const lacunarity = resolveNodeInput(node, 'lacunarity', 2, 'float')
        const distortion = resolveNodeInput(node, 'distortion', 0, 'float')
        const dimensions = String(node.properties?.dimensions ?? '3D')

        let noise: string

        if (dimensions === '3D') {
          const coordinates = `(${vector.code} * ${scale.code} + vec3(luzGenerateNoise(${vector.code} * ${scale.code} + vec3(13.1, 7.7, 3.4))) * ${distortion.code})`

          noise = `luzGenerateFractalNoise(${coordinates}, ${detail.code}, ${roughness.code}, ${lacunarity.code})`
        } else if (dimensions === '4D') {
          const w = resolveNodeInput(node, 'w', 0, 'float')
          const coordinates = `vec4(${vector.code} * ${scale.code}, ${w.code})`
          const warped = `(${coordinates} + vec4(luzGenerateNoise(${coordinates} + vec4(13.1, 7.7, 3.4, 5.9)), luzGenerateNoise(${coordinates} + vec4(5.2, 19.1, 11.7, 2.3)), luzGenerateNoise(${coordinates} + vec4(17.8, 3.6, 23.5, 7.1)), luzGenerateNoise(${coordinates} + vec4(2.7, 29.4, 5.8, 13.3))) * ${distortion.code})`

          noise = `luzGenerateFractalNoise(${warped}, ${detail.code}, ${roughness.code}, ${lacunarity.code})`
        } else {
          throw new Error(`Unsupported NoiseTexture dimensions '${dimensions}' in '${nodeId}'`)
        }

        if (output !== 'Color' && output !== 'Fac' && output !== 'Factor') {
          throw new Error(`NoiseTexture does not support output '${output}'`)
        }

        result =
          output === 'Color' ? { code: `vec4(vec3(${noise}), 1.0)`, type: 'vec4' } : { code: noise, type: 'float' }
        break
      }
      case 'waveTexture': {
        if (output !== 'Color' && output !== 'Fac' && output !== 'Factor') {
          throw new Error(`WaveTexture does not support output '${output}'`)
        }

        const waveType = String(node.properties?.waveType ?? 'BANDS')
        const bandsDirection = String(node.properties?.bandsDirection ?? 'X')
        const ringsDirection = String(node.properties?.ringsDirection ?? 'X')
        const waveProfile = String(node.properties?.waveProfile ?? 'SIN')

        if (!['BANDS', 'RINGS'].includes(waveType) || waveProfile !== 'SIN') {
          throw new Error(`Unsupported WaveTexture configuration '${waveType}/${waveProfile}' in '${nodeId}'`)
        }

        const vector = resolveNodeInput(node, 'vector', [0, 0, 0], 'vec3')
        const scale = resolveNodeInput(node, 'scale', 5, 'float')
        const distortion = resolveNodeInput(node, 'distortion', 0, 'float')
        const detail = resolveNodeInput(node, 'detail', 2, 'float')
        const detailScale = resolveNodeInput(node, 'detailScale', 1, 'float')
        const detailRoughness = resolveNodeInput(node, 'detailRoughness', 0.5, 'float')
        const phaseOffset = resolveNodeInput(node, 'phaseOffset', 0, 'float')
        const coordinates = `(${vector.code} * ${scale.code})`

        let phase: string

        if (waveType === 'BANDS') {
          phase =
            bandsDirection === 'X'
              ? `${coordinates}.x`
              : bandsDirection === 'Y'
                ? `${coordinates}.y`
                : bandsDirection === 'Z'
                  ? `${coordinates}.z`
                  : bandsDirection === 'DIAGONAL'
                    ? `dot(${coordinates}, normalize(vec3(1.0)))`
                    : ''
        } else {
          phase =
            ringsDirection === 'X'
              ? `length(${coordinates}.yz)`
              : ringsDirection === 'Y'
                ? `length(${coordinates}.xz)`
                : ringsDirection === 'Z'
                  ? `length(${coordinates}.xy)`
                  : ringsDirection === 'SPHERICAL'
                    ? `length(${coordinates})`
                    : ''
        }

        if (!phase) {
          throw new Error(`Unsupported WaveTexture direction in '${nodeId}'`)
        }

        const detailNoise = `luzGenerateFractalNoise(${coordinates} * max(${detailScale.code}, 1e-5), ${detail.code}, ${detailRoughness.code}, 2.0)`
        const wave = `(0.5 + 0.5 * sin(6.28318530718 * (${phase} + (${detailNoise} - 0.5) * ${distortion.code}) + ${phaseOffset.code}))`

        result = output === 'Color' ? { code: `vec4(vec3(${wave}), 1.0)`, type: 'vec4' } : { code: wave, type: 'float' }
        break
      }
      case 'gradientTexture': {
        if (output !== 'Color' && output !== 'Fac' && output !== 'Factor') {
          throw new Error(`GradientTexture does not support output '${output}'`)
        }

        const gradientType = String(node.properties?.gradientType ?? 'LINEAR')

        if (gradientType !== 'LINEAR') {
          throw new Error(`Unsupported GradientTexture type '${gradientType}' in '${nodeId}'`)
        }

        const vector = resolveNodeInput(node, 'vector', [0, 0, 0], 'vec3')
        const factor = `${vector.code}.x`

        result =
          output === 'Color' ? { code: `vec4(vec3(${factor}), 1.0)`, type: 'vec4' } : { code: factor, type: 'float' }
        break
      }
      case 'ambientOcclusion': {
        if (output === 'AO') {
          result = { code: '1.0', type: 'float' }
        } else if (output === 'Color') {
          result = resolveNodeInput(node, 'color', [1, 1, 1, 1], 'vec4')
        } else {
          throw new Error(`AmbientOcclusion does not support output '${output}'`)
        }

        break
      }
      case 'checkerTexture': {
        const vector = resolveNodeInput(node, 'vector', [0, 0, 0], 'vec3')
        const firstColor = resolveNodeInput(node, 'color1', [0.8, 0.8, 0.8, 1], 'vec4')
        const secondColor = resolveNodeInput(node, 'color2', [0.2, 0.2, 0.2, 1], 'vec4')
        const scale = resolveNodeInput(node, 'scale', 5, 'float')
        const factor = `mod(floor(${vector.code}.x * ${scale.code}) + floor(${vector.code}.y * ${scale.code}) + floor(${vector.code}.z * ${scale.code}), 2.0)`

        if (output !== 'Color' && output !== 'Fac' && output !== 'Factor') {
          throw new Error(`CheckerTexture does not support output '${output}'`)
        }

        result =
          output === 'Fac' || output === 'Factor'
            ? { code: factor, type: 'float' }
            : { code: `mix(${firstColor.code}, ${secondColor.code}, ${factor})`, type: 'vec4' }
        break
      }
      case 'voronoiTexture': {
        const vector = resolveNodeInput(node, 'vector', [0, 0, 0], 'vec3')
        const scale = resolveNodeInput(node, 'scale', 5, 'float')
        const randomness = resolveNodeInput(node, 'randomness', 1, 'float')
        const dimensions = String(node.properties?.dimensions ?? '3D')
        const feature = String(node.properties?.feature ?? 'F1')
        const distance = String(node.properties?.distance ?? 'EUCLIDEAN')
        const coordinates = `(${vector.code} * ${scale.code})`
        const metric = ({ EUCLIDEAN: 0, MANHATTAN: 1, CHEBYCHEV: 2, MINKOWSKI: 3 } as Record<string, number>)[distance]

        if (dimensions === '3D' && feature === 'F1' && metric !== undefined) {
          const exponent = resolveNodeInput(node, 'exponent', 2, 'float')

          if (output === 'Distance') {
            const source = `luzCalculateVoronoiDistance3D(${coordinates}, clamp(${randomness.code}, 0.0, 1.0), ${metric}, ${exponent.code})`
            const maximumDistance =
              metric === 0
                ? '1.73205080757'
                : metric === 1
                  ? '3.0'
                  : metric === 2
                    ? '1.0'
                    : `pow(3.0, 1.0 / max(${exponent.code}, 1e-4))`

            result = {
              code: node.properties?.isNormalizationEnabled
                ? `clamp(${source} / ${maximumDistance}, 0.0, 1.0)`
                : source,
              type: 'float'
            }
          } else if (output === 'Color') {
            result = {
              code: `vec4(luzCalculateVoronoiColor3D(${coordinates}, clamp(${randomness.code}, 0.0, 1.0), ${metric}, ${exponent.code}), 1.0)`,
              type: 'vec4'
            }
          } else {
            throw new Error(`VoronoiTexture 3D/F1 does not support output '${output}'`)
          }
        } else if (dimensions === '3D' && feature === 'DISTANCE_TO_EDGE') {
          if (output !== 'Distance') {
            throw new Error(`VoronoiTexture 3D/DistanceToEdge does not support output '${output}'`)
          }

          const source = `luzCalculateVoronoiEdgeDistance3D(${coordinates}, clamp(${randomness.code}, 0.0, 1.0))`

          result = {
            code: node.properties?.isNormalizationEnabled ? `clamp(${source}, 0.0, 1.0)` : source,
            type: 'float'
          }
        } else if (dimensions === '4D' && feature === 'F1' && distance === 'EUCLIDEAN') {
          const w = resolveNodeInput(node, 'w', 0, 'float')
          const coordinate4D = `vec4(${coordinates}, ${w.code} * ${scale.code})`

          if (output === 'Distance') {
            const source = `luzCalculateVoronoiDistance4D(${coordinate4D}, clamp(${randomness.code}, 0.0, 1.0))`

            result = {
              code: node.properties?.isNormalizationEnabled ? `clamp(${source} / 2.0, 0.0, 1.0)` : source,
              type: 'float'
            }
          } else if (output === 'Color') {
            result = {
              code: `vec4(luzCalculateVoronoiColor4D(${coordinate4D}, clamp(${randomness.code}, 0.0, 1.0)), 1.0)`,
              type: 'vec4'
            }
          } else {
            throw new Error(`VoronoiTexture 4D/F1 does not support output '${output}'`)
          }
        } else if (dimensions === '4D' && feature === 'DISTANCE_TO_EDGE') {
          if (output !== 'Distance') {
            throw new Error(`VoronoiTexture 4D/DistanceToEdge does not support output '${output}'`)
          }

          const w = resolveNodeInput(node, 'w', 0, 'float')
          const source = `luzCalculateVoronoiEdgeDistance4D(vec4(${coordinates}, ${w.code} * ${scale.code}), clamp(${randomness.code}, 0.0, 1.0))`

          result = {
            code: node.properties?.isNormalizationEnabled ? `clamp(${source}, 0.0, 1.0)` : source,
            type: 'float'
          }
        } else {
          throw new Error(
            `Unsupported VoronoiTexture configuration '${dimensions}/${feature}/${distance}' in '${nodeId}'`
          )
        }

        break
      }
      case 'fresnel': {
        if (output !== 'Factor') {
          throw new Error(`Fresnel does not support output '${output}'`)
        }

        const indexOfRefraction = resolveNodeInput(node, 'indexOfRefraction', 1.45, 'float')
        const normal = node.inputs?.normal
          ? resolveNodeInput(node, 'normal', [0, 0, 1], 'vec3')
          : { code: 'vec3(0.0, 0.0, 1.0)', type: 'vec3' as ValueType }

        result = {
          code: `luzCalculateFresnelDielectric(${indexOfRefraction.code}, luzCalculateMaterialWorldNormal(context, ${normal.code}), luzCalculateMaterialWorldViewDirection(context))`,
          type: 'float'
        }
        break
      }
      case 'layerWeight': {
        if (output !== 'Facing' && output !== 'Fresnel') {
          throw new Error(`LayerWeight does not support output '${output}'`)
        }

        const blend = resolveNodeInput(node, 'blend', 0.5, 'float')
        const normal = node.inputs?.normal
          ? resolveNodeInput(node, 'normal', [0, 0, 1], 'vec3')
          : { code: 'vec3(0.0, 0.0, 1.0)', type: 'vec3' as ValueType }
        const worldNormal = `luzCalculateMaterialWorldNormal(context, ${normal.code})`
        const worldViewDirection = 'luzCalculateMaterialWorldViewDirection(context)'

        if (output === 'Facing') {
          const clampedBlend = `clamp(${blend.code}, 0.0, 0.99999)`
          const exponent = `(${clampedBlend} < 0.5 ? max(2.0 * ${clampedBlend}, 1e-5) : 0.5 / max(1.0 - ${clampedBlend}, 1e-5))`

          result = {
            code: `(1.0 - pow(clamp(abs(dot(${worldNormal}, ${worldViewDirection})), 0.0, 1.0), ${exponent}))`,
            type: 'float'
          }
        } else {
          const indexOfRefraction = `(1.0 / max(1.0 - clamp(${blend.code}, 0.0, 0.99999), 1e-5))`

          result = {
            code: `luzCalculateFresnelDielectric(${indexOfRefraction}, ${worldNormal}, ${worldViewDirection})`,
            type: 'float'
          }
        }

        break
      }
      case 'vectorRotate': {
        const vector = resolveNodeInput(node, 'vector', [0, 0, 0], 'vec3')
        const center = resolveNodeInput(node, 'center', [0, 0, 0], 'vec3')
        const axis = resolveNodeInput(node, 'axis', [0, 0, 1], 'vec3')
        const angle = resolveNodeInput(node, 'angle', 0, 'float')
        const signedAngle = node.properties?.isInversionEnabled ? `-${angle.code}` : angle.code

        result = {
          code: `luzRotateAxisAngle(${vector.code}, ${center.code}, ${axis.code}, ${signedAngle})`,
          type: 'vec3'
        }
        break
      }
      case 'normalMap': {
        if (output !== 'Normal') {
          throw new Error(`NormalMap does not support output '${output}'`)
        }

        const color = resolveNodeInput(node, 'color', [0.5, 0.5, 1, 1], 'vec4')
        const strength = resolveNodeInput(node, 'strength', 1, 'float')
        const space = String(node.properties?.space ?? 'TANGENT')
        const spaceIndex = ({ TANGENT: 0, OBJECT: 1, WORLD: 2 } as Record<string, number>)[space]

        if (spaceIndex === undefined) {
          throw new Error(`Unsupported NormalMap space '${space}' in '${nodeId}'`)
        }

        result = {
          code: `luzApplyNormalMap(context, ${color.code}.xyz, ${strength.code}, ${spaceIndex})`,
          type: 'vec3'
        }
        break
      }
      case 'bump': {
        if (output !== 'Normal') {
          throw new Error(`Bump does not support output '${output}'`)
        }

        const height = resolveNodeInput(node, 'height', 0.5, 'float')
        const strength = resolveNodeInput(node, 'strength', 1, 'float')
        const distance = resolveNodeInput(node, 'distance', 0.1, 'float')
        const normal = resolveNodeInput(node, 'normal', [0, 0, 1], 'vec3')
        const sign = node.properties?.isInversionEnabled ? '-1.0' : '1.0'

        result = {
          code: `luzCalculateBumpNormal(context, ${normal.code}, ${height.code}, ${strength.code}, ${distance.code}, ${sign})`,
          type: 'vec3'
        }
        break
      }
      default:
        throw new Error(`Unsupported material graph node type '${(node as MaterialNode).type}' in '${nodeId}'`)
    }

    resolving.delete(key)

    return emit(key, result)
  }

  const resolveGraphOutput = (name: MaterialGraphOutput, type: ValueType, fallback?: MaterialGraphValue): string => {
    const graphOutput = graph.outputs[name]

    if (!graphOutput && fallback === undefined) {
      throw new Error(`Material graph output '${name}' is missing`)
    }

    return convert(resolveInput(graphOutput ?? { value: fallback! }), type).code
  }

  const baseColor = resolveGraphOutput('baseColor', 'vec3')
  const alpha = resolveGraphOutput('alpha', 'float')
  const tangentNormal = resolveGraphOutput('normal', 'vec3')
  const metallic = resolveGraphOutput('metallic', 'float')
  const roughness = resolveGraphOutput('roughness', 'float')
  const occlusion = resolveGraphOutput('occlusion', 'float')
  const emissionColor = resolveGraphOutput('emissionColor', 'vec3')
  const emissionStrength = resolveGraphOutput('emissionStrength', 'float')
  const transmission = resolveGraphOutput('transmission', 'float')
  const indexOfRefraction = resolveGraphOutput('indexOfRefraction', 'float')
  const specularLevel = resolveGraphOutput('specularLevel', 'float', 0.5)
  const subsurfaceWeight = resolveGraphOutput('subsurfaceWeight', 'float', 0)
  const subsurfaceScale = resolveGraphOutput('subsurfaceScale', 'float', 0.01)
  const absorptionColor = graph.volume ? convert(resolveInput(graph.volume.color), 'vec3').code : 'vec3(1.0)'
  const absorptionDensity = graph.volume ? convert(resolveInput(graph.volume.density), 'float').code : '0.0'

  const principledWeights: string[] = []
  const glossyClosures: Array<{ color: string; roughness: string; normal: string; weight: string }> = []
  const closureEmissions: string[] = []

  interface CompiledClosure {
    coverage: string
    isEmissionOnly: boolean
  }

  const compileClosure = (closure: MaterialClosure, inheritedWeight = '1.0'): CompiledClosure => {
    if (closure.type === 'principled') {
      principledWeights.push(inheritedWeight)

      return { coverage: `((${inheritedWeight}) * clamp(${alpha}, 0.0, 1.0))`, isEmissionOnly: false }
    }

    if (closure.type === 'glossy') {
      if (glossyClosures.length >= 4) {
        throw new Error('Material graph uses more than 4 Glossy closures')
      }

      glossyClosures.push({
        color: convert(resolveInput(closure.color), 'vec3').code,
        roughness: convert(resolveInput(closure.roughness), 'float').code,
        normal: convert(resolveInput(closure.normal ?? { value: [0, 0, 1] }), 'vec3').code,
        weight: inheritedWeight
      })

      return { coverage: inheritedWeight, isEmissionOnly: false }
    }

    if (closure.type === 'transparent') {
      // Resolve color so linked nodes remain validated and part of topology;
      // alpha compositing itself is represented by this closure's zero coverage.
      resolveInput(closure.color)

      return { coverage: '0.0', isEmissionOnly: false }
    }

    if (closure.type === 'emission') {
      const color = convert(resolveInput(closure.color), 'vec3').code
      const strength = convert(resolveInput(closure.strength), 'float').code

      closureEmissions.push(`(${inheritedWeight} * ${color} * ${strength})`)

      return { coverage: inheritedWeight, isEmissionOnly: true }
    }

    if (closure.type === 'add') {
      const firstClosure = compileClosure(closure.firstClosure, inheritedWeight)
      const secondClosure = compileClosure(closure.secondClosure, inheritedWeight)

      // An Emission shader added to another closure contributes radiance but
      // does not block the background by itself. This is how Blender authors
      // glow around a partially transparent surface. A standalone/purely
      // emissive tree still has full coverage.
      if (firstClosure.isEmissionOnly && !secondClosure.isEmissionOnly) {
        return secondClosure
      }

      if (secondClosure.isEmissionOnly && !firstClosure.isEmissionOnly) {
        return firstClosure
      }

      return {
        coverage: `((${firstClosure.coverage}) + (${secondClosure.coverage}))`,
        isEmissionOnly: firstClosure.isEmissionOnly && secondClosure.isEmissionOnly
      }
    }

    const factor = convert(resolveInput(closure.factor), 'float').code
    const clampedFactor = `clamp(${factor}, 0.0, 1.0)`
    const firstClosure = compileClosure(closure.firstClosure, `(${inheritedWeight} * (1.0 - ${clampedFactor}))`)
    const secondClosure = compileClosure(closure.secondClosure, `(${inheritedWeight} * ${clampedFactor})`)

    return {
      coverage: `((${firstClosure.coverage}) + (${secondClosure.coverage}))`,
      isEmissionOnly: firstClosure.isEmissionOnly && secondClosure.isEmissionOnly
    }
  }
  const compiledSurface = compileClosure(graph.surface ?? { type: 'principled' })
  const principledWeight = principledWeights.length
    ? principledWeights.map((weight) => `(${weight})`).join(' + ')
    : '0.0'
  const closureEmission = closureEmissions.length ? closureEmissions.join(' + ') : 'vec3(0.0)'
  const glossyAssignments = glossyClosures
    .map(
      (closure, index) => `
  materialSample.glossy[${index}].color = ${closure.color};
  materialSample.glossy[${index}].roughness = clamp(${closure.roughness}, 0.0, 1.0);
  materialSample.glossy[${index}].tangentNormal = luzCalculateSafeTangentNormal(${closure.normal});
  materialSample.glossy[${index}].weight = clamp(${closure.weight}, 0.0, 1.0);`
    )
    .join('')

  const source = `${materialGraphHelpers}\n${declarations.join('\n')}\n
MaterialSample evaluateMaterial(MaterialContext context) {
${statements.join('\n')}
  MaterialSample materialSample;

  materialSample.baseColor = ${baseColor};
  materialSample.alpha = clamp(${compiledSurface.coverage}, 0.0, 1.0);
  materialSample.tangentNormal = luzCalculateSafeTangentNormal(${tangentNormal});
  materialSample.metallic = clamp(${metallic}, 0.0, 1.0);
  materialSample.roughness = clamp(${roughness}, 0.0, 1.0);
  materialSample.occlusion = clamp(${occlusion}, 0.0, 1.0);
  materialSample.emission = (${principledWeight}) * ${emissionColor} * ${emissionStrength} + ${closureEmission};
  materialSample.transmission = clamp(${transmission}, 0.0, 1.0);
  materialSample.indexOfRefraction = max(${indexOfRefraction}, 1.0001);
  materialSample.specularLevel = max(${specularLevel}, 0.0);
  materialSample.transmissionDepth = materialTransmissionDepth;
  materialSample.subsurfaceWeight = clamp(${subsurfaceWeight}, 0.0, 1.0);
  materialSample.subsurfaceScale = max(${subsurfaceScale}, 0.0);
  materialSample.absorptionColor = clamp(${absorptionColor}, 0.0, 1.0);
  materialSample.absorptionDensity = max(${absorptionDensity}, 0.0);
  materialSample.principledWeight = clamp(${principledWeight}, 0.0, 1.0);
  materialSample.glossyCount = ${glossyClosures.length};

  for (int index = 0; index < 4; ++index) {
    materialSample.glossy[index].color = vec3(0.0);
    materialSample.glossy[index].roughness = 0.5;
    materialSample.glossy[index].tangentNormal = vec3(0.0, 0.0, 1.0);
    materialSample.glossy[index].weight = 0.0;
  }
${glossyAssignments}

  return materialSample;
}`

  return { source, uniforms, textures }
}
