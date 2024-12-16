import { v4 as uuidv4 } from 'uuid'
import { parentPort } from 'worker_threads'
import { setTimeout } from 'timers/promises'

import {
  BetListResult,
  clearTable,
  ContraList,
  DataBet,
  Setting,
  SuccessList,
  WaitingList
} from '@db/model'
import { AccountType, DataBetType, DataPlaceBet, SettingType, WaitingListType } from '@shared/types'
import { checkAccountContinues } from '@/worker/lib/checkAccountContinues'
import { getTicket_P88Bet } from '@/worker/lib/getTicket_P88Bet'
import { getTicket_Viva88Bet } from '@/worker/lib/getTicket_Viva88Bet'
import { placeBet_P88Bet } from '@/worker/lib/placeBet_P88Bet'
import { placeBet_Viva88Bet } from '@/worker/lib/placeBet_Viva88Bet'
import { checkSettingAccountPair } from '@/worker/lib/checkSettingAccountPair'
import { checkClearData } from '@/worker/lib/checkClearData'

let gameType: string | null = null
let profitMin: number | null = null
let profitMax: number | null = null

const port = parentPort
if (!port) throw new Error('IllegalState')

port.on('message', async (action) => {
  if (action == 'Start') {
    handleData()
  }
})

async function handleData() {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const settingInfo = Setting.findOne({ id: 1 }) as SettingType
    if (settingInfo) {
      profitMin = settingInfo.profitMin
      profitMax = settingInfo.profitMax
      gameType = settingInfo.gameType
    }

    // const dataBet = DataBet.findAndDeleteFirst20() as DataBetType[]
    const dataBet = DataBet.findAll() as DataBetType[]
    if (!dataBet.length) {
      await setTimeout(1000)
      continue
    }

    for (const data of dataBet) {
      const ticketPair = JSON.parse(data.dataPair)

      const dataCheckSettingAccountPair = checkSettingAccountPair(ticketPair)
      if (!checkAccountContinues(ticketPair) || !dataCheckSettingAccountPair) {
        await setTimeout(1000)
        continue
      }

      ticketPair[0].selectBet = dataCheckSettingAccountPair.TicketI_SelectBet
      ticketPair[1].selectBet = dataCheckSettingAccountPair.TicketII_SelectBet

      await handlePlaceBet(ticketPair)
      if (!checkGameType() || !checkProfit()) {
        clearTable('DataBet')
        break
      }
    }
  }
}

const handlePlaceBet = async (ticketPair: DataPlaceBet[]) => {
  for (const item of ticketPair) {
    item.info = 'In-progress'
  }

  const { uuid, dataPair } = WaitingList.create({
    uuid: uuidv4(),
    dataPair: JSON.stringify(ticketPair)
  }) as WaitingListType

  const [ticketI, ticketII]: DataPlaceBet[] = JSON.parse(dataPair)

  const dataCheck = checkAccountContinues(ticketPair)
  if (!dataCheck) {
    return
  }
  const { accountInfoI, accountInfoII } = dataCheck as {
    accountInfoI: AccountType
    accountInfoII: AccountType
  }

  const [{ ErrorCode: ErrorCodeI, Data: DataI }, { ErrorCode: ErrorCodeII, Data: DataII }] =
    await Promise.all([
      handleGetTicket(ticketI, accountInfoI),
      handleGetTicket(ticketII, accountInfoII)
    ])

  if (ErrorCodeI == 1 || ErrorCodeII == 1 || (ErrorCodeI == 400 && ErrorCodeII == 400)) {
    WaitingList.delete({ uuid })

    const ticketUpdate = [
      { ...ticketI, info: ErrorCodeI == 0 ? 'Ticket Received' : DataI },
      { ...ticketII, info: ErrorCodeII == 0 ? 'Ticket Received' : DataII }
    ]

    checkClearData()
    ContraList.create({
      uuid,
      dataPair: JSON.stringify(ticketUpdate)
    }) as WaitingListType
    const recordDB = BetListResult.create({
      dataPair: JSON.stringify(ticketUpdate)
    })

    port.postMessage({ type: 'ContraList', recordDB })
    return
  }

  const [
    { ErrorCode: ErrorCodeBetI, Data: DataBetI },
    { ErrorCode: ErrorCodeBetII, Data: DataBetII }
  ] = await Promise.all([
    handleBetTicket(ticketI, accountInfoI, DataI),
    handleBetTicket(ticketII, accountInfoII, DataII)
  ])

  const ticketUpdate = [
    { ...ticketI, ...DataBetI },
    { ...ticketII, ...DataBetII }
  ]
  WaitingList.delete({ uuid })

  if (ErrorCodeBetI == 1 || ErrorCodeBetII == 1) {
    checkClearData()
    ContraList.create({
      uuid,
      dataPair: JSON.stringify(ticketUpdate)
    }) as WaitingListType
    const recordDB = BetListResult.create({
      dataPair: JSON.stringify(ticketUpdate)
    })

    port.postMessage({ type: 'ContraList', recordDB })
    return
  }

  checkClearData()
  SuccessList.create({
    uuid,
    dataPair: JSON.stringify(ticketUpdate)
  }) as WaitingListType
  const recordDB = BetListResult.create({
    dataPair: JSON.stringify(ticketUpdate)
  })
  port.postMessage({ type: 'SuccessList', recordDB })
}

const handleGetTicket = async (ticket: DataPlaceBet, accountInfo: AccountType) => {
  switch (ticket.platform) {
    case 'P88Bet':
      return await getTicket_P88Bet(accountInfo, ticket)

    default:
      return await getTicket_Viva88Bet(accountInfo, ticket)
  }
}

const handleBetTicket = async (ticket: DataPlaceBet, accountInfo: AccountType, data) => {
  switch (ticket.platform) {
    case 'P88Bet':
      return await placeBet_P88Bet(ticket, accountInfo, data)

    default:
      return await placeBet_Viva88Bet(ticket, accountInfo, data)
  }
}

const checkGameType = () => {
  const settingInfo = Setting.findAll()
  const gameTypeCurrent = settingInfo[0]?.gameType
  return gameType === gameTypeCurrent ? true : false
}

const checkProfit = () => {
  const [settingInfo] = Setting.findAll() || [{}]
  const { profitMin: profitMinCurrent, profitMax: profitMaxCurrent } = settingInfo

  return profitMin === profitMinCurrent && profitMax === profitMaxCurrent
}
