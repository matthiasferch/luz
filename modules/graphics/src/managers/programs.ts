import { mat2, mat3, mat4, vec2, vec3, vec4 } from '@luz/vectors'

import { Attribute } from '../types/attribute'
import { Program } from '../types/program'
import { Shader } from '../types/shader'
import { Texture } from '../types/texture'
import { Uniform } from '../types/uniform'
import { UniformBuffer } from '../buffers/uniform-buffer'

export class Programs {

  private programs: Program[] = []

  private usedProgram: Program

  constructor(private gl: WebGL2RenderingContext) { }

  create(vertexShader: Shader, fragmentShader: Shader): Program | null {
    let program = this.gl.createProgram() as Program

    this.gl.attachShader(program, vertexShader)
    this.gl.attachShader(program, fragmentShader)

    this.gl.linkProgram(program)

    const linked = this.gl.getProgramParameter(program, this.gl.LINK_STATUS) as boolean

    if (!linked || !this.gl.isProgram(program)) {
      // tslint:disable-next-line: no-console
      console.error(this.gl.getProgramInfoLog(program))

      return null
    }

    this.setupAttributes(program)

    this.setupUniforms(program)
    this.setupUniformBlocks(program)

    this.setupTexureSlots(program)

    this.programs.push(program)

    return program
  }

  update(program: Program, data?: {
    uniforms?: Record<string, Uniform.Value>,
    uniformBuffers?: Record<string, UniformBuffer>
  }) {
    this.use(program)

    if (data?.uniforms) {
      Object.keys(data.uniforms).forEach(name => {
        const value = data.uniforms[name]

        if (value === undefined) {
          // tslint:disable-next-line: no-console
          console.warn('Skipping undefined uniform value:', name)
          return
        }

        const uniform = program.uniforms[name]

        if (uniform) {
          switch (uniform.type) {
            case this.gl.SAMPLER_2D:
              const slot = program.textureSlots[name]
              const texture = value as Texture

              this.gl.activeTexture(this.gl.TEXTURE0 + slot)
              this.gl.bindTexture(texture.target, texture)
              break

            case this.gl.INT: {
              this.gl.uniform1i(uniform.location, value as number)
              break
            }

            case this.gl.FLOAT: {
              this.gl.uniform1f(uniform.location, value as number)
              break
            }

            case this.gl.FLOAT_VEC2: {
              this.gl.uniform2fv(uniform.location, value as vec2)
              break
            }

            case this.gl.FLOAT_VEC3: {
              this.gl.uniform3fv(uniform.location, value as vec3)
              break
            }

            case this.gl.FLOAT_VEC4: {
              this.gl.uniform4fv(uniform.location, value as vec4)
              break
            }

            case this.gl.FLOAT_MAT2: {
              this.gl.uniformMatrix2fv(uniform.location, false, value as mat2)
              break
            }

            case this.gl.FLOAT_MAT3: {
              const matrix = value as mat3
              this.gl.uniformMatrix3fv(uniform.location, false, matrix)
              break
            }

            case this.gl.FLOAT_MAT4: {
              const matrix = value as mat4
              this.gl.uniformMatrix4fv(uniform.location, false, matrix)
              break
            }

            default:
              // tslint:disable-next-line: no-console
              console.error('Failed to set uniform value:', name, value)
              break
          }
        } else {
          // tslint:disable-next-line: no-console
          console.warn('Attempting to update non-existent uniform:', name)
        }
      })
    }

    if (data?.uniformBuffers) {
      Object.keys(data.uniformBuffers).forEach((name) => {
        const uniformBlock = program.uniformBlocks[name]

        if (uniformBlock) {
          this.gl.bindBufferBase(this.gl.UNIFORM_BUFFER, uniformBlock.index, data.uniformBuffers[name])
        }
      })
    }
  }

  use(program: Program) {
    if (this.usedProgram === program) {
      return
    }

    this.gl.useProgram(program)

    this.usedProgram = program
  }

  private setupAttributes(program: Program) {
    program.attributes = {}

    const activeAttributes = this.gl.getProgramParameter(program, this.gl.ACTIVE_ATTRIBUTES) as number

    for (let index = 0; index < activeAttributes; index++) {
      const attribute = this.gl.getActiveAttrib(program, index) as Attribute
      const location = this.gl.getAttribLocation(program, attribute.name)

      attribute.location = location
      program.attributes[attribute.name] = attribute
    }
  }

  private setupUniforms(program: Program) {
    program.uniforms = {}

    const activeUniforms = this.gl.getProgramParameter(program, this.gl.ACTIVE_UNIFORMS)

    for (let uniformIndex = 0; uniformIndex < activeUniforms; uniformIndex++) {
      const uniform = this.gl.getActiveUniform(program, uniformIndex) as Uniform

      if (this.isUniformArray(uniform)) {
        const nameWithoutIndex = uniform.name.slice(0, -3)

        for (let arrayIndex = 0; arrayIndex < uniform.size; arrayIndex++) {
          const nameWithIndex = `${nameWithoutIndex}[${arrayIndex}]`
          const location = this.gl.getUniformLocation(program, nameWithIndex)

          if (location != null) {
            uniform.location = location
            program.uniforms[nameWithIndex] = uniform
          }
        }
      } else {
        const location = this.gl.getUniformLocation(program, uniform.name)

        if (location != null) {
          uniform.location = location
          program.uniforms[uniform.name] = uniform
        }
      }
    }
  }

  private setupUniformBlocks(program: Program) {
    program.uniformBlocks = {}

    const activeUniformBlocks = this.gl.getProgramParameter(program, this.gl.ACTIVE_UNIFORM_BLOCKS) as number

    for (let blockIndex = 0; blockIndex < activeUniformBlocks; blockIndex++) {
      const uniformBlockName = this.gl.getActiveUniformBlockName(program, blockIndex)
      const uniformBlockIndex = this.gl.getUniformBlockIndex(program, uniformBlockName)

      const uniformBlockBinding = uniformBlockIndex
      this.gl.uniformBlockBinding(program, uniformBlockIndex, uniformBlockBinding)

      const uniformIndices = this.gl.getActiveUniformBlockParameter(program, blockIndex, this.gl.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES) as number[]
      const uniformOffsets = this.gl.getActiveUniforms(program, uniformIndices, this.gl.UNIFORM_OFFSET) as number[]

      const uniformOffsetsByName = uniformIndices.reduce((offsets: Record<string, number>, uniformIndex, index) => {
        const uniform = this.gl.getActiveUniform(program, uniformIndex)
        offsets[uniform.name] = uniformOffsets[index]

        return offsets
      }, {})

      program.uniformBlocks[uniformBlockName] = {
        name: uniformBlockName,
        index: uniformBlockIndex,
        binding: uniformBlockBinding,
        offsets: uniformOffsetsByName
      }
    }
  }

  private setupTexureSlots(program: Program) {
    program.textureSlots = {}

    let slot = 0

    this.update(program)

    Object.keys(program.uniforms).forEach(name => {
      const uniform = program.uniforms[name]

      if (uniform.type === this.gl.SAMPLER_2D) {
        this.gl.uniform1i(uniform.location, slot)

        program.textureSlots[name] = slot

        slot = slot + 1
      }
    })
  }

  private isUniformArray(uniform: WebGLActiveInfo) {
    return uniform.size > 1
  }

}