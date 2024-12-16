import { is } from '@electron-toolkit/utils'
import { BrowserWindow, shell } from 'electron'
import { join } from 'path'

export function createAddSelectedAccountPairWindow(parent: BrowserWindow) {
  const addSelectedAccountPair = new BrowserWindow({
    parent: parent,
    modal: true,
    width: 545,
    height: 430,
    show: true,
    resizable: false,
    autoHideMenuBar: true,
    center: true,
    title: 'Add Selected Account Pair',
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

  addSelectedAccountPair.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    addSelectedAccountPair.loadURL('http://localhost:5173/#/addSelectedAccountPair')
  } else {
    addSelectedAccountPair.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: 'addSelectedAccountPair'
    })
  }
  return addSelectedAccountPair
}
