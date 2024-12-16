import { BrowserWindow } from 'electron'
import { handleGetAccountBySportsBook } from '@/browserWindows/service/handleGetAccountBySportsBook'
import { AccountType } from '@shared/types'
import { handleLogoutAccount } from '@/browserWindows/service/handleLoginLogoutAccount'

export function handleLogoutAll_Platform(
  mainWindow: BrowserWindow,
  activeSportsBook: string,
  platform: string
) {
  const listAccount = handleGetAccountBySportsBook(activeSportsBook)
  if (!listAccount || !listAccount.length) return

  const accountNotLogin = listAccount.filter(
    (account) =>
      account.status != 'Login' &&
      account.statusDelete == 0 &&
      account.platformName == platform &&
      account.loginID &&
      account.password
  ) as AccountType[]

  if (!accountNotLogin.length) return
  for (const account of accountNotLogin) {
    handleLogoutAccount(account, mainWindow)
  }
}
