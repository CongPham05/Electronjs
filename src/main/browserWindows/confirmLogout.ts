import { BrowserWindow } from 'electron'
import { join } from 'path'

import { is } from '@electron-toolkit/utils'

export function createConfirmLogoutWindow(parent: BrowserWindow) {
  const confirmLogoutWindow = new BrowserWindow({
    parent,
    modal: true,
    frame: false,
    transparent: true,
    width: 290,
    height: 150,
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
    confirmLogoutWindow.loadURL('http://localhost:5173/#/confirmLogout')
  } else {
    confirmLogoutWindow.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: 'confirmLogout'
    })
  }
  return confirmLogoutWindow
}
