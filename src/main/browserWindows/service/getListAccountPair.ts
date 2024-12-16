import { SettingAccountPair } from '@db/model'
import { SettingAccountPairType } from '@shared/types'

export function GetListAccountPair(): SettingAccountPairType[] {
  return SettingAccountPair.findAll_SettingAccountPair() as SettingAccountPairType[]
}
