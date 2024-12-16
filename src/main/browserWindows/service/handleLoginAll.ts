import fs from 'fs'
import { BrowserWindow } from 'electron'
import { handleGetAccountBySportsBook } from '@/browserWindows/service/handleGetAccountBySportsBook'
import { AccountType } from '@shared/types'
import { Account } from '@db/model'
import { handleLoginAccount } from '@/browserWindows/service/handleLoginLogoutAccount'

export function handleLoginAll(mainWindow: BrowserWindow, activeSportsBook: string) {
  const listAccount = handleGetAccountBySportsBook(activeSportsBook)
  if (!listAccount || !listAccount.length) return

  const accountNotLogin = listAccount.filter(
    (account) =>
      account.status == 'Login' && account.statusDelete == 0 && account.loginID && account.password
  ) as AccountType[]

  if (!accountNotLogin.length) return

  for (const account of accountNotLogin) {
    mainWindow.webContents.send(
      'DataUpdateAccount',
      Account.update(
        {
          id: account.id
        },
        { status: 'In-Progress', textLog: 'Waiting for login...' }
      )
    )
    if (!fs.existsSync('BetLog')) {
      fs.mkdirSync('BetLog')
    }
    fs.writeFileSync(`BetLog/${account.platformName}_${account.loginID}_Program.txt`, '')
    handleLoginAccount(account, mainWindow)
  }
}
