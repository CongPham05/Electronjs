import { join } from 'path'
import {
  Account,
  BetListResult,
  ContraList,
  Platform,
  Setting,
  SettingBetList,
  SettingContraList,
  SettingPerMatchLimit,
  SettingWaitingList,
  SportsBook,
  SuccessList,
  WaitingList
} from '@db/model'
import { is } from '@electron-toolkit/utils'

import { app, BrowserWindow, ipcMain } from 'electron'
import { createSettingWindow } from '@/browserWindows/settingWindow'
import { createListSportsBook } from '@/browserWindows/addSportsBook'
import { createAccountPairWindow } from '@/browserWindows/accountPairWindow'
import { createAccountListWindow } from '@/browserWindows/accountListWindow'
import {
  AccountPairType,
  AccountType,
  BetListType,
  PlatformType,
  SettingAccountPairType,
  SettingPerMatchLimitType,
  SettingType,
  SportsBookType
} from '@shared/types'
import { handleAddAccountPlatForm } from '@/browserWindows/service/handleAddAccountPlatForm'
import { handleDeleteAccount } from '@/browserWindows/service/handleDeleteAccount'
import { handleDeletePlatForm } from '@/browserWindows/service/handleDeletePlatForm'
import { handleGetDataSportsBook } from '@/browserWindows/service/handleGetDataSportsBook'
import { handleUpdateDataListAccount } from '@/browserWindows/service/handleUpdateDataListAccount'
import {
  handleLoginAccount,
  handleLogoutAccount
} from '@/browserWindows/service/handleLoginLogoutAccount'

import { GetListAccountPair } from '@/browserWindows/service/getListAccountPair'
import { createConfirmLogoutWindow } from '@/browserWindows/confirmLogout'
import { SaveAccountCombination } from '@/browserWindows/service/saveAccountCombination'
import { createAddSelectedAccountPairWindow } from '@/browserWindows/addSelectedAccountPair'
import { handleAddSection } from '@/browserWindows/service/handleAddSection'
import { handleLoginAll } from '@/browserWindows/service/handleLoginAll'
import { handleLogoutAll } from '@/browserWindows/service/handleLogoutAll'
import { handleLoginAll_Platform } from '@/browserWindows/service/handleLoginAll_Platform'
import { handleLogoutAll_Platform } from '@/browserWindows/service/handleLogoutAll_Platform'
import { createProxyServerSettingWindow } from '@/browserWindows/proxyServerSetting'
import { getSuggestedClient } from '@/browserWindows/service/getSuggestedClient'
import { createDelayedLoginSettingWindow } from '@/browserWindows/delayedLoginSetting'
import { createAccountLoginFormWindow } from '@/browserWindows/accountLoginForm'
import { createVIPAccountCheckerSettingWindow } from '@/browserWindows/VIPAccountCheckerSetting'
import { GetAccount1Account2 } from '@/browserWindows/service/getAccount1Account2'
import { SaveAccountCombination__ClearInvalidAccount } from '@/browserWindows/service/SaveAccountCombination__ClearInvalidAccount.ts'
import { createProxyServerSettingGeneralWindow } from '@/browserWindows/showProxyServerSetting'
import { createSportsBookPerMatchLimitSettingWindow } from '@/browserWindows/sportsBookPerMatchLimitSetting'
import { handleDelayLogin } from '@/browserWindows/service/handleDelayLogin'
import { handleDelayLoginAll } from '@/browserWindows/service/handleDelayLoginAll'

export async function createMainWindow(account: {
  id: string
  username: string
  isActive: boolean
  role: string
}) {
  const mainWindow = new BrowserWindow({
    width: 1140,
    height: 764,
    show: true,
    autoHideMenuBar: true,
    center: true,
    title: `B-Soft Vietnam v1.24.12.3          User: ${account.username}/ Expiry Date: 2025-12-19 15:51`,
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
  let activeSportsBook: string = 'SportsBook1'
  //************************************** SettingWindow *********************************************** */

  let settingWindow: BrowserWindow

  ipcMain.on('ShowSettingWindow', () => {
    settingWindow = createSettingWindow(mainWindow)
  })

  ipcMain.on('closeSettingWindow', () => {
    settingWindow.close()
  })

  ipcMain.handle('GetDataSetting', () => {
    return Setting.findAll()
  })

  ipcMain.on('SaveSettingWindow', (_, data) => {
    Account.updateTypeCrawlForRefresh(data.gameType)
    Setting.update({ id: 1 }, data)
    settingWindow.close()
  })

  //******************************************************************************************************* */
  //************************************** ProxyServerSettingGeneral *********************************************** */
  let proxyServerSettingsGeneral: BrowserWindow

  ipcMain.on('ShowProxyServerSetting', () => {
    proxyServerSettingsGeneral = createProxyServerSettingGeneralWindow(mainWindow)
  })
  ipcMain.on('UpdateDataProxyServerSettingsGeneral', (_, data) => {
    const settings = Setting.findAll() as SettingType[]
    if (!settings.length) return

    Setting.update(
      { id: settings[0].id },
      {
        ipAddress: data.ipAddress,
        port: data.port || '0',
        username: data.username,
        password: data.password
      }
    )
    if (proxyServerSettingsGeneral) {
      proxyServerSettingsGeneral.close()
    }
  })

  //***************************************************************************************************** */

  //************************************** ListPlatformBookWindow *********************************************** */

  ipcMain.on('ShowListPlatform', () => {
    createListSportsBook(mainWindow)
  })

  ipcMain.handle('GetListPlatform', () => {
    return Platform.findAll()
  })

  ipcMain.handle('AddPlatForm', (_, platform: PlatformType) => {
    const isPlatform = SportsBook.findOne({ platform: platform.name }) as SportsBookType
    if (isPlatform) {
      return 1
    }

    SettingPerMatchLimit.create({
      namePlatform: platform.name,
      limitMethod: 'TeamName',
      livePreGame: 0,
      limitType: 'TotalCount',
      totalAmount: '5000',
      totalCount: '2'
    })

    SportsBook.create({
      name: activeSportsBook,
      platform: platform.name,
      url: platform.url,
      delayNormal: '3',
      delaySameGame: '5',
      suggestedClient: String(getSuggestedClient()),
      delayLoginSec_from: '50',
      delayLoginSec_to: '70',
      VIPAccountLogout: 1
    })

    const dataSportsBook = handleGetDataSportsBook(activeSportsBook)
    mainWindow.webContents.send('DataSportsBook', dataSportsBook)

    return 0
  })

  //************************************************************************************* */

  //************************************** AccountListWindow *********************************************** */
  let accountListWindow: BrowserWindow
  let platform: string

  ipcMain.on('ShowAccountList', (_, platformName) => {
    platform = platformName
    accountListWindow = createAccountListWindow(mainWindow, platformName)
  })

  ipcMain.handle('GetListAccountByPlatform', () => {
    return Account.findAll({ platformName: platform, statusDelete: 0 })
  })

  ipcMain.on('SaveAccountListWindow', (_, data) => {
    if (accountListWindow) {
      accountListWindow.close()
    }

    if (!data || !data.length) {
      return
    }
    handleUpdateDataListAccount(data)

    const dataSportsBook = handleGetDataSportsBook(activeSportsBook)
    mainWindow.webContents.send('DataSportsBook', dataSportsBook)
  })

  //************************************************************************************* */

  //************************************** AccountPairWindow *********************************************** */
  let accountPairWindow: BrowserWindow
  let addSelectionAccountPairWindow: BrowserWindow

  ipcMain.on('ShowAccountPairWindow', () => {
    accountPairWindow = createAccountPairWindow(mainWindow)
  })

  ipcMain.on('CloseAccountPairWindow', (_, data: AccountPairType[]) => {
    if (accountPairWindow) {
      accountPairWindow.close()
    }

    SaveAccountCombination(data, activeSportsBook, mainWindow)
  })

  ipcMain.on('CloseAccountPairWindow_ClearInvalidAccount', (_, data: SettingAccountPairType[]) => {
    if (accountPairWindow) {
      accountPairWindow.close()
    }

    SaveAccountCombination__ClearInvalidAccount(data)
  })

  ipcMain.handle('GetAccount1Account2', () => {
    return GetAccount1Account2()
  })

  ipcMain.handle('GetListAccountPair', () => {
    return GetListAccountPair()
  })

  ipcMain.on('ShowAddSelectionAccountPair', () => {
    addSelectionAccountPairWindow = createAddSelectedAccountPairWindow(accountPairWindow)
  })

  ipcMain.on('DataSelection', (_, data) => {
    if (addSelectionAccountPairWindow) {
      addSelectionAccountPairWindow.close()
    }
    if (!data || !data.length) {
      return
    }

    handleAddSection(accountPairWindow, data)
  })

  //************************************************************************************* */

  //************************************** mainWindow *********************************************** */
  let proxyServerSetting: BrowserWindow
  let delayedLoginSettingWindow: BrowserWindow

  ipcMain.handle('GetListSportBook', () => {
    return SportsBook.findAll()
  })

  ipcMain.on('SelectSportsBook', (_, sportsBook) => {
    activeSportsBook = sportsBook
  })

  ipcMain.handle('GetDataSportsBook', () => {
    return handleGetDataSportsBook(activeSportsBook)
  })

  ipcMain.on('DeleteAccount', (_, account) => {
    handleDeleteAccount(mainWindow, account, activeSportsBook)
  })

  ipcMain.on('UpdateDelaySec_Platform', (_, data: { platform: string; dataUpdate: object }) => {
    const dataUpdate = data.dataUpdate
    SportsBook.update({ name: activeSportsBook, platform: data.platform }, { ...dataUpdate })
  })

  ipcMain.on('RemovePlatform', (_, namePlatform) => {
    handleDeletePlatForm(mainWindow, namePlatform, activeSportsBook)
  })

  let accountIdActive: number
  let accountLoginForm: BrowserWindow
  ipcMain.on('AccountLoginForm', (_, account: AccountType) => {
    accountIdActive = account.id
    platform = account.platformName
    accountLoginForm = createAccountLoginFormWindow(mainWindow, platform)
  })

  ipcMain.handle('DataAccount', () => {
    return Account.findById(accountIdActive)
  })

  ipcMain.handle('CheckUserNameAccount', (_, username) => {
    const checkAccount = Account.findOne({ loginID: username, platformName: platform })
    return !!checkAccount
  })

  ipcMain.on('Data_AccountLoginForm', (_, data) => {
    if (accountLoginForm) {
      accountLoginForm.close()
    }
    Account.update({ id: accountIdActive }, { loginID: data.username, password: data.password })
    const dataSportsBook = handleGetDataSportsBook(activeSportsBook)
    mainWindow.webContents.send('DataSportsBook', dataSportsBook)
  })

  ipcMain.on('AddAccountPlatForm', (_, data) => {
    handleAddAccountPlatForm(mainWindow, data, activeSportsBook)
  })

  ipcMain.on('UpdateAccount', (_, data) => {
    const validFields = ['bet', 'refresh', 'autoLogin', 'lockURL']
    if (validFields.includes(data.field)) {
      if (data.field === 'refresh') {
        const setting = Setting.findAll() as SettingType[]
        Account.update(
          { id: data.accountId },
          { typeCrawl: setting[0].gameType, [data.field]: data.value }
        )
      }
      Account.update({ id: data.accountId }, { [data.field]: data.value })
    }
  })

  ipcMain.on('LoginAccount', (_, account) => {
    handleLoginAccount(account, mainWindow)
  })

  ipcMain.on('LogoutAccount', (_, account) => {
    handleLogoutAccount(account, mainWindow)
  })

  let sportsBookPerMatchLimitSettingWindow: BrowserWindow
  ipcMain.on('ShowSportsBookPerMatchLimitSettingWindow', () => {
    sportsBookPerMatchLimitSettingWindow = createSportsBookPerMatchLimitSettingWindow(mainWindow)
  })

  ipcMain.on('CloseSportsBookPerMatchLimitSetting', (_, { enable, listPlatform }) => {
    if (sportsBookPerMatchLimitSettingWindow) {
      sportsBookPerMatchLimitSettingWindow.close()
    }
    Setting.update({}, { enablePerMatchLimitSetting: enable })
    for (const platform of listPlatform) {
      SettingPerMatchLimit.update(
        { id: platform.id },
        {
          limitMethod: platform.limitMethod,
          livePreGame: platform.livePreGame,
          limitType: platform.limitType,
          totalAmount: platform.totalAmount,
          totalCount: platform.totalCount
        }
      )
    }
  })

  ipcMain.handle('PerMatchLimitSetting', () => {
    const settings = Setting.findAll() as SettingType[]
    const perMatchLimitSetting = SettingPerMatchLimit.findAll() as SettingPerMatchLimitType[]
    return {
      enable: settings[0].enablePerMatchLimitSetting,
      data: perMatchLimitSetting
    }
  })

  ipcMain.handle('GetBetListResult', () => {
    const data = BetListResult.findAll() as BetListType[]
    return data.flatMap((item: BetListType) => JSON.parse(item.dataPair))
  })

  ipcMain.handle('GetWaitingList', () => {
    return WaitingList.findAll()
  })

  ipcMain.handle('GetContraList', () => {
    return ContraList.findAll()
  })

  ipcMain.handle('GetSuccessList', () => {
    return SuccessList.findAll()
  })

  ipcMain.on('LoginAll', () => {
    handleLoginAll(mainWindow, activeSportsBook)
  })

  ipcMain.on('LogoutAll', () => {
    handleLogoutAll(mainWindow, activeSportsBook)
  })

  ipcMain.on('DelayLoginAll', () => {
    handleDelayLoginAll(mainWindow, activeSportsBook)
  })

  ipcMain.on('LoginAll_Platform', (_, platform) => {
    handleLoginAll_Platform(mainWindow, activeSportsBook, platform)
  })

  ipcMain.on('LogoutAll_Platform', (_, platform) => {
    handleLogoutAll_Platform(mainWindow, activeSportsBook, platform)
  })

  ipcMain.on('DelayLoginAll_Platform', (_, platform) => {
    handleDelayLogin(mainWindow, platform)
  })

  ipcMain.on('DelayLoginSetting_Platform', (_, platformName) => {
    platform = platformName
    delayedLoginSettingWindow = createDelayedLoginSettingWindow(mainWindow)
  })

  ipcMain.on('DataUpdateDelayedLoginSetting', (_, dataUpdate) => {
    if (delayedLoginSettingWindow) {
      delayedLoginSettingWindow.close()
    }

    SportsBook.update({ name: activeSportsBook, platform }, { ...dataUpdate })
  })

  ipcMain.handle('DataDelayedLoginSetting', () => {
    return SportsBook.findOne({ platform })
  })

  ipcMain.on('QuickProxySetting_Platform', (_, platformName) => {
    platform = platformName
    proxyServerSetting = createProxyServerSettingWindow(mainWindow)
  })

  ipcMain.on('Data_ProxyServerSetting_Platform', (_, formData) => {
    if (proxyServerSetting) {
      proxyServerSetting.close()
    }

    Account.update(
      { platformName: platform },
      {
        proxyIP: formData.ipAddress || null,
        proxyPort: formData.port,
        proxyUsername: formData.username || null,
        proxyPassword: formData.password || null
      }
    )
  })

  let VIPAccountCheckerSetting: BrowserWindow
  ipcMain.on('VIPAccountCheckerSetting__Platform', (_, platformName) => {
    platform = platformName
    VIPAccountCheckerSetting = createVIPAccountCheckerSettingWindow(mainWindow)
  })

  ipcMain.handle('VIPAccountCheckerSetting', () => {
    const sportsBookByPlatform = SportsBook.findOne({ platform }) as SportsBookType
    return sportsBookByPlatform.VIPAccountLogout
  })

  ipcMain.on('updateVIPAccountCheckerSetting', (_, data) => {
    if (VIPAccountCheckerSetting) {
      VIPAccountCheckerSetting.close()
    }

    SportsBook.update({ platform }, data)
  })

  ipcMain.on('DataClear_BetList', (_, data) => {
    SettingBetList.update({}, { clear: data })
  })

  ipcMain.on('DataClear_WaitingList', (_, data) => {
    SettingWaitingList.update({}, { clear: data })
  })

  ipcMain.on('DataClear_ContraList', (_, data) => {
    SettingContraList.update({}, { clear: data })
  })

  ipcMain.on('DataClear_SuccessList', (_, data) => {
    SettingContraList.update({}, { clear: data })
  })

  //************************************************************************************* */

  //************************************** ConfirmLogoutWindow *********************************************** */

  let confirmLogoutWindow: BrowserWindow | null = null

  mainWindow.on('close', (event) => {
    if (!confirmLogoutWindow) {
      event.preventDefault()
      confirmLogoutWindow = createConfirmLogoutWindow(mainWindow)
    }
  })

  ipcMain.on('CloseConfirmLogout', () => {
    confirmLogoutWindow && confirmLogoutWindow.hide()
    confirmLogoutWindow = null
  })

  ipcMain.on('QuitApp', () => {
    confirmLogoutWindow && confirmLogoutWindow.close()
    app.quit()
  })
  //************************************************************************************* */

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL('http://localhost:5173/#/main')
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'main' })
  }

  return mainWindow
}
