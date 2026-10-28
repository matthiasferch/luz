const fs = require('node:fs')
const path = require('node:path')

const textureHashes = {
  'environments/studio/irradiance.ktx': '89d1afea6c5725d7b5d4789286c6e0008c461f12c933512b1bbf7f238481b6ce',
  'environments/studio/radiance.ktx': '4c03c55932871087219413ed32f2cb534667e57cfc72796dd14afdada742434a',
  'environments/studio/sky.ktx': 'eb40f40d2784af3c13570bca206fca556a12a737ab54f567cd465293187cc2ad',
  'textures/galvanizedMetal/baseColor.jpg': 'f89631556587042a5973806c822af39928098743c28effcbab531d3dc68d7421',
  'textures/galvanizedMetal/metallic.jpg': '5f8ecd7ef3ac085d42b65f26c6ed099dbb8c25d687973e6bb60abd8b7e788e87',
  'textures/galvanizedMetal/normal.jpg': '0f49cbf317e84b7e0f058fa692b13c97b66daa75a77b3215bc21772cc931514e',
  'textures/galvanizedMetal/roughness.jpg': 'd34b92bb2514c17cff0922371b63820cebfba749ecf309e6511f8c7060703a2f'
}

const readDemoTextures = () =>
  Object.fromEntries(
    Object.keys(textureHashes).map((filename) => [
      filename,
      fs.readFileSync(path.resolve(__dirname, '../demo-assets', filename))
    ])
  )

module.exports = { readDemoTextures, textureHashes }
