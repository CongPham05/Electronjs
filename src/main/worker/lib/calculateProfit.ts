import { Setting } from '@db/model'
import { SettingType } from '@shared/types'

export function calculateProfit(value1: number, value2: number) {
  const settingInfo = Setting.findOne({ id: 1 }) as SettingType
  const profitMin: number = settingInfo.profitMin
  const profitMax: number = settingInfo.profitMax

  //const profitSetting = [-0.143, -0.141]
  const profitSetting = [profitMin, profitMax]
  let profit: number

  if (value1 > 0 && value2 > 0) {
    profit = value1 + value2 - 2
  } else if (value1 < 0 && value2 < 0) {
    profit = value1 + value2 + 2
  } else {
    profit = value1 + value2
  }

  profit = Number(profit.toFixed(3))

  return profit >= profitSetting[0] && profit <= profitSetting[1] ? profit : null
}
