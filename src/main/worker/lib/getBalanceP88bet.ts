import fetch from 'node-fetch'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { HEADERS_P88BET } from '@shared/constants'
import { AccountType } from '@shared/types'
import { logToFile } from '@/worker/lib/logToFile'

export const getBalanceP88bet = async (account: AccountType) => {
  const { proxyIP, proxyPort, proxyUsername, proxyPassword } = account
  const proxyUrl =
    proxyIP && proxyPort && proxyUsername && proxyPassword
      ? `http://${proxyUsername}:${proxyPassword}@${proxyIP}:${proxyPort}`
      : undefined
  const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined

  try {
    const url = `https://www.p88.bet/member-service/v2/account-balance?locale=en_US&_=${Date.now()}&withCredentials=true`
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        ...HEADERS_P88BET,
        Cookie: account.cookie
      },
      ...(proxyAgent && { agent: proxyAgent })
    })
    const resData = await res.json()

    logToFile(
      account.platformName,
      account.loginID,
      `Response AccountBalance:${JSON.stringify(resData)}`,
      'Program'
    )
    if (resData.error == 'MULTIPLE_LOGIN') {
      return { ErrorCode: 106, Data: 'Another session logged in. Forced to logout.' }
    }

    if (!('betCredit' in resData)) {
      return { ErrorCode: 107, Data: 'EXCEPTION in DoSpiderTask: Account has been logged out.' }
    }

    return { ErrorCode: 0, Data: resData.betCredit }
  } catch (error) {
    console.log(
      'Error fetching account-balance P88:',
      error instanceof Error ? error.message : String(error)
    )

    return {
      ErrorCode: -1,
      Data: `Error Res Balance: ${error instanceof Error ? error.message : 'Unstable network, proxy or server-side issue.'} `
    }
  }
}
