declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>
  export default component
}

declare const __EDITOR_VERSION__: string
declare const __EDITOR_DEVELOPMENT__: boolean
declare const __EDITOR_SCENES__: import('./editor/scene-catalog').SceneDescriptor[]
