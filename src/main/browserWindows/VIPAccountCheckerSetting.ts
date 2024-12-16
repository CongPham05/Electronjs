import { is } from '@electron-toolkit/utils'
import { BrowserWindow, shell } from 'electron'
import { join } from 'path'

export function createVIPAccountCheckerSettingWindow(parent: BrowserWindow) {
  const VIPAccountCheckerSetting = new BrowserWindow({
    parent: parent,
    modal: true,
    width: 224,
    height: 182,
    show: true,
    resizable: false,
    minimizable: false,
    autoHideMenuBar: true,
    center: true,
    title: 'VIP Account Checker Setting',
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

  VIPAccountCheckerSetting.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    VIPAccountCheckerSetting.loadURL('http://localhost:5173/#/VIPAccountCheckerSetting')
  } else {
    VIPAccountCheckerSetting.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: 'VIPAccountCheckerSetting'
    })
  }
  return VIPAccountCheckerSetting
}
