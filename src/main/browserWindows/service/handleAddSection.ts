import { AccountType } from '@shared/types'
import { BrowserWindow } from 'electron'

export function handleAddSection(
  accountPairWindow: BrowserWindow,
  data: { account1: AccountType; account2: AccountType }[]
) {
  const handleData = data.map((pair) => {
    const { account1, account2 } = pair
    if (account1.platformName > account2.platformName) {
      return { account1: account2, account2: account1 }
    }
    if (account1.platformName === account2.platformName && account1.id > account2.id) {
      return { account1: account2, account2: account1 }
    }
    return pair
  })

  const dataUpdate = handleData.map((item) => {
    return {
      id_account1: item.account1.id,
      account1_BetAmount: 100,
      account1_SelectBet: 'BetAll',
      account1_CheckOdd: 0,
      account1_CheckOdd_From: '0.01',
      account1_CheckOdd_To: '-0.01',
      account1_loginID: item.account1.loginID,
      account1_platForm: item.account1.platformName,

      id_account2: item.account2.id,
      account2_BetAmount: 100,
      account2_SelectBet: 'BetAll',
      account2_CheckOdd: 0,
      account2_CheckOdd_From: '0.01',
      account2_CheckOdd_To: '-0.01',
      account2_loginID: item.account2.loginID,
      account2_platForm: item.account2.platformName,

      combinationPlatform: `${item.account1.platformName}_${item.account2.platformName}`
    }
  })

  accountPairWindow.webContents.send('GetListAccountPairUpdate', dataUpdate)
}
