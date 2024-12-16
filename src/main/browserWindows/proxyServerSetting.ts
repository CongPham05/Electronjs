import { is } from '@electron-toolkit/utils'
import { BrowserWindow, shell } from 'electron'
import { join } from 'path'

export function createProxyServerSettingWindow(parent: BrowserWindow) {
  const proxyServerSetting = new BrowserWindow({
    parent: parent,
    modal: true,
    width: 280,
    height: 240,
    show: true,
    resizable: false,
    autoHideMenuBar: true,
    center: true,
    title: 'Proxy Server Setting',
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

  proxyServerSetting.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    proxyServerSetting.loadURL('http://localhost:5173/#/proxyServerSetting')
  } else {
    proxyServerSetting.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: 'proxyServerSetting'
    })
  }
  return proxyServerSetting
}
