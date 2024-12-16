import { Account, SettingAccountPair } from '@db/model'
import { AccountType, SettingAccountPairType } from '@shared/types'

export function GetAccount1Account2() {
  const allAccounts = Account.findAll() as AccountType[]
  const accountPairs = SettingAccountPair.findAll() as SettingAccountPairType[]

  const validAccounts = allAccounts.filter((account) => account.loginID && account.password)

  const filteredAccounts = validAccounts.filter((account) => {
    const isInAccountPair = accountPairs.some(
      (pair) => pair.id_account1 === account.id || pair.id_account2 === account.id
    )

    if (isInAccountPair) {
      return true
    }

    if (account.bet === 1 && account.statusDelete === 0) {
      return true
    }

    return false
  })

  filteredAccounts.sort((a, b) => {
    if (a.platformName === b.platformName) {
      return a.id - b.id
    }
    return a.platformName.localeCompare(b.platformName)
  })

  return filteredAccounts
}
