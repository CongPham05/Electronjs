import { is } from '@electron-toolkit/utils'
import { BrowserWindow, shell } from 'electron'
import { join } from 'path'

export function createDelayedLoginSettingWindow(parent: BrowserWindow) {
  const delayedLoginSetting = new BrowserWindow({
    parent: parent,
    modal: true,
    width: 370,
    height: 170,
    show: true,
    resizable: false,
    autoHideMenuBar: true,
    center: true,
    title: 'Delayed Login Setting',
    vibrancy: 'under-window',
    alwaysOnTop: true,
    visualEffectState: 'active',
    trafficLightPosition: { x: 15, y: 10 },
    icon: 'resources/icon.png',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  delayedLoginSetting.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    delayedLoginSetting.loadURL('http://localhost:5173/#/delayedLoginSetting')
  } else {
    delayedLoginSetting.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: 'delayedLoginSetting'
    })
  }
  return delayedLoginSetting
}
