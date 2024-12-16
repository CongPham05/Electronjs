import { Account, SettingAccountPair, SportsBook } from '@db/model'
import { AccountType, SettingAccountPairType, SportsBookType } from '@shared/types'

export function handleGetDataSportsBook(activeSportsBook: string) {
  const listPlatformBySportsBook = SportsBook.findAll({
    name: activeSportsBook
  }) as SportsBookType[]

  const listAccount = Account.findAll({ statusDelete: 0 }) as AccountType[]
  const listAccountCombination = SettingAccountPair.findAll() as SettingAccountPairType[]

  listAccount.forEach((account) => {
    const isPaired = listAccountCombination.some(
      (pair) => pair.id_account1 === account.id || pair.id_account2 === account.id
    )

    if (!isPaired) {
      Account.update({ id: account.id }, { statusPair: 0 })
    }
  })

  const listAccountUpdate = Account.findAll({ statusDelete: 0 }) as AccountType[]

  const dataSportsBook = listPlatformBySportsBook.map((sportBook) => {
    const accounts = listAccountUpdate.filter(
      (account) => account.platformName === sportBook.platform
    )
    return { ...sportBook, accounts }
  })
  return dataSportsBook
}
