import { BrowserWindow } from 'electron'
import { join } from 'path'

import { is } from '@electron-toolkit/utils'

export function createListSportsBook(parent: BrowserWindow) {
  const listSportBookWindow = new BrowserWindow({
    parent,
    modal: true,
    width: 460,
    height: 560,
    show: true,
    resizable: false,
    autoHideMenuBar: true,
    center: true,
    title: 'URL Searcher Form',
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

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    listSportBookWindow.loadURL('http://localhost:5173/#/listSportBook')
  } else {
    listSportBookWindow.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: 'listSportBook'
    })
  }

  return listSportBookWindow
}
