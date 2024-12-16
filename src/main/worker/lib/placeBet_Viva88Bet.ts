import fetch from 'node-fetch'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { configHeaders } from '@/worker/lib/configHeadersViva88Bet'
import { logToFile } from '@/worker/lib/logToFile'
import { toQueryString } from '@/worker/lib/toQueryString'
import { AccountType, DataPlaceBet } from '@shared/types'
import { TypeGetBetListApi } from '@shared/typesViva88'
import { loginCheckin_Viva88Bet } from '@/worker/lib/loginCheckin_Viva88Bet'

export const placeBet_Viva88Bet = async (ticket: DataPlaceBet, accountInfo: AccountType, data) => {
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

  const { ErrorCode: ErrorCode_LoginCheckin, Data: Data_LoginCheckin } =
    await loginCheckin_Viva88Bet(accountInfo)
  if (ErrorCode_LoginCheckin !== 0) {
    return {
      ErrorCode: 1,
      Data: { info: Data_LoginCheckin, receiptStatus: 'Fail' }
    }
  }
  const authorization = Data_LoginCheckin

  const {
    ErrorCode: ErrorCode_ProcessBet,
    Info,
    receiptID
  } = await bettingProcessBet__Viva88Bet(accountInfo, authorization, data)

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

async function bettingProcessBet__Viva88Bet(
  accountInfo: AccountType,
  authorization: string,
  itemListProcessBet
) {
  try {
    const { proxyIP, proxyPort, proxyUsername, proxyPassword } = accountInfo
    const proxyUrl =
      proxyIP && proxyPort && proxyUsername && proxyPassword
        ? `http://${proxyUsername}:${proxyPassword}@${proxyIP}:${proxyPort}`
        : undefined
    const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined
    const urlProcessBet = `${accountInfo.host}/Betting/ProcessBet`
    const paramsProcessBet = {
      OddsType: '4',
      WebSkinType: '3',
      LicUserName: ''
    }
    const bodyProcessBet = toQueryString(itemListProcessBet, paramsProcessBet)
    const resProcessBet = await fetch(urlProcessBet, {
      method: 'POST',
      headers: { ...configHeaders(accountInfo), Authorization: `bearer ${authorization}` },
      ...(proxyAgent && { agent: proxyAgent }),
      body: bodyProcessBet
    })

    const dataProcessBet: TypeGetBetListApi = await resProcessBet.json()
    if (
      dataProcessBet.ErrorCode === 0 &&
      dataProcessBet.Data.ItemList[0].TransId_Cash &&
      dataProcessBet.Data.ItemList[0].TransId_Cash !== '0'
    ) {
      logToFile(
        accountInfo.platformName,
        accountInfo.loginID,
        `Response Betting/ProcessBet Success: ${JSON.stringify(dataProcessBet)}`,
        'BetList'
      )
      return {
        ErrorCode: 0,
        Info: 'Bet Success',
        receiptID: `${dataProcessBet.Data.ItemList[0].TransId_Cash}`
      }
    }
    logToFile(
      accountInfo.platformName,
      accountInfo.loginID,
      `Response Betting/ProcessBet Fail: ${JSON.stringify(dataProcessBet)}`,
      'BetList'
    )
    return {
      ErrorCode: 1,
      Info: `Error: Betting/ProcessBet Fail`,
      receiptID: ''
    }
  } catch (error) {
    console.log(
      'Betting/ProcessBet Fail ViVa88Bet:',
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
      Info: `Error: Betting/ProcessBet Fail ${error instanceof Error ? error.message : 'Unknown Error'}`,
      receiptID: ''
    }
  }
}
