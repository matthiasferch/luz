import { describe, expect, it } from 'vitest'

import { resolveTextureUrl } from '../src/resources/asset-path'

describe('texture URL resolution', () => {
  it('resolves first-party textures from public assets', () => {
    expect(resolveTextureUrl('textures/wood/base-color.png')).toBe('./assets/textures/wood/base-color.png')
  })
  it.each(['blendkit', 'poliigon'])('resolves %s textures from local assets', (libraryName) => {
    expect(resolveTextureUrl(`${libraryName}/material/texture.jpg`)).toBe(
      `./local-assets/${libraryName}/material/texture.jpg`
    )
  })
  it('normalizes Blender-style relative Windows paths', () => {
    expect(resolveTextureUrl('.\\poliigon\\material\\texture.jpg')).toBe('./local-assets/poliigon/material/texture.jpg')
  })
})
