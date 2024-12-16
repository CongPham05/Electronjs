/* eslint-disable @typescript-eslint/no-explicit-any */
import fetch from 'node-fetch'
import { parentPort } from 'worker_threads'
import { HttpsProxyAgent } from 'https-proxy-agent'
import {
  FH,
  FT,
  gameTypeMapP88,
  HDP_FH,
  HDP_FT,
  HEADERS_P88BET,
  OU_FH,
  OU_FT,
  SPREAD,
  TOTAL
} from '@shared/constants'
import { AccountType, NameTeamType, SettingType } from '@shared/types'
import Model, { Account, clearTable, createModel, NameTeam, Setting } from '@db/model'
import { logToFile } from '@/worker/lib/logToFile'
import { toPositiveNumber } from '@/worker/lib/toPositiveNumber'
import dataCrawlByPlatformSchema from '@db/schema/dataCrawlByPlatform'
import { getBalanceP88bet } from '@/worker/lib/getBalanceP88bet'
import { convertHDP } from '@shared/convertHDP'
import { isAccountActive } from '@/worker/lib/checkAccount'

let gameType: string | null = null

const port = parentPort
if (!port) throw new Error('IllegalState')

port.on('message', async (action: string) => {
  if (action == 'Start') {
    handleCrawlData()
  }
})

const handleCrawlData = async () => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    clearTable('P88Bet')

    const listAccount = Account.findAll({
      platformName: 'P88Bet',
      status: 'Logout',
      statusLogin: 'Success'
    }) as AccountType[]

    if (!listAccount.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      continue
    }

    for (const account of listAccount) {
      clearTable('P88Bet')
      await fnCrawlData(account)
    }
  }
}
const fnCrawlData = async (account: AccountType) => {
  const settings = Setting.findAll() as SettingType[]
  if (!settings.length) return

  gameType = settings[0].gameType
  if (!gameType || gameType === 'None') return

  const accountRefresh = Account.findOne({ id: account.id }) as AccountType
  if (!accountRefresh) return
  if (accountRefresh.typeCrawl !== gameType) {
    logToFile(
      account.platformName,
      account.loginID,
      `GameType changed, refresh to sync.`,
      'Program'
    )

    isAccountActive(account.id) &&
      port.postMessage({
        type: 'DataUpdateAccount',
        data: Account.update(
          { id: account.id },
          {
            textLog: 'GameType changed, refresh to sync.'
          }
        )
      })

    await new Promise((resolve) => setTimeout(resolve, 200))
    return
  }

  const { proxyIP, proxyPort, proxyUsername, proxyPassword } = account

  const proxyUrl =
    proxyIP && proxyPort && proxyUsername && proxyPassword
      ? `http://${proxyUsername}:${proxyPassword}@${proxyIP}:${proxyPort}`
      : undefined

  const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined

  if (!isAccountActive(account.id)) return

  const { ErrorCode, Data } = await getBalanceP88bet(account)

  if (ErrorCode == 106 || ErrorCode == 107 || ErrorCode == -1) {
    logToFile(account.platformName, account.loginID, `${Data}`, 'Program')

    const dataAccount = Account.findOne({ id: account.id }) as AccountType
    if (dataAccount.autoLogin == 1) {
      port.postMessage({
        type: 'LoggedAgain',
        data: Account.update(
          { id: account.id },
          {
            statusLogin: 'Fail',
            textLog: 'Logged Again ...',
            credit: '0',
            cookie: null,
            host: null,
            socketUrl: null
          }
        )
      })
    } else {
      port.postMessage({
        type: 'DataUpdateAccount',
        data: Account.update(
          { id: account.id },
          {
            status: 'Exit',
            statusLogin: 'Fail',
            textLog: Data
          }
        )
      })
    }

    return
  }
  // else if (ErrorCode == -1) {
  //   logToFile(account.platformName, account.loginID, `${Data}`, 'Program')

  //   isAccountActive(account.id) &&
  //     port.postMessage({
  //       type: 'DataUpdateAccount',
  //       data: Account.update(
  //         { id: account.id },
  //         {
  //           status: 'Exit',
  //           statusLogin: 'Fail',
  //           textLog: Data
  //         }
  //       )
  //     })
  //   return
  // }

  isAccountActive(account.id) &&
    port.postMessage({
      type: 'DataUpdateAccount',
      data: Account.update({ id: account.id }, { credit: Data })
    })

  try {
    const mk: number = gameTypeMapP88[gameType] //(0-Early;1-Today;2-Live)
    const delay = mk === 2 ? 1000 : mk === 1 ? 500 : 0
    await new Promise((resolve) => setTimeout(resolve, delay))

    logToFile(account.platformName, account.loginID, `Get Soccer ${gameType}...`, 'Program')
    isAccountActive(account.id) &&
      port.postMessage({
        type: 'DataUpdateAccount',
        data: Account.update(
          { id: account.id },
          {
            textLog: `Get Soccer ${gameType}...`
          }
        )
      })
    await new Promise((resolve) => setTimeout(resolve, 200))

    const url = `https://www.p88.bet/sports-service/sv/odds/events?mk=${mk}&sp=29&ot=4&btg=1&o=1&lg=&ev=&d=&l=100&v=0&me=0&more=false&c=MY&tm=0&g=QQ%3D%3D&pa=0&cl=100&_g=0&wm=dz&_=${Date.now()}&locale=en_US`
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        ...HEADERS_P88BET,
        Cookie: account.cookie
      },
      ...(proxyAgent && { agent: proxyAgent })
    })
    const resData = await res.json()

    let dataP88: any
    if (mk === 0 || mk === 1) {
      dataP88 = resData.n[0][2]
    } else if (mk === 2) {
      dataP88 = resData.l[0][2]
    }

    if (!dataP88.length) {
      logToFile(account.platformName, account.loginID, `Soccer ${gameType}: No data.`, 'Program')
      isAccountActive(account.id) &&
        port.postMessage({
          type: 'DataUpdateAccount',
          data: Account.update(
            { id: account.id },
            {
              textLog: `Soccer ${gameType}: No data.`
            }
          )
        })

      await new Promise((resolve) => setTimeout(resolve, 500))
      return
    }

    await handleData({ dataP88, account })
  } catch (error) {
    console.error(
      'Error Crawl Data P88Bet:',
      error instanceof Error ? error.message : String(error)
    )
    logToFile(
      account.platformName,
      account.loginID,
      `Error Crawl Data P88Bet And LoggedAgain: ${error instanceof Error ? error.message : 'Unstable network, proxy or server-side issue.'}`,
      'Program'
    )
    isAccountActive(account.id) &&
      port.postMessage({
        type: 'LoggedAgain',
        data: Account.update(
          { id: account.id },
          {
            statusLogin: 'Fail',
            textLog: 'Logged Again ...',
            credit: '0',
            cookie: null,
            host: null,
            socketUrl: null
          }
        )
      })
    return
  }

  gameType !== 'Early' && (await new Promise((resolve) => setTimeout(resolve, 500)))
}

const handleData = async ({ dataP88, account }) => {
  const P88Bet = createModel('P88Bet', dataCrawlByPlatformSchema)

  const timeStart = new Date().getTime()
  const records: any[] = []
  const BATCH_SIZE: number = 50

  if (!isAccountActive(account.id) || !checkGameType()) return
  for (const league of dataP88) {
    if (!isAccountActive(account.id) || !checkGameType()) return

    const [id, name, events] = league

    for (const event of events) {
      if (!isAccountActive(account.id) || !checkGameType()) return

      const idEvent = event[0]
      const home = event[1]
      const away = event[2]

      const standardHomeName = NameTeam.findOne({
        nameTeam: home.trim(),
        nameLeague: name.trim(),
        platform: 'P88Bet'
      }) as NameTeamType
      const standardAwayName = NameTeam.findOne({
        nameTeam: away.trim(),
        nameLeague: name.trim(),
        platform: 'P88Bet'
      }) as NameTeamType

      if (!standardHomeName || !standardAwayName) {
        continue
      }

      if (event && event[8] && event[8]['0'] && event[8]['0'][0]) {
        if (!isAccountActive(account.id) || !checkGameType()) return

        const periodsFull = event[8]['0'][0]
        if (periodsFull && periodsFull.length > 0) {
          for (const periodFull of periodsFull) {
            if (!isAccountActive(account.id) || !checkGameType()) return

            records.push({
              platform: 'P88Bet',
              idLeague: id,
              nameLeague: name,
              idEvent,
              nameHome: home.trim(),
              nameAway: away.trim(),
              number: FT,
              altLineId: periodFull[7],
              hdp_point: periodFull[1],
              home_over: +periodFull[3],
              away_under: +periodFull[4],
              typeOdd: SPREAD,
              league: standardHomeName.league,
              home: standardHomeName.team,
              away: standardAwayName.team,
              specialOdd: periodFull[8],
              betType: HDP_FT,
              HDP: convertHDP[toPositiveNumber(periodFull[1])]
            })

            if (records.length >= BATCH_SIZE) {
              insertRecords(records, P88Bet)
            }
          }
        }
      }
      if (event && event[8] && event[8]['0'] && event[8]['0'][1]) {
        if (!isAccountActive(account.id) || !checkGameType()) return

        const totalsFull = event[8]['0'][1]
        if (totalsFull && totalsFull.length > 0) {
          for (const totalFull of totalsFull) {
            if (!isAccountActive(account.id) || !checkGameType()) return

            records.push({
              platform: 'P88Bet',
              idLeague: id,
              nameLeague: name,
              idEvent,
              nameHome: home.trim(),
              nameAway: away.trim(),
              number: FT,
              altLineId: totalFull[4],
              hdp_point: totalFull[1],
              home_over: +totalFull[2],
              away_under: +totalFull[3],
              typeOdd: TOTAL,
              league: standardHomeName.league,
              home: standardHomeName.team,
              away: standardAwayName.team,
              specialOdd: totalFull[5],
              betType: OU_FT,
              HDP: convertHDP[toPositiveNumber(totalFull[1])]
            })
            if (records.length >= BATCH_SIZE) {
              insertRecords(records, P88Bet)
            }
          }
        }
      }
      if (event && event[8] && event[8]['1'] && event[8]['1'][0]) {
        if (!isAccountActive(account.id) || !checkGameType()) return

        const periodsHalf = event[8]['1'][0]
        if (periodsHalf && periodsHalf.length > 0) {
          if (!isAccountActive(account.id) || !checkGameType()) return

          for (const periodHalf of periodsHalf) {
            if (!isAccountActive(account.id) || !checkGameType()) return

            records.push({
              platform: 'P88Bet',
              idLeague: id,
              nameLeague: name,
              idEvent,
              nameHome: home.trim(),
              nameAway: away.trim(),
              number: FH,
              altLineId: periodHalf[7],
              hdp_point: periodHalf[1],
              home_over: +periodHalf[3],
              away_under: +periodHalf[4],
              typeOdd: SPREAD,
              league: standardHomeName.league,
              home: standardHomeName.team,
              away: standardAwayName.team,
              specialOdd: periodHalf[8],
              betType: HDP_FH,
              HDP: convertHDP[toPositiveNumber(periodHalf[1])]
            })
            if (records.length >= BATCH_SIZE) {
              insertRecords(records, P88Bet)
            }
          }
        }
      }
      if (event && event[8] && event[8]['1'] && event[8]['1'][1]) {
        if (!isAccountActive(account.id) || !checkGameType()) return

        const totalsHalf = event[8]['1'][1]
        if (totalsHalf && totalsHalf.length > 0) {
          for (const totalHalf of totalsHalf) {
            if (!isAccountActive(account.id) || !checkGameType()) return

            records.push({
              platform: 'P88Bet',
              idLeague: id,
              nameLeague: name,
              idEvent,
              nameHome: home.trim(),
              nameAway: away.trim(),
              number: FH,
              altLineId: totalHalf[4],
              hdp_point: totalHalf[1],
              home_over: +totalHalf[2],
              away_under: +totalHalf[3],
              typeOdd: TOTAL,
              league: standardHomeName.league,
              home: standardHomeName.team,
              away: standardAwayName.team,
              specialOdd: totalHalf[5],
              betType: OU_FH,
              HDP: convertHDP[toPositiveNumber(totalHalf[1])]
            })
            if (records.length >= BATCH_SIZE) {
              insertRecords(records, P88Bet)
            }
          }
          if (!isAccountActive(account.id) || !checkGameType()) return
        }
      }
    }
  }

  if (records.length > 0) {
    insertRecords(records, P88Bet)
  }

  if (!isAccountActive(account.id) || !checkGameType()) return

  const timeEnd = new Date().getTime()
  logToFile(account.platformName, account.loginID, `Done. (${timeEnd - timeStart}ms)`, 'Program')

  isAccountActive(account.id) &&
    port.postMessage({
      type: 'DataUpdateAccount',
      data: Account.update(
        { id: account.id },
        {
          textLog: `Done. (${timeEnd - timeStart}ms)`
        }
      )
    })
  await new Promise((resolve) => setTimeout(resolve, 200))
}

const checkGameType = () => {
  const settingInfo = Setting.findAll()
  const gameTypeCurrent = settingInfo[0]?.gameType
  return gameType === gameTypeCurrent ? true : false
}

const insertRecords = (records: any, P88Bet: Model) => {
  for (const record of records) {
    P88Bet.insertMany([record])
  }

  records.length = 0
}
