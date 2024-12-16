/* eslint-disable @typescript-eslint/no-explicit-any */
import { join } from 'path'
import {
  PlatformType,
  SettingBetListType,
  SettingContraListType,
  SettingSuccessListType,
  SettingType,
  SettingWaitingListType
} from '@shared/types'

import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { createMainWindow } from '@/browserWindows/mainWindow'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { createInitAppWindow } from '@/browserWindows/initAppWindow'
import Model, {
  Account,
  clearTable,
  NameLeague,
  NameTeam,
  Platform,
  Setting,
  SettingBetList,
  SettingContraList,
  SettingSuccessList,
  SettingWaitingList,
  SportsBook
} from '@db/model'

function createWindow(): void {
  const loginWindow = new BrowserWindow({
    frame: false,
    transparent: true,
    roundedCorners: false,
    width: 228,
    height: 274,
    show: false,
    autoHideMenuBar: true,
    center: true,
    resizable: false,
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

  ipcMain.on('AttemptLogin', async (event, { username, password }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL}/user/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      if (!response.ok) {
        return event.reply('LoginResult', { success: false, message: 'Invalid credentials.' })
      }

      const {
        data: { accessToken, account }
      } = await response.json()
      event.reply('LoginResult', { success: true })
      loginWindow.close()
      const initAppWindow = createInitAppWindow()

      // Function to fetch and process data
      const fetchData = async (url: string, model: Model, mapFn: any) => {
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` }
          })

          if (!response.ok) {
            console.error(`Error fetching ${url}:`, response.statusText)
            return
          }

          const {
            data: { rows }
          } = await response.json()

          if (model === Platform) {
            const existingRecords = Platform.findAll() as PlatformType[]
            const platformNamesFromApi = new Set(
              rows.map(
                (platform: { id: string; platformName: string; url: string }) =>
                  platform.platformName
              )
            )

            for (const platform of rows) {
              const existingRecord = Platform.findOne({ uuid: platform.id })

              if (!existingRecord) {
                Platform.create({
                  uuid: platform.id,
                  name: platform.platformName,
                  url: platform.url
                })
              }
            }
            for (const record of existingRecords) {
              if (!platformNamesFromApi.has(record.name)) {
                Platform.delete({ name: record.name })
                Account.deleteMany({ platformName: record.name })
                SportsBook.deleteMany({ platform: record.name })
              }
            }
          } else {
            for (const item of rows) {
              const mappedData = mapFn(item)

              if (mappedData !== null) {
                const existingRecord = model.findOne({ ...mappedData.findCriteria })

                if (!existingRecord) {
                  model.create(mappedData.data)
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching ${url}:`, error)
        }
      }

      // Fetch platforms
      await fetchData(
        `${import.meta.env.VITE_URL}/user/platform`,
        Platform,
        (platform: { id: string; platformName: string; url: string }) => ({
          findCriteria: { name: platform.platformName },
          data: { uuid: platform.id, name: platform.platformName, url: platform.url }
        })
      )

      //Fetch leagues
      await fetchData(
        `${import.meta.env.VITE_URL}/user/league`,
        NameLeague,
        (league: {
          leagueId: string
          leagueName: string
          standardLeagueName: null | string
          platformId: string
          platformName: string
          platformUrl: string
        }) => {
          const platform = Platform.findOne({ name: league.platformName }) as PlatformType
          if (!platform) return null
          return {
            findCriteria: { nameLeague: league.leagueName, platform: league.platformName },
            data: {
              nameLeague: league.leagueName,
              platform: league.platformName,
              idPlatform: platform.id,
              league: league.standardLeagueName
            }
          }
        }
      )

      // Fetch teams
      await fetchData(
        `${import.meta.env.VITE_URL}/user/team`,
        NameTeam,
        (team: {
          teamId: string
          teamName: string
          standardTeamName: null | string
          platformId: string
          platformName: string
          platformUrl: string
          leagueId: string
          leagueName: string
          standardLeagueName: null | string
        }) => {
          const platform = Platform.findOne({ name: team.platformName }) as PlatformType
          if (!platform) return null
          return {
            findCriteria: { nameTeam: team.teamName, platform: team.platformName },
            data: {
              nameTeam: team.teamName,
              nameLeague: team.leagueName,
              platform: team.platformName,
              idPlatform: platform.id,
              team: team.standardTeamName,
              league: team.standardLeagueName
            }
          }
        }
      )

      initAppWindow.close()
      createMainWindow(account)
    } catch (error) {
      if (error instanceof Error) {
        console.error('Login error:', error)
        event.reply('LoginResult', {
          success: false,
          message: `Login Fail: ${error.message}`
        })
      } else {
        console.error('Login error:', error)
        event.reply('LoginResult', {
          success: false,
          message: 'An error occurred during login. Please try again.'
        })
      }
    }
  })

  ipcMain.on('CloseLoginWindow', () => {
    loginWindow.close()
    app.quit()
  })

  loginWindow.on('ready-to-show', () => {
    loginWindow.show()
  })

  loginWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    loginWindow.loadURL('http://localhost:5173/#/login')
  } else {
    loginWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'login' })
  }
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  clearTable('P88Bet')
  clearTable('Viva88Bet')

  clearTable('EventViva88')
  clearTable('LeagueViva88')

  clearTable('NameLeague')
  clearTable('NameTeam')

  clearTable('DataBet')
  clearTable('BetListResult')
  clearTable('WaitingList')
  clearTable('ContraList')
  clearTable('SuccessList')

  Account.update(
    {},
    {
      status: 'Login',
      statusLogin: null,
      credit: '0',
      autoLogin: 0,
      textLog: null,
      host: null,
      cookie: null,
      socketUrl: null
    }
  )

  const dataSetting = Setting.findAll() as SettingType[]
  if (!dataSetting.length) {
    Setting.create({
      profitMin: 0.03,
      profitMax: 0.7,
      gameType: 'Early',
      enablePerMatchLimitSetting: 0,
      ipAddress: '',
      port: '0',
      username: '',
      password: ''
    })
    Account.updateTypeCrawlForRefresh('Early')
  } else {
    Account.updateTypeCrawlForRefresh(dataSetting[0].gameType)
  }

  const settingBetList = SettingBetList.findAll() as SettingBetListType[]
  if (!settingBetList.length) {
    SettingBetList.create({ clear: 1 })
  } else {
    SettingBetList.update({}, { clear: 1 })
  }
  const settingWaitingList = SettingWaitingList.findAll() as SettingWaitingListType[]
  if (!settingWaitingList.length) {
    SettingWaitingList.create({ clear: 1 })
  } else {
    SettingWaitingList.update({}, { clear: 1 })
  }
  const settingContraList = SettingContraList.findAll() as SettingContraListType[]
  if (!settingContraList.length) {
    SettingContraList.create({ clear: 1 })
  } else {
    SettingContraList.update({}, { clear: 1 })
  }
  const settingSuccessList = SettingSuccessList.findAll() as SettingSuccessListType[]
  if (!settingSuccessList.length) {
    SettingSuccessList.create({ clear: 1 })
  } else {
    SettingSuccessList.update({}, { clear: 1 })
  }
})

app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
