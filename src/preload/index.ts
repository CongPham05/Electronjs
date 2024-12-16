import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

if (!process.contextIsolated) {
  throw new Error('Context Isolation must be enabled in the BrowserWindow')
}

try {
  contextBridge.exposeInMainWorld('electron', electronAPI)
} catch (error) {
  console.error('Failed to expose electron API in the main world:', error)
}
