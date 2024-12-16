import { clearTable, createModel, SettingAccountPair } from '@db/model'
import dataCrawlByPlatformSchema from '@db/schema/dataCrawlByPlatform'
import { DataPlaceBet, SettingAccountPairType } from '@shared/types'

export const checkSettingAccountPair = (ticketPair: DataPlaceBet[]) => {
  const [ticketI, ticketII]: DataPlaceBet[] = ticketPair
  const [Platform1_Model, Platform2_Model] = [
    createModel(ticketI.platform, dataCrawlByPlatformSchema),
    createModel(ticketII.platform, dataCrawlByPlatformSchema)
  ]

  const Platform1_count = Platform1_Model.count()
  const Platform2_count = Platform2_Model.count()

  if (!Platform1_count || !Platform2_count) {
    clearTable('DataBet')
    return
  }

  const dataSetting = SettingAccountPair.findOne({
    id_account1: ticketI.idAccount,
    id_account2: ticketII.idAccount
  }) as SettingAccountPairType

  if (
    !dataSetting ||
    (dataSetting.account1_SelectBet == 'NoBet' && dataSetting.account2_SelectBet == 'NoBet')
  ) {
    return false
  }
  return {
    TicketI_SelectBet: dataSetting.account1_SelectBet,
    TicketII_SelectBet: dataSetting.account2_SelectBet
  }
}
