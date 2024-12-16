import { is } from '@electron-toolkit/utils'
import { BrowserWindow, shell } from 'electron'
import { join } from 'path'

export function createAccountPairWindow(parent: BrowserWindow) {
  const accountPairWindow = new BrowserWindow({
    parent: parent,
    modal: true,
    width: 1286,
    height: 790,
    show: true,
    autoHideMenuBar: true,
    center: true,
    title: 'AccountInstance Combination Setting',
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

  accountPairWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    accountPairWindow.loadURL('http://localhost:5173/#/accountPair')
  } else {
    accountPairWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'accountPair' })
  }
  return accountPairWindow
}
