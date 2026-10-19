import type { MaterialClosure, MaterialGraph, MaterialGraphInput } from '../../renderer/material-graph'

const sortTopologyValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sortTopologyValue)
  }

  if (!value || typeof value !== 'object') {
    return value
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
      .map(([key, child]) => [key, sortTopologyValue(child)])
  )
}

const createTopologyValue = (input: MaterialGraphInput): unknown => {
  if ('node' in input) {
    return input
  }

  const value = input.value

  return { valueType: Array.isArray(value) ? `vec${value.length}` : 'float' }
}

const createTopologyClosure = (closure: MaterialClosure): unknown => {
  if (closure.type === 'principled') {
    return closure
  }

  if (closure.type === 'glossy') {
    return {
      type: closure.type,
      color: createTopologyValue(closure.color),
      roughness: createTopologyValue(closure.roughness),
      normal: closure.normal ? createTopologyValue(closure.normal) : undefined
    }
  }

  if (closure.type === 'transparent') {
    return {
      type: closure.type,
      color: createTopologyValue(closure.color)
    }
  }

  if (closure.type === 'emission') {
    return {
      type: closure.type,
      color: createTopologyValue(closure.color),
      strength: createTopologyValue(closure.strength)
    }
  }

  if (closure.type === 'add') {
    return {
      type: closure.type,
      firstClosure: createTopologyClosure(closure.firstClosure),
      secondClosure: createTopologyClosure(closure.secondClosure)
    }
  }

  return {
    type: closure.type,
    factor: createTopologyValue(closure.factor),
    firstClosure: createTopologyClosure(closure.firstClosure),
    secondClosure: createTopologyClosure(closure.secondClosure)
  }
}

export function createTopologyKey(graph: MaterialGraph): string {
  return JSON.stringify(
    sortTopologyValue({
      version: graph.version,
      nodes: Object.fromEntries(
        Object.entries(graph.nodes).map(([id, node]) => [
          id,
          {
            ...node,
            inputs: Object.fromEntries(
              Object.entries(node.inputs ?? {}).flatMap(([name, value]) =>
                value === undefined ? [] : [[name, createTopologyValue(value)]]
              )
            ),
            surface: node.surface ? true : undefined
          }
        ])
      ),
      outputs: Object.fromEntries(
        Object.entries(graph.outputs).map(([name, value]) => [name, createTopologyValue(value)])
      ),
      surface: createTopologyClosure(graph.surface ?? { type: 'principled' }),
      volume: graph.volume
        ? {
            type: graph.volume.type,
            color: createTopologyValue(graph.volume.color),
            density: createTopologyValue(graph.volume.density)
          }
        : undefined
    })
  )
}
