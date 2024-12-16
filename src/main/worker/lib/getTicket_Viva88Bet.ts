import fetch from 'node-fetch'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { configHeaders } from '@/worker/lib/configHeadersViva88Bet'
import { logToFile } from '@/worker/lib/logToFile'
import { toQueryString } from '@/worker/lib/toQueryString'
import { SPREAD } from '@shared/constants'
import { AccountType, DataPlaceBet } from '@shared/types'
import { TypeGetTickets_Viva88 } from '@shared/typesViva88'
import { loginCheckin_Viva88Bet } from '@/worker/lib/loginCheckin_Viva88Bet'

export async function getTicket_Viva88Bet(accountInfo: AccountType, ticket: DataPlaceBet) {
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

  const { ErrorCode, Data } = await loginCheckin_Viva88Bet(accountInfo)

  if (ErrorCode !== 0) {
    return {
      ErrorCode: 1,
      Data
    }
  }

  try {
    const { proxyIP, proxyPort, proxyUsername, proxyPassword } = accountInfo
    const proxyUrl =
      proxyIP && proxyPort && proxyUsername && proxyPassword
        ? `http://${proxyUsername}:${proxyPassword}@${proxyIP}:${proxyPort}`
        : undefined
    const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined
    const urlGetTickets = `${accountInfo.host}/Betting/GetTickets`
    const {
      bet,
      nameHome,
      home_over,
      away_under,
      hdp_point,
      betType,
      altLineId,
      idEvent,
      nameAway
    } = ticket

    let odd: number, line: number, hdp1: number, hdp2: number

    if (ticket.typeOdd == SPREAD) {
      odd = bet === nameHome ? home_over : away_under
      line = bet === nameHome ? hdp_point : hdp_point * -1
      hdp1 = hdp_point > 0 ? 0 : hdp_point * -1
      hdp2 = hdp_point > 0 ? hdp_point : 0
    } else {
      odd = bet === 'Over' ? home_over : away_under
      line = hdp_point
      hdp1 = hdp_point
      hdp2 = 0
    }
    const itemList = [
      {
        Type: 'OU',
        Bettype: betType,
        Oddsid: altLineId + '',
        Odds: odd + '',
        Line: line + '',
        Hdp1: hdp1 + '',
        Hdp2: hdp2 + '',
        Hscore: '',
        Ascore: '',
        Betteam: bet === 'Under' || bet === nameAway ? 'a' : 'h',
        Stake: '',
        Matchid: idEvent + '',
        ChoiceValue: bet + '',
        SrcOddsInfo: '',
        Home: nameHome,
        Away: nameAway,
        Gameid: '1',
        ProgramID: '',
        RaceNum: '0',
        Runner: '0',
        AcceptBetterOdds: 'true',
        isQuickBet: 'false',
        isTablet: 'false',
        IsInPlay: 'false',
        parentMatchId: '0',
        MMR: ''
      }
    ]
    const additionalParams = {
      lastReq: `${Math.floor(Date.now() / 1000)}`,
      OddsType: '4',
      WebSkinType: '3',
      LicUserName: ''
    }
    logToFile(
      accountInfo.platformName,
      accountInfo.loginID,
      `Get Ticket Info:[${accountInfo.loginID}]  ${ticket.nameHome} -vs- ${ticket.nameAway} : ${ticket.bet} @${ticket.hdp_point}`,
      'BetList'
    )

    const bodyGetTickets = toQueryString(itemList, additionalParams)

    const resGetTickets = await fetch(urlGetTickets, {
      method: 'POST',
      headers: { ...configHeaders(accountInfo), Authorization: `bearer ${Data}` },
      ...(proxyAgent && { agent: proxyAgent }),
      body: bodyGetTickets
    })

    const dataGetTickets: TypeGetTickets_Viva88 = await resGetTickets.json()

    logToFile(
      accountInfo.platformName,
      accountInfo.loginID,
      `Response GetTicket: ${JSON.stringify(dataGetTickets)}`,
      'BetList'
    )
    if (dataGetTickets.ErrorCode !== 0) {
      logToFile(
        accountInfo.platformName,
        accountInfo.loginID,
        `Error GetTicket: ${JSON.stringify(dataGetTickets)}`,
        'BetList'
      )
      return {
        ErrorCode: 1,
        Data: 'Error: Get Ticket Fail'
      }
    }
    const itemListProcessBet = [
      {
        Type: 'OU',
        Bettype: betType,
        Oddsid: altLineId + '',
        Odds: odd + '',
        Line: line + '',
        Hdp1: hdp1 + '',
        Hdp2: hdp2 + '',
        Hscore: dataGetTickets.Data[0].LiveHomeScore + '',
        Ascore: dataGetTickets.Data[0].LiveAwayScore + '',
        Betteam: bet === 'Under' || bet === nameAway ? 'a' : 'h',
        Stake:
          +ticket.betAmount > parseFloat(dataGetTickets.Data[0].Maxbet.replace(/,/g, ''))
            ? dataGetTickets.Data[0].Maxbet
            : ticket.betAmount,
        Matchid: idEvent + '',
        ChoiceValue: bet + '',
        SrcOddsInfo: '',
        ErrorCode: dataGetTickets.ErrorCode + '',
        Home: nameHome,
        Away: nameAway,
        Gameid: '1',
        ProgramID: '',
        RaceNum: '0',
        Runner: '0',
        MRPercentage: '',
        AcceptBetterOdds: 'true',
        isQuickBet: 'true',
        isTablet: 'false',
        IsInPlay: 'false',
        sinfo: dataGetTickets.Data[0].sinfo,
        parentMatchId: '0',
        RecommendType: '0',
        Guid: dataGetTickets.Data[0].Guid,
        TicketTime: '0',
        MMR: '',
        LuckyDrawMinBet: ''
      }
    ]

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

    if (+ticket.betAmount < parseFloat(dataGetTickets.Data[0].Minbet.replace(/,/g, ''))) {
      logToFile(
        accountInfo.platformName,
        accountInfo.loginID,
        `Error: Bet Amount [${ticket.betAmount}] less than Min Bet [${parseFloat(dataGetTickets.Data[0].Minbet.replace(/,/g, ''))}]`,
        'BetList'
      )

      return {
        ErrorCode: 1,
        Data: `Error: Bet Amount [${ticket.betAmount}] less than Min Bet [${parseFloat(dataGetTickets.Data[0].Minbet.replace(/,/g, ''))}]`
      }
    }

    return {
      ErrorCode: 0,
      Data: itemListProcessBet
    }
  } catch (error) {
    console.log(
      'Fetch Viva88 GetTickets Fail',
      error instanceof Error ? error.message : String(error)
    )
    logToFile(
      accountInfo.platformName,
      accountInfo.loginID,
      `GetTickets Fail: ${error instanceof Error ? error.message : String(error)}`,
      'BetList'
    )

    return {
      ErrorCode: 1,
      Data: `Error: Get Ticket Fail ${error instanceof Error ? error.message : 'Unknown Error'}`
    }
  }
}
