import { materialNodeLayouts, type MaterialGraph, type NodeLayout } from '@luz/formats'
import { readDefinition } from '@luz/serialization'
import { Surface } from './surface'

const layouts: Readonly<Record<string, NodeLayout>> = materialNodeLayouts

const validateFields = (data: Record<string, unknown>, fields: readonly string[], context: string): void => {
  for (const name of Object.keys(data)) {
    if (!fields.includes(name)) {
      throw new Error(`${context} has unsupported field '${name}'`)
    }
  }
}

export function validateMaterialGraph(value: unknown): asserts value is MaterialGraph {
  const graph = readDefinition(value, 'Material graph')

  if (graph.version !== 1) {
    throw new Error(`Unsupported material graph version '${String(graph.version)}'`)
  }

  validateFields(graph, ['version', 'nodes', 'outputs', 'surface', 'volume'], 'Material graph')

  const nodes = readDefinition(graph.nodes, 'Material graph nodes')
  const outputs = readDefinition(graph.outputs, 'Material graph outputs')
  const requiredOutputs = [
    'baseColor',
    'alpha',
    'normal',
    'metallic',
    'roughness',
    'occlusion',
    'emissionColor',
    'emissionStrength',
    'transmission',
    'indexOfRefraction'
  ]

  for (const name of requiredOutputs) {
    if (!Object.prototype.hasOwnProperty.call(outputs, name)) {
      throw new Error(`Material graph output '${name}' is missing`)
    }
  }

  validateFields(
    outputs,
    [...requiredOutputs, 'specularLevel', 'subsurfaceWeight', 'subsurfaceScale'],
    'Material outputs'
  )

  const validateInput = (value: unknown, context: string): void => {
    const input = readDefinition(value, context)

    if ('node' in input) {
      validateFields(input, ['node', 'output'], context)

      if (typeof input.node !== 'string' || !Object.prototype.hasOwnProperty.call(nodes, input.node)) {
        throw new Error(`${context} references missing node '${String(input.node)}'`)
      }

      if (typeof input.output !== 'string' || !input.output) {
        throw new Error(`${context} has an empty or invalid output socket`)
      }
    } else {
      validateFields(input, ['value'], context)

      const values = Array.isArray(input.value) ? input.value : [input.value]

      if (
        (Array.isArray(input.value) && (values.length < 2 || values.length > 4)) ||
        values.some((component: unknown) => typeof component !== 'number' || !Number.isFinite(component))
      ) {
        throw new Error(`${context} requires a finite constant with between 2 and 4 vector components`)
      }
    }
  }

  for (const [name, input] of Object.entries(outputs)) {
    validateInput(input, `Material output '${name}'`)
  }

  for (const [id, value] of Object.entries(nodes)) {
    const node = readDefinition(value, `Node '${id}'`)

    if (typeof node.type !== 'string' || !Object.prototype.hasOwnProperty.call(layouts, node.type)) {
      throw new Error(`Unsupported material graph node type '${String(node.type)}' in '${id}'`)
    }

    const layout = layouts[node.type]
    const context = `Node '${id}' (${node.type})`
    const inputs = node.inputs === undefined ? {} : readDefinition(node.inputs, `${context} inputs`)
    const properties = node.properties === undefined ? {} : readDefinition(node.properties, `${context} properties`)

    validateFields(
      node,
      ['type', 'inputs', 'properties', ...(node.type === 'imageTexture' ? ['surface'] : [])],
      context
    )

    for (const [name, input] of Object.entries(inputs)) {
      const isIndexedInput = layout.indexedInputs?.some((prefix) => new RegExp(`^${prefix}(0|[1-9][0-9]*)$`).test(name))

      if (!layout.inputs.includes(name) && !isIndexedInput) {
        throw new Error(`${context} has unsupported input '${name}'`)
      }

      if (input !== undefined) {
        validateInput(input, `${context} input '${name}'`)
      }
    }

    for (const [name, property] of Object.entries(properties)) {
      const rule = Object.prototype.hasOwnProperty.call(layout.properties, name) ? layout.properties[name] : undefined

      if (
        !rule ||
        (Array.isArray(rule) ? !rule.includes(property) : typeof property !== rule) ||
        (typeof property === 'number' && !Number.isFinite(property))
      ) {
        throw new Error(`${context} has unsupported or invalid property '${name}'`)
      }
    }

    if (node.type === 'imageTexture') {
      Surface.createFromDefinition(node.surface)
    }
  }

  let glossyCount = 0

  const validateClosure = (value: unknown, context: string): void => {
    const closure = readDefinition(value, context)

    switch (closure.type) {
      case 'principled':
        validateFields(closure, ['type'], context)

        return
      case 'glossy':
        glossyCount++

        validateFields(closure, ['type', 'color', 'roughness', 'normal'], context)
        validateInput(closure.color, `${context} color`)
        validateInput(closure.roughness, `${context} roughness`)

        if (closure.normal !== undefined) {
          validateInput(closure.normal, `${context} normal`)
        }

        return
      case 'transparent':
        validateFields(closure, ['type', 'color'], context)
        validateInput(closure.color, `${context} color`)

        return
      case 'emission':
        validateFields(closure, ['type', 'color', 'strength'], context)
        validateInput(closure.color, `${context} color`)
        validateInput(closure.strength, `${context} strength`)

        return
      case 'add':
      case 'mix':
        validateFields(
          closure,
          ['type', 'firstClosure', 'secondClosure', ...(closure.type === 'mix' ? ['factor'] : [])],
          context
        )

        if (closure.type === 'mix') {
          validateInput(closure.factor, `${context} factor`)
        }

        validateClosure(closure.firstClosure, `${context} first branch`)
        validateClosure(closure.secondClosure, `${context} second branch`)

        return
      default:
        throw new Error(`${context} has unsupported closure type '${String(closure.type)}'`)
    }
  }

  validateClosure(graph.surface ?? { type: 'principled' }, 'Material surface')

  if (glossyCount > 4) {
    throw new Error(`Material graph uses ${glossyCount} Glossy closures, exceeding the limit of 4`)
  }

  if (graph.volume !== undefined) {
    const volume = readDefinition(graph.volume, 'Material volume')

    if (volume.type !== 'absorption') {
      throw new Error(`Material volume has unsupported closure type '${String(volume.type)}'`)
    }

    validateFields(volume, ['type', 'color', 'density'], 'Material volume')
    validateInput(volume.color, 'Material volume color')
    validateInput(volume.density, 'Material volume density')
  }
}
