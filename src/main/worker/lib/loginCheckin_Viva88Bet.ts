import { configHeaders } from '@/worker/lib/configHeadersViva88Bet'
import { logToFile } from '@/worker/lib/logToFile'
import { AccountType } from '@shared/types'
import { LoginCheckinIndex } from '@shared/typesViva88'
import { HttpsProxyAgent } from 'https-proxy-agent'

export async function loginCheckin_Viva88Bet(accountInfo: AccountType) {
  try {
    const { proxyIP, proxyPort, proxyUsername, proxyPassword } = accountInfo
    const proxyUrl =
      proxyIP && proxyPort && proxyUsername && proxyPassword
        ? `http://${proxyUsername}:${proxyPassword}@${proxyIP}:${proxyPort}`
        : undefined
    const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined
    const urlLoginCheckin = `${accountInfo.host}/LoginCheckin/Index`
    const resLoginCheckin = await fetch(urlLoginCheckin, {
      method: 'POST',
      headers: configHeaders(accountInfo),
      ...(proxyAgent && { agent: proxyAgent })
    })

    const dataLoginCheckInIndex: LoginCheckinIndex = await resLoginCheckin.json()
    if (dataLoginCheckInIndex.ErrorCode !== 0) {
      logToFile(
        accountInfo.platformName,
        accountInfo.loginID,
        `Get LoginCheckin/Index Fail:${JSON.stringify(dataLoginCheckInIndex)}`,
        'BetList'
      )
      return {
        ErrorCode: 1,
        Data: 'Error: Get LoginCheckin Fail'
      }
    }

    logToFile(
      accountInfo.platformName,
      accountInfo.loginID,
      `Response LoginCheckin/Index: ${JSON.stringify(dataLoginCheckInIndex)}`,
      'BetList'
    )

    return {
      ErrorCode: 0,
      Data: dataLoginCheckInIndex.Data.at
    }
  } catch (error) {
    console.log(
      'Fetch Viva88 LoginCheckinIndex Fail:',
      error instanceof Error ? error.message : String(error)
    )
    logToFile(
      accountInfo.platformName,
      accountInfo.loginID,
      `LoginCheckin/Index: ${error instanceof Error ? error.message : String(error)}`,
      'BetList'
    )

    return {
      ErrorCode: 1,
      Data: `Error: Get LoginCheckin Fail ${error instanceof Error ? error.message : 'Unknown Error'}`
    }
  }
}
