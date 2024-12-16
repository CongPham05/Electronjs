import { Account } from '@db/model'
import { AccountType } from '@shared/types'

export function handleUpdateDataListAccount(dataAccountInfo: AccountType[]) {
  for (const account of dataAccountInfo) {
    Account.update(
      { id: account.id },
      {
        loginID: account.loginID,
        password: account.password,
        proxyIP: account.proxyIP,
        proxyPort: account.proxyPort || '0',
        proxyUsername: account.proxyUsername,
        proxyPassword: account.proxyPassword
      }
    )
  }
}
