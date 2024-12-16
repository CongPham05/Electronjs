import { Account, SettingAccountPair } from '@db/model'
import { SettingAccountPairType } from '@shared/types'

export function SaveAccountCombination__ClearInvalidAccount(data: SettingAccountPairType[]) {
  const listSettingAccountPair = SettingAccountPair.findAll()

  const filterIdExitsAccountPair = listSettingAccountPair.filter(
    (itemB) => !data.some((itemA) => itemA.id === itemB.id)
  )

  for (const accountPair of filterIdExitsAccountPair) {
    SettingAccountPair.delete({ id: accountPair.id })
  }

  Account.deleteMany({ statusDelete: 1 })
}
