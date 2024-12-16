import fetch from 'node-fetch'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { logToFile } from '@/worker/lib/logToFile'
import { HEADERS_P88BET, ODD_CODE } from '@shared/constants'
import { AccountType, DataPlaceBet } from '@shared/types'
import { TypeGetTickets_P88 } from '@shared/typesP88'

export const getTicket_P88Bet = async (accountInfo: AccountType, ticket: DataPlaceBet) => {
  if (ticket.selectBet == 'NoBet') {
    logToFile(accountInfo.platformName, accountInfo.loginID, `No Bet By User`, 'BetList')
    return {
      ErrorCode: 400,
      Data: 'No Bet By User'
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
        Data: `Error: CheckOdd setting do not match.`
      }
    }
  }

  try {
    const { proxyIP, proxyPort, proxyUsername, proxyPassword } = accountInfo
    const proxyUrl =
      proxyIP && proxyPort && proxyUsername && proxyPassword
        ? `http://${proxyUsername}:${proxyPassword}@${proxyIP}:${proxyPort}`
        : undefined
    const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined

    const halfType = ticket.number === 0 ? 'FT' : 'FH'
    const oddType = ticket.specialOdd === 1 ? '' : '0'
    const betType = ticket.typeOdd === 'SPREAD' ? 'HDP' : 'POINT'
    const betSide = ticket.bet === ticket.nameHome || ticket.bet === 'Over' ? 'HOME' : 'AWAY'

    const pointSide = ticket.bet === 'Over' ? 'OVER' : 'UNDER'
    const code =
      ODD_CODE[halfType][betType][oddType + betSide] ||
      ODD_CODE[halfType][betType][oddType + pointSide]

    const type = ticket.bet === 'Over' || ticket.bet === ticket.nameHome ? 0 : 1
    const selectionId = `${ticket.altLineId}|${ticket.idEvent}|${code}|${ticket.bet === ticket.nameHome ? ticket.hdp_point : ticket.hdp_point * -1}|${type}`
    const oddsId = `${ticket.idEvent}|${code}|${ticket.bet === ticket.nameHome ? ticket.hdp_point : ticket.hdp_point * -1}`

    const urlMultiTicket = `https://www.p88.bet/member-service/v2/all-odds-selections?locale=en_US&_=${Date.now()}&withCredentials=true`

    const body = JSON.stringify({
      oddsSelections: [
        {
          oddsFormat: 4,
          oddsSelectionsType: 'NORMAL',
          selectionId,
          oddsId
        }
      ]
    })

    logToFile(
      accountInfo.platformName,
      accountInfo.loginID,
      `Get Multi Ticket Data:[${accountInfo.loginID}] ${ticket.nameHome} -vs- ${ticket.nameAway} : ${ticket.bet} @${ticket.hdp_point}`,
      'BetList'
    )

    const response = await fetch(urlMultiTicket, {
      method: 'POST',
      headers: {
        ...HEADERS_P88BET,
        Cookie: accountInfo.cookie
      },
      ...(proxyAgent && { agent: proxyAgent }),
      body
    })

    const dataMultiTicket: TypeGetTickets_P88 = await response.json()

    if ('error' in dataMultiTicket && dataMultiTicket.error === 403) {
      logToFile(
        accountInfo.platformName,
        accountInfo.loginID,
        `MultiTicket Error 403: ${JSON.stringify(dataMultiTicket)}`,
        'BetList'
      )
      return {
        ErrorCode: 1,
        Data: 'Error: Get Ticket Forbidden (403)'
      }
    }

    if (dataMultiTicket[0].status !== 'OK') {
      logToFile(
        accountInfo.platformName,
        accountInfo.loginID,
        `MultiTicket Fail: ${JSON.stringify(dataMultiTicket)}`,
        'BetList'
      )
      return {
        ErrorCode: 1,
        Data: `Error: Get Ticket ${dataMultiTicket[0].status}`
      }
    }

    if (+accountInfo.credit < +ticket.betAmount) {
      logToFile(
        accountInfo.platformName,
        accountInfo.loginID,
        `Error: Insufficient account balance for BetAmount settings.`,
        'BetList'
      )

      return {
        ErrorCode: 1,
        Data: 'Error: Insufficient account balance for BetAmount settings.'
      }
    }

    if (+ticket.betAmount < dataMultiTicket[0].minStake) {
      logToFile(
        accountInfo.platformName,
        accountInfo.loginID,
        `Error: Bet Amount [${ticket.betAmount}] less than Min Bet [${dataMultiTicket[0].minStake}]`,
        'BetList'
      )

      return {
        ErrorCode: 1,
        Data: `Error: Bet Amount [${ticket.betAmount}] less than Min Bet [${dataMultiTicket[0].minStake}]`
      }
    }

    logToFile(
      accountInfo.platformName,
      accountInfo.loginID,
      `Response MultiTicket: ${JSON.stringify(dataMultiTicket)}`,
      'BetList'
    )
    return {
      ErrorCode: 0,
      Data: dataMultiTicket
    }
  } catch (error) {
    console.log(
      'Fetch P88 Get Ticket Fail:',
      error instanceof Error ? error.message : String(error)
    )

    logToFile(
      accountInfo.platformName,
      accountInfo.loginID,
      `Get Ticket Fail: ${error instanceof Error ? error.message : String(error)}`,
      'BetList'
    )
    return {
      ErrorCode: 1,
      Data: `Error: Get Ticket Fail ${error instanceof Error ? error.message : 'Unknown Error'}`
    }
  }
}
