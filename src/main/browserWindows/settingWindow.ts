import { BrowserWindow } from 'electron'
import { join } from 'path'

import { is } from '@electron-toolkit/utils'

export function createSettingWindow(parent: BrowserWindow) {
  const settingWindow = new BrowserWindow({
    parent,
    modal: true,
    width: 642,
    height: 700,
    show: true,
    resizable: false,
    autoHideMenuBar: true,
    center: true,
    title: 'Settings',
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
    settingWindow.loadURL('http://localhost:5173/#/setting')
  } else {
    settingWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'setting' })
  }
  return settingWindow
}
