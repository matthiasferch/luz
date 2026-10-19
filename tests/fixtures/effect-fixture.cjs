const { MotionBlur } = require('../../packages/graphics/rendering/motion-blur-effect.ts')
const { TemporalHistory } = require('../../packages/graphics/rendering/temporal-history.ts')
const { AmbientOcclusion } = require('../../packages/graphics/rendering/ambient-occlusion-effect.ts')
const { FocusEffect } = require('../../packages/graphics/rendering/focus-effect.ts')
const { BloomEffect } = require('../../packages/graphics/rendering/bloom-effect.ts')

function createEffectFixture() {
  const effects = []
  const context = new Proxy(
    {},
    {
      get(target, key) {
        if (key in target) {
          return target[key]
        }

        const owner = effects.find((effect) => key in effect)
        const value = owner?.[key]

        return typeof value === 'function' ? value.bind(owner) : value
      },

      set(target, key, value) {
        const owner = effects.find((effect) => key in effect)

        if (owner) {
          owner[key] = value
        } else {
          target[key] = value
        }

        return true
      }
    }
  )

  const backend = new Proxy(
    {},
    {
      get(_target, managerName) {
        return new Proxy(
          {},
          {
            get(_manager, methodName) {
              return (...parameters) => context.backend[managerName][methodName](...parameters)
            }
          }
        )
      }
    }
  )
  const dependencies = Object.create(context)

  Object.defineProperty(dependencies, 'backend', { value: backend })
  effects.push(
    new MotionBlur(dependencies),
    new TemporalHistory(dependencies),
    new AmbientOcclusion(dependencies),
    new FocusEffect(dependencies),
    new BloomEffect(dependencies)
  )

  context.history = effects[1]

  for (const effect of effects) {
    effect.beginFrame?.(context)
  }

  return context
}
exports.createEffectFixture = createEffectFixture
