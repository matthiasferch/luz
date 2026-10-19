import helperSource from './helpers.glsl'
import defaultSource from './default.glsl'

export const materialGraphHelpers: string = helperSource
export const defaultMaterialGraphSource = `${materialGraphHelpers}
${defaultSource}`
