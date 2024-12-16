import {
  BetListResult,
  clearTable,
  ContraList,
  SettingBetList,
  SettingContraList,
  SettingSuccessList,
  SettingWaitingList,
  SuccessList,
  WaitingList
} from '@db/model'

export const checkClearData = () => {
  const settings = [
    {
      setting: SettingBetList.findAll()[0]?.clear,
      count: () => BetListResult.count(),
      tableName: 'BetListResult'
    },
    {
      setting: SettingWaitingList.findAll()[0]?.clear,
      count: () => WaitingList.count(),
      tableName: 'WaitingList'
    },
    {
      setting: SettingContraList.findAll()[0]?.clear,
      count: () => ContraList.count(),
      tableName: 'ContraList'
    },
    {
      setting: SettingSuccessList.findAll()[0]?.clear,
      count: () => SuccessList.count(),
      tableName: 'SuccessList'
    }
  ]

  settings.forEach(({ setting, count, tableName }) => {
    if (count() >= (setting === 1 ? 50 : 100)) {
      clearTable(tableName)
    }
  })
}
