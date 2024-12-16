import { BrowserWindow } from 'electron'
import { AccountType, SportsBookType } from '@shared/types'
import { Account, CombinationPlatform, SportsBook } from '@db/model'

export function handleDeleteAccount(
  mainWindow: BrowserWindow,
  account: AccountType,
  activeSportsBook: string
) {
  // const dataAccountDelete = SettingAccountPair.delete_SettingAccountPairByAccountId(
  //   account.id
  // ) as SettingAccountPairType[]

  // const listIdAccount = dataAccountDelete.reduce((acc, item) => {
  //   if (item.id_account1 !== account.id) acc.push(item.id_account1)
  //   if (item.id_account2 !== account.id) acc.push(item.id_account2)
  //   return acc
  // }, [] as number[])

  // const dataAccountPair = SettingAccountPair.findAll()

  // if (!dataAccountPair.length) {
  //   Account.update({}, { statusPair: 0 })
  // }

  // listIdAccount.forEach((accountId) => {
  //   const exists = dataAccountPair.some(
  //     (item) => item.id_account1 === accountId || item.id_account2 === accountId
  //   )
  //   if (!exists) {
  //     Account.update({ id: accountId }, { statusPair: 0 })
  //   }
  // })

  Account.update({ id: account.id }, { statusDelete: 1 })
  const listPlatformBySportsBook = SportsBook.findAll({
    name: activeSportsBook
  }) as SportsBookType[]
  const listAccount = Account.findAll({ statusDelete: 0 }) as AccountType[]

  const dataSportsBook = listPlatformBySportsBook.map((sportBook) => {
    const accounts = listAccount.filter((account) => account.platformName === sportBook.platform)
    return { ...sportBook, accounts }
  })
  CombinationPlatform.create_CombinationPlatform()
  mainWindow.webContents.send('DataSportsBook', dataSportsBook)
}
