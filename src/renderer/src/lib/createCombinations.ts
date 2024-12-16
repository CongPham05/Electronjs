import { sortPlatform } from '@renderer/lib/sortPlatform'
import { AccountType, AccountPairType } from '@shared/types'

export function createCombinations(arr: AccountType[]) {
  const sortedArr = [...arr].sort((a, b) => {
    if (a.platformName === b.platformName) {
      return a.id - b.id
    }
    return a.platformName.localeCompare(b.platformName)
  })

  const combinations: AccountPairType[] = []

  for (let i = 0; i < sortedArr.length; i++) {
    combinations.push({
      id_account1: sortedArr[i].id,
      account1_loginID: sortedArr[i].loginID,
      account1_platForm: sortedArr[i].platformName,
      account1_BetAmount: 100,
      account1_SelectBet: 'BetAll',
      account1_CheckOdd: 0,
      account1_CheckOdd_From: '0.01',
      account1_CheckOdd_To: '-0.01',

      id_account2: sortedArr[i].id,
      account2_loginID: sortedArr[i].loginID,
      account2_platForm: sortedArr[i].platformName,
      account2_BetAmount: 100,
      account2_SelectBet: 'BetAll',
      account2_CheckOdd: 0,
      account2_CheckOdd_From: '0.01',
      account2_CheckOdd_To: '-0.01',
      combinationPlatform: sortPlatform(sortedArr[i], sortedArr[i])
    })

    for (let j = i + 1; j < sortedArr.length; j++) {
      combinations.push({
        id_account1: sortedArr[i].id,
        account1_loginID: sortedArr[i].loginID,
        account1_platForm: sortedArr[i].platformName,
        account1_BetAmount: 100,
        account1_SelectBet: 'BetAll',
        account1_CheckOdd: 0,
        account1_CheckOdd_From: '0.01',
        account1_CheckOdd_To: '-0.01',

        id_account2: sortedArr[j].id,
        account2_loginID: sortedArr[j].loginID,
        account2_platForm: sortedArr[j].platformName,
        account2_BetAmount: 100,
        account2_SelectBet: 'BetAll',
        account2_CheckOdd: 0,
        account2_CheckOdd_From: '0.01',
        account2_CheckOdd_To: '-0.01',
        combinationPlatform: sortPlatform(sortedArr[i], sortedArr[j])
      })
    }
  }

  return combinations
}
