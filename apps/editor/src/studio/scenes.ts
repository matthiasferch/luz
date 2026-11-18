import type { AnimationGroup } from '../editor/editor-api'
import type { Editor, SceneSource } from '../runtime/editor-runtime'
import type { SceneSettings } from '../settings'

interface ExportFile {
  path: string
  size: number
  digest: string
}
export interface Draft {
  project: string
  revision: string
  entry: string
  files: ExportFile[]
}
export interface Preset {
  settings: SceneSettings
  animations: AnimationGroup[]
}
interface PublishedFile {
  path: string
  size: number
  blocks: string[]
}
interface Publication {
  version: number
  entry: string
  preset: Preset
  files: PublishedFile[]
}
export interface Listing {
  id: string
  project: string
  title: string
  version: number
  isPublished: number
}

export const maximumSceneSize = 250 * 1024 * 1024

const blockSize = 8 * 1024 * 1024

export async function requestStudio(path: string, options?: RequestInit) {
  const response = await fetch(path, { ...options, cache: 'no-store', redirect: 'manual' })

  if (response.type === 'opaqueredirect' || response.status === 401 || response.status === 403) {
    throw new Error('Open My scenes to sign in, then return to this tab.')
  }

  if (!response.ok) {
    throw new Error((await response.text()).slice(0, 240) || 'Studio request failed')
  }

  return response
}

export async function getListings(): Promise<Listing[]> {
  return (await requestStudio('/scenes/api')).json()
}

export function capturePreset(editor: Editor): Preset {
  return { settings: editor.captureEditorState().settings, animations: editor.collectAnimationGroups() }
}

export function restoreAnimations(editor: Editor, preset: Preset) {
  for (const group of editor.collectAnimationGroups()) {
    const saved = preset.animations.find((entry) => entry.key === group.key)

    if (!saved) {
      continue
    }

    const weights: Record<string, number> = {}

    for (const clip of group.clips) {
      const previous = saved.clips.find((entry) => entry.name === clip.name)

      if (!previous) {
        continue
      }

      weights[clip.name] = previous.weight

      if (previous.playback) {
        editor.setAnimationPlayback(group.key, clip.name, previous.playback)
      }
    }

    if (Object.keys(weights).length) {
      editor.setAnimationMix(group.key, weights, 0, true)
      editor.setAnimationSpeed(group.key, saved.speed)
      editor.controlAnimation(group.key, saved.isPaused ? 'pause' : 'resume')
    }
  }
}

export function createSceneSource(files: Map<string, () => Promise<Blob>>, settings?: SceneSettings): SceneSource {
  const root = new URL('/__scene/' + crypto.randomUUID() + '/', location.origin).href
  const readFile = async (url: string, signal?: AbortSignal) => {
    signal?.throwIfAborted()

    const read = url.startsWith(root) ? files.get(decodeURIComponent(url.slice(root.length))) : undefined

    if (!read) {
      throw new Error('Missing or external scene dependency: ' + url)
    }

    return read()
  }

  return {
    root,
    settings,
    readJson: async (url, signal) => JSON.parse(await (await readFile(url, signal)).text()) as unknown,

    readBinary: async (url, signal) => (await readFile(url, signal)).arrayBuffer()
  }
}

export async function getPublication(id: string) {
  const base = '/api/scene/' + encodeURIComponent(id)
  const publication: Publication = await (await requestStudio(base)).json()
  const files = new Map(
    publication.files.map((file) => [
      file.path,
      async () => {
        const parts = []

        for (const digest of file.blocks) {
          const block = await requestStudio(base + '/' + publication.version + '/' + digest)

          parts.push(await block.blob())
        }

        return new Blob(parts)
      }
    ])
  )

  return {
    source: createSceneSource(files, publication.preset.settings),
    entry: publication.entry,
    preset: publication.preset
  }
}

export function createDraftSource(draft: Draft, blobs: Map<string, Blob>, settings?: SceneSettings) {
  const files = new Map<string, () => Promise<Blob>>()

  let size = 0

  for (const file of draft.files) {
    const blob = blobs.get(file.digest)

    if (!blob || blob.size !== file.size) {
      throw new Error('Missing scene dependency: ' + file.path)
    }

    files.set(file.path, () => Promise.resolve(blob))

    size += file.size
  }

  if (size > maximumSceneSize) {
    throw new Error('Scene exceeds 250 MiB')
  }

  return createSceneSource(files, settings)
}

export async function publishScene(
  draft: Draft,
  blobs: Map<string, Blob>,
  preset: Preset,
  onProgress: (count: number) => void
): Promise<{ id: string }> {
  const listings = await getListings()
  const version = listings.find((scene) => scene.project === draft.project)?.version ?? 0
  const files: PublishedFile[] = []
  const uploaded = new Set<string>()

  let size = 0

  for (const file of draft.files) {
    const blob = blobs.get(file.digest)

    if (!blob) {
      throw new Error('Missing scene dependency: ' + file.path)
    }

    const blocks = []

    for (let offset = 0; offset < blob.size; offset += blockSize) {
      const block = blob.slice(offset, offset + blockSize)
      const contents = await block.arrayBuffer()
      const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', contents))
      const digest = Array.from(hash, (byte) => byte.toString(16).padStart(2, '0')).join('')

      if (!uploaded.has(digest)) {
        await requestStudio('/scenes/api/blocks/' + digest, { method: 'PUT', body: contents })
        uploaded.add(digest)
      }

      blocks.push(digest)

      size += block.size

      onProgress(size)
    }

    files.push({ path: file.path, size: file.size, blocks })
  }

  const result = await requestStudio('/scenes/api/projects/' + draft.project, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'If-Match': String(version) },
    body: JSON.stringify({ entry: draft.entry, files, preset })
  })

  return result.json()
}
