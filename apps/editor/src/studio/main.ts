import { createApp } from 'vue'
import '../../styles.css'
import './studio.css'
import { createEditorStore, editorStoreKey } from '../editor/editor-store'
import Studio from './StudioWorkspace.vue'

createApp(Studio).provide(editorStoreKey, createEditorStore()).mount('#editor')
