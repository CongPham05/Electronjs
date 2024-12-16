import { Account, Setting, SportsBook } from '@db/model'
import { AccountType, SettingType, SportsBookType } from '@shared/types'
import { BrowserWindow } from 'electron'

export function handleAddAccountPlatForm(
  mainWindow: BrowserWindow,
  data: { platformName: string; loginURL: string },
  activeSportsBook: string
) {
  const settings = Setting.findAll() as SettingType[]
  Account.create({
    loginID: null,
    password: null,
    proxyIP: null,
    proxyPort: '0',
    proxyUsername: null,
    proxyPassword: null,
    typeCrawl: settings[0].gameType,
    bet: 1,
    refresh: 1,
    autoLogin: 0,
    lockURL: 0,
    credit: '0',
    textLog: null,
    cookie: null,
    host: null,
    socketUrl: null,
    statusLogin: null,
    statusPair: 0,
    status: 'Login',
    statusDelete: 0,
    ...data
  })

  const listPlatformBySportsBook = SportsBook.findAll({
    name: activeSportsBook
  }) as SportsBookType[]
  const listAccount = Account.findAll({ statusDelete: 0 }) as AccountType[]

  const dataSportsBook = listPlatformBySportsBook.map((sportBook) => {
    const accounts = listAccount.filter((account) => account.platformName === sportBook.platform)
    return { ...sportBook, accounts }
  })
  mainWindow.webContents.send('DataSportsBook', dataSportsBook)
}
