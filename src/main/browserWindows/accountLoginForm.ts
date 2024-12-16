import { is } from '@electron-toolkit/utils'
import { BrowserWindow, shell } from 'electron'
import { join } from 'path'

export function createAccountLoginFormWindow(parent: BrowserWindow, platform: string) {
  const accountLoginForm = new BrowserWindow({
    parent: parent,
    modal: true,
    width: 406,
    height: 500,
    show: true,
    resizable: false,
    autoHideMenuBar: true,
    center: true,
    title: `Pin${platform} Account Login Form`,
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

  accountLoginForm.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    accountLoginForm.loadURL('http://localhost:5173/#/accountLoginForm')
  } else {
    accountLoginForm.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: 'accountLoginForm'
    })
  }
  return accountLoginForm
}
