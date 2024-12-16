import { BetListResult, ContraList, SuccessList, WaitingList } from '@db/model'
import { DataPlaceBet, WaitingListType } from '@shared/types'

export function handleWaitingList(
  port: import('worker_threads').MessagePort,
  platform: string,
  uuid: string,
  dataUpdate
) {
  const ticketInWaitingList = WaitingList.findOne({ uuid }) as WaitingListType

  if (ticketInWaitingList) {
    const [ticketI, ticketII]: DataPlaceBet[] = JSON.parse(ticketInWaitingList.dataPair)

    const { isCheckStatusTicket, ticketUpdate } = createTicketPairAndCheckFail(
      ticketI,
      ticketII,
      platform,
      dataUpdate
    )

    if (isCheckStatusTicket == 'WaitingList') {
      WaitingList.update({ uuid }, { dataPair: JSON.stringify(ticketUpdate) })
      return
    }
    WaitingList.delete({ uuid })
    ContraList.create({
      uuid,
      dataPair: JSON.stringify(ticketUpdate)
    }) as WaitingListType

    const recordDB = BetListResult.create({
      dataPair: JSON.stringify(ticketUpdate)
    })

    port.postMessage({ type: 'ContraList', recordDB })
  }
}
function createTicketPairAndCheckFail(
  ticketI: DataPlaceBet,
  ticketII: DataPlaceBet,
  platform: string,
  dataUpdate
): { isCheckStatusTicket: string; ticketUpdate: DataPlaceBet[] } {
  if (ticketI.platform === platform) {
    const ticketUpdate = [{ ...ticketI, ...dataUpdate }, ticketII]

    if (ticketII.info == 'In-progress') {
      return { isCheckStatusTicket: 'WaitingList', ticketUpdate }
    } else {
      return { isCheckStatusTicket: 'ContraList', ticketUpdate }
    }
  } else {
    const ticketUpdate = [ticketI, { ...ticketII, ...dataUpdate }]

    if (ticketI.info == 'In-progress') {
      return { isCheckStatusTicket: 'WaitingList', ticketUpdate }
    } else {
      return { isCheckStatusTicket: 'ContraList', ticketUpdate }
    }
  }
}

export function handleSuccessList(port, platform: string, uuid: string, dataUpdate) {
  const ticketInWaitingList = WaitingList.findOne({ uuid }) as WaitingListType
  if (ticketInWaitingList) {
    const [ticketI, ticketII]: DataPlaceBet[] = JSON.parse(ticketInWaitingList.dataPair)

    const { isCheckStatusTicket, ticketUpdate } = createTicketPairAndCheckSuccess(
      ticketI,
      ticketII,
      platform,
      dataUpdate
    )

    if (isCheckStatusTicket == 'WaitingList') {
      WaitingList.update({ uuid }, { dataPair: JSON.stringify(ticketUpdate) })
    } else if (isCheckStatusTicket == 'ContraList') {
      WaitingList.delete({ uuid })
      ContraList.create({
        uuid,
        dataPair: JSON.stringify(ticketUpdate)
      }) as WaitingListType

      const recordDB = BetListResult.create({
        dataPair: JSON.stringify(ticketUpdate)
      })

      port.postMessage({ type: 'ContraList', recordDB })
    } else {
      WaitingList.delete({ uuid })

      SuccessList.create({
        uuid,
        dataPair: JSON.stringify(ticketUpdate)
      }) as WaitingListType
      const recordDB = BetListResult.create({
        dataPair: JSON.stringify(ticketUpdate)
      })
      port.postMessage({ type: 'SuccessList', recordDB })
    }
  }
}

export function createTicketPairAndCheckSuccess(
  ticketI: DataPlaceBet,
  ticketII: DataPlaceBet,
  platform: string,
  dataUpdate
): { isCheckStatusTicket: string; ticketUpdate: DataPlaceBet[] } {
  if (ticketI.platform === platform) {
    const ticketUpdate = [{ ...ticketI, ...dataUpdate }, ticketII]

    if (ticketII.info === 'Bet Success') {
      return { isCheckStatusTicket: 'SuccessList', ticketUpdate }
    } else if (ticketII.info === 'In-progress') {
      return { isCheckStatusTicket: 'WaitingList', ticketUpdate }
    } else {
      return { isCheckStatusTicket: 'ContraList', ticketUpdate }
    }
  } else {
    const ticketUpdate = [ticketI, { ...ticketII, ...dataUpdate }]

    if (ticketI.info === 'Bet Success') {
      return { isCheckStatusTicket: 'SuccessList', ticketUpdate }
    } else if (ticketII.info === 'In-progress') {
      return { isCheckStatusTicket: 'WaitingList', ticketUpdate }
    } else {
      return { isCheckStatusTicket: 'ContraList', ticketUpdate }
    }
  }
}
