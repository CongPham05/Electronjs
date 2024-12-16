import { Account, clearTable, CombinationPlatform, SettingAccountPair, SportsBook } from '@db/model'
import { AccountType, AccountPairType, SportsBookType } from '@shared/types'
import { BrowserWindow } from 'electron'

export function SaveAccountCombination(
  data: AccountPairType[],
  activeSportsBook: string,
  mainWindow: BrowserWindow
) {
  if (!data.length) {
    clearTable('SettingAccountPair')
    clearTable('CombinationPlatform')
    Account.update({}, { statusPair: 0 })
    sendSportsBookData(activeSportsBook, mainWindow)
    return
  }

  const handleData = data.map(
    ({
      id_account1,
      account1_BetAmount,
      account1_SelectBet,
      account1_CheckOdd,
      account1_CheckOdd_From,
      account1_CheckOdd_To,
      id_account2,
      account2_BetAmount,
      account2_SelectBet,
      account2_CheckOdd,
      account2_CheckOdd_From,
      account2_CheckOdd_To,
      combinationPlatform
    }) => ({
      id_account1,
      account1_BetAmount,
      account1_SelectBet,
      account1_CheckOdd,
      account1_CheckOdd_From,
      account1_CheckOdd_To,
      id_account2,
      account2_BetAmount,
      account2_SelectBet,
      account2_CheckOdd,
      account2_CheckOdd_From,
      account2_CheckOdd_To,
      combinationPlatform
    })
  )

  clearTable('SettingAccountPair')
  SettingAccountPair.insertMany(handleData)
  CombinationPlatform.create_CombinationPlatform()

  for (const item of data) {
    Account.update({ id: item.id_account1 }, { statusPair: 1 })
    Account.update({ id: item.id_account2 }, { statusPair: 1 })
  }

  sendSportsBookData(activeSportsBook, mainWindow)
  clearTable('DataBet')
  clearTable('WaitingList')
}
function sendSportsBookData(activeSportsBook: string, mainWindow: BrowserWindow) {
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
