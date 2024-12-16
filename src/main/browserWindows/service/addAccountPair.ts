import { CombinationPlatform, SettingAccountPair } from '@db/model'

export function AddAccountPair(data: {
  id_account1: number
  account1_BetAmount: number
  account1_SelectBet: string
  id_account2: number
  account2_BetAmount: number
  account2_SelectBet: string
}) {
  const dataSettingAccountPair = SettingAccountPair.create_SettingAccountPair(data)
  CombinationPlatform.create_CombinationPlatform()

  return dataSettingAccountPair
}
