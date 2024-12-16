import { BrowserWindow } from 'electron'
import { join } from 'path'

import { is } from '@electron-toolkit/utils'

export function createProxyServerSettingGeneralWindow(parent: BrowserWindow) {
  const proxyServerSettingsGeneral = new BrowserWindow({
    parent,
    modal: true,
    width: 280,
    height: 240,
    show: true,
    resizable: false,
    autoHideMenuBar: true,
    center: true,
    title: 'Proxy Server Setting ',
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
    proxyServerSettingsGeneral.loadURL('http://localhost:5173/#/proxyServerSettingsGeneral')
  } else {
    proxyServerSettingsGeneral.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: 'proxyServerSettingsGeneral'
    })
  }
  return proxyServerSettingsGeneral
}
