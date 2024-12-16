import fs from 'fs'
import { BrowserWindow } from 'electron'
import { AccountType } from '@shared/types'
import { enqueueWorker } from '@/worker'
import { Account, clearTable } from '@db/model'

export function handleLoginAccount(account: AccountType, mainWindow: BrowserWindow) {
  if (!fs.existsSync('BetLog')) {
    fs.mkdirSync('BetLog')
  }
  fs.writeFileSync(`BetLog/${account.platformName}_${account.loginID}_Program.txt`, '')

  mainWindow.webContents.send(
    'DataUpdateAccount',
    Account.update(
      {
        id: account.id
      },
      { status: 'In-Progress', textLog: 'Waiting for login...' }
    )
  )

  enqueueWorker(account, mainWindow)
}

export function handleLogoutAccount(account: AccountType, mainWindow: BrowserWindow) {
  mainWindow.webContents.send(
    'DataUpdateAccount',
    Account.update(
      {
        id: account.id
      },
      {
        credit: '0',
        autoLogin: 0,
        textLog: null,
        statusLogin: null,
        status: 'Login',
        cookie: null,
        socketUrl: null,
        host: null
      }
    )
  )
  const listAccount = Account.findAll({ platformName: account.platformName })
  const checkAccount = listAccount.findIndex((account) => account.status === 'Logout')
  if (checkAccount == -1) {
    clearTable(account.platformName)
    clearTable('DataBet')
  }
}
