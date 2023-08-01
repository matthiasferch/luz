import { State } from './state'
import { Display } from './display'
import { Program } from '../types/program'
import { Uniform } from '../types/uniform'
import { Meshes } from '../managers/meshes'
import { Programs } from '../managers/programs'
import { Samplers } from '../managers/samplers'
import { Shaders } from '../managers/shaders'
import { Textures } from '../managers/textures'
import { Buffers } from '../managers/buffers'

export class Renderer {

  readonly shaders: Shaders
  readonly programs: Programs

  readonly buffers: Buffers
  readonly textures: Textures
  readonly samplers: Samplers

  readonly state: State
  readonly display: Display

  readonly meshes: Meshes

  constructor(private gl: WebGL2RenderingContext) {
    this.shaders = new Shaders(this.gl)
    this.programs = new Programs(this.gl)

    this.buffers = new Buffers(this.gl)
    this.textures = new Textures(this.gl)
    this.samplers = new Samplers(this.gl)

    this.display = new Display(this.gl)
    this.state = new State(this.gl)

    this.meshes = new Meshes(this.gl)
  }

  render<T extends {}>(camera: Camera, model: Model, lights: Light[], program: Program, uniforms?: T) {
    if (camera) {
      // camera uniforms
      this.programs.update(program, {
        uniforms: this.collectUniformValues(program, { camera })
      })
    }

    if (lights) {
      // light uniforms
      this.programs.update(program, {
        uniforms: this.collectUniformValues(program, { lights })
      })
    }

    // model uniforms
    this.programs.update(program, {
      uniforms: this.collectUniformValues(program, { model })
    })

    if (uniforms) {
      // additional uniforms
      this.programs.update(program, {
        uniforms: this.collectUniformValues(program, uniforms)
      })
    }

    this.meshes.render(model.mesh)
  }

  private collectUniformValues(program: Program, uniformValues: any) {
    let collectedUniformValues: Record<string, Uniform.Value> = {}

    const collectRecursively = (values: any, prefix?: string) => {
      Object.entries(values).forEach(([name, value]: [string, any]) => {
        let uniformName = prefix ? `${prefix}.${name}` : name

        if (program.uniforms.hasOwnProperty(uniformName)) {
          collectedUniformValues[uniformName] = value
        } else if (Array.isArray(value)) {
          value.forEach((element, index) => {
            collectRecursively(element, `${uniformName}[${index}]`)
          })
        } else {
          collectRecursively(value, name)
        }
      })
    }

    collectRecursively(uniformValues)

    return collectedUniformValues
  }

}