import { BrowserWindow } from 'electron'
import { join } from 'path'

import { is } from '@electron-toolkit/utils'

export function createSportsBookPerMatchLimitSettingWindow(parent: BrowserWindow) {
  const sportsBookPerMatchLimitSetting = new BrowserWindow({
    parent,
    modal: true,
    width: 940,
    height: 618,
    show: true,
    autoHideMenuBar: true,
    center: true,
    title: 'SportsBook - Per-Match Limit Setting Window',
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
    sportsBookPerMatchLimitSetting.loadURL('http://localhost:5173/#/sportsBookPerMatchLimitSetting')
  } else {
    sportsBookPerMatchLimitSetting.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: 'sportsBookPerMatchLimitSetting'
    })
  }
  return sportsBookPerMatchLimitSetting
}
