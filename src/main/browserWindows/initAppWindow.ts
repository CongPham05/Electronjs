import { BrowserWindow } from 'electron'
import { join } from 'path'

import { is } from '@electron-toolkit/utils'

export function createInitAppWindow() {
  const initAppWindow = new BrowserWindow({
    frame: false,
    transparent: true,
    roundedCorners: false,
    width: 380,
    height: 180,
    show: true,
    autoHideMenuBar: true,
    center: true,
    resizable: false,
    vibrancy: 'under-window',
    visualEffectState: 'active',
    trafficLightPosition: { x: 15, y: 10 },
    icon: 'resources/icon.png',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    initAppWindow.loadURL('http://localhost:5173/#/initApp')
  } else {
    initAppWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'initApp' })
  }
  return initAppWindow
}
