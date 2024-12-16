import fetch from 'node-fetch'
import { v4 as uuidv4 } from 'uuid'
import { HttpsProxyAgent } from 'https-proxy-agent'

import { logToFile } from '@/worker/lib/logToFile'
import { HEADERS_P88BET } from '@shared/constants'
import { AccountType, DataPlaceBet } from '@shared/types'
import { TypeGetTickets_P88 } from '@shared/typesP88'

export const placeBet_P88Bet = async (ticket: DataPlaceBet, accountInfo: AccountType, data) => {
  if (ticket.selectBet == 'NoBet') {
    logToFile(accountInfo.platformName, accountInfo.loginID, `No Bet By User`, 'BetList')
    return {
      ErrorCode: 400,
      Data: {
        info: 'No Bet By User',
        receiptID: '',
        receiptStatus: ''
      }
    }
  }
  if (ticket.checkOdd == 1) {
    const from = parseFloat(ticket.checkOdd_From as string)
    const to = parseFloat(ticket.checkOdd_To as string)
    const min = Math.min(from, to)
    const max = Math.max(from, to)

    if (ticket.odd < min || ticket.odd > max) {
      logToFile(
        accountInfo.platformName,
        accountInfo.loginID,
        `Error: CheckOdd setting do not match.`,
        'BetList'
      )
      return {
        ErrorCode: 400,
        Data: {
          info: `Error: CheckOdd setting do not match.`,
          receiptID: '',
          receiptStatus: ''
        }
      }
    }
  }

  const {
    ErrorCode: ErrorCode_ProcessBet,
    Info,
    receiptID
  } = await bettingProcessBet__P88Bet(accountInfo, ticket, data)

  if (ErrorCode_ProcessBet !== 0) {
    return {
      ErrorCode: 1,
      Data: { info: Info, receiptID, receiptStatus: 'Fail' }
    }
  }

  return {
    ErrorCode: 0,
    Data: {
      info: Info,
      receiptID,
      receiptStatus: 'Success'
    }
  }
}

async function bettingProcessBet__P88Bet(
  accountInfo: AccountType,
  ticket: DataPlaceBet,
  dataMultiTicket: TypeGetTickets_P88
) {
  try {
    const { proxyIP, proxyPort, proxyUsername, proxyPassword } = accountInfo
    const proxyUrl =
      proxyIP && proxyPort && proxyUsername && proxyPassword
        ? `http://${proxyUsername}:${proxyPassword}@${proxyIP}:${proxyPort}`
        : undefined
    const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined
    const urlBetPlacement = `https://www.p88.bet/bet-placement/buyV2?uniqueRequestId=${uuidv4()}&locale=en_US&_=${Date.now()}&withCredentials=true`
    const body = JSON.stringify({
      oddsFormat: 4,
      acceptBetterOdds: false,
      selections: [
        {
          stake:
            ticket.betAmount > dataMultiTicket[0].maxStake
              ? dataMultiTicket[0].maxStake
              : ticket.betAmount,
          selectionId: dataMultiTicket[0].selectionId,
          odds: dataMultiTicket[0].odds,
          wagerType: 'NORMAL',
          uniqueRequestId: uuidv4()
        }
      ]
    })

    logToFile(
      accountInfo.platformName,
      accountInfo.loginID,
      `Betting Info:[${accountInfo.loginID}] ${ticket.nameHome} -vs- ${ticket.nameAway} : ${ticket.bet} @${ticket.hdp_point}, ${dataMultiTicket[0].odds}`,
      'BetList'
    )
    const resBetPlacement = await fetch(urlBetPlacement, {
      method: 'POST',
      headers: {
        ...HEADERS_P88BET,
        Cookie: accountInfo.cookie
      },
      ...(proxyAgent && { agent: proxyAgent }),
      body
    })

    const dataBetPlacement = await resBetPlacement.json()
    const response = dataBetPlacement?.response
    if (response.length === 0) {
      logToFile(
        accountInfo.platformName,
        accountInfo.loginID,
        `Response Bet Placement Fail: ${JSON.stringify(dataBetPlacement)}`,
        'BetList'
      )
      return {
        ErrorCode: 1,
        Info: `Error: ${dataBetPlacement.errorMessage}`,
        receiptID: ''
      }
    }

    if (response[0]?.status !== 'ACCEPTED') {
      logToFile(
        accountInfo.platformName,
        accountInfo.loginID,
        `Response Bet Placement Fail: ${JSON.stringify(dataBetPlacement)}`,
        'BetList'
      )
      return {
        ErrorCode: 1,
        Info: `Error: ${dataBetPlacement.response[0].errorCode}`,
        receiptID: ''
      }
    }

    logToFile(
      accountInfo.platformName,
      accountInfo.loginID,
      `Response Bet Placement: ${JSON.stringify(dataBetPlacement.response[0])}`,
      'BetList'
    )
    return {
      ErrorCode: 0,
      Info: 'Bet Success',
      receiptID: dataBetPlacement.response[0].wagerId + ''
    }
  } catch (error) {
    console.log(
      'Betting/ProcessBet Fail P88Bet:',
      error instanceof Error ? error.message : String(error)
    )
    logToFile(
      accountInfo.platformName,
      accountInfo.loginID,
      `Betting/ProcessBet Fail: ${error instanceof Error ? error.message : String(error)}`,
      'BetList'
    )
    return {
      ErrorCode: 1,
      Info: `Error: ProcessBet Fail ${error instanceof Error ? error.message : 'Unknown Error'}`,
      receiptID: ''
    }
  }
}
