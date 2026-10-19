const localAssetLibraries = new Set(['blendkit', 'poliigon'])

export function resolveTextureUrl(path: string): string {
  const normalizedPath = path.replaceAll('\\', '/').replace(/^\.\//, '')
  const libraryName = normalizedPath.split('/', 1)[0].toLowerCase()
  const rootPath = localAssetLibraries.has(libraryName) ? './local-assets/' : './assets/'

  return rootPath + normalizedPath
}
