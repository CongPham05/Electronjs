import {
  Account,
  CombinationPlatform,
  SettingAccountPair,
  SettingPerMatchLimit,
  SportsBook
} from '@db/model'
import { AccountType, SettingAccountPairType, SportsBookType } from '@shared/types'
import { BrowserWindow } from 'electron'

export function handleDeletePlatForm(
  mainWindow: BrowserWindow,
  namePlatform: string,
  activeSportsBook: string
) {
  const listAccountByPlatform = Account.findAll({ platformName: namePlatform })
  const dataSettingAccountPair = SettingAccountPair.findAll() as SettingAccountPairType[]

  const idsFromA = new Set(listAccountByPlatform.map((item) => item.id))
  const listIdAccount = [] as number[]

  dataSettingAccountPair.forEach((itemB) => {
    if (idsFromA.has(itemB.id_account2)) {
      listIdAccount.push(itemB.id_account1)
    }
    if (idsFromA.has(itemB.id_account1)) {
      listIdAccount.push(itemB.id_account2)
    }
  })
  SettingAccountPair.delete_SettingAccountPairByNamePlatform(namePlatform)

  const dataAccountPair = SettingAccountPair.findAll()
  if (!dataAccountPair.length) {
    Account.update({}, { statusPair: 0 })
  }

  listIdAccount.forEach((accountId) => {
    const exists = dataAccountPair.some(
      (item) => item.id_account1 === accountId || item.id_account2 === accountId
    )
    if (!exists) {
      Account.update({ id: accountId }, { statusPair: 0 })
    }
  })

  Account.deleteMany({ platformName: namePlatform })
  SportsBook.delete({ platform: namePlatform })

  const listPlatformBySportsBook = SportsBook.findAll({
    name: activeSportsBook
  }) as SportsBookType[]

  const listAccount = Account.findAll() as AccountType[]

  const dataSportsBook = listPlatformBySportsBook.map((sportBook) => {
    const accounts = listAccount.filter((account) => account.platformName === sportBook.platform)
    return { ...sportBook, accounts }
  })
  CombinationPlatform.create_CombinationPlatform()
  SettingPerMatchLimit.delete({ namePlatform })
  mainWindow.webContents.send('DataSportsBook', dataSportsBook)
}
