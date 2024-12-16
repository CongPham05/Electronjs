import WebSocket from 'ws'
import crypto from 'crypto'
import { parentPort } from 'worker_threads'
import { Account, clearTable, Setting } from '@db/model'
import { gameTypeMapViva88 } from '@shared/constants'
import { AccountType, SettingType } from '@shared/types'
import { logToFile } from '@/worker/lib/logToFile'
import { getBalanceViva88bet } from '@/worker/lib/getBalanceViva88bet'
import { isAccountActive } from '@/worker/lib/checkAccount'
import { setTimeout } from 'timers/promises'

let pingIntervalId: NodeJS.Timeout | null = null
const pingInterval = 8000
let count = 0
let ws: WebSocket
let gameType: string

const port = parentPort
if (!port) throw new Error('IllegalState')

port.on('message', (accountInfo: AccountType) => {
  handleCrawlData(accountInfo)
})

const handleCrawlData = async (accountInfo: AccountType) => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    count = 0
    const settings = Setting.findAll() as SettingType[]
    if (!settings.length) {
      await setTimeout(1000)
      continue
    }

    gameType = settings[0].gameType
    if (!gameType || gameType == 'None') {
      await setTimeout(1000)
      continue
    }

    const checkAccount = Account.findOne({
      id: accountInfo.id,
      status: 'Logout',
      statusLogin: 'Success'
    }) as AccountType
    if (!checkAccount) {
      await setTimeout(1000)
      continue
    }

    if (checkAccount.typeCrawl !== gameType) {
      logToFile(
        checkAccount.platformName,
        checkAccount.loginID,
        `GameType changed, refresh to sync.`,
        'Program'
      )

      isAccountActive(checkAccount.id) &&
        port?.postMessage({
          type: 'DataUpdateAccount',
          data: Account.update(
            { id: checkAccount.id },
            {
              textLog: 'GameType changed, refresh to sync.'
            }
          )
        })
      await setTimeout(1000)
      continue
    } else {
      initializeWebSocket(checkAccount)
      break
    }
  }
}

function initializeWebSocket(account: AccountType) {
  if (ws) {
    ws.terminate()
  }

  const socketUrl = account.socketUrl
  const { searchParams } = new URL(socketUrl)
  const gid = searchParams.get('gid')
  const token = searchParams.get('token')
  const id = searchParams.get('id')
  const rid = searchParams.get('rid')

  ws = new WebSocket(socketUrl, {
    headers: {
      Host: 'agnj3.viva88.net',
      Connection: 'Upgrade',
      Pragma: 'no-cache',
      'Cache-Control': 'no-cache',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      Upgrade: 'websocket',
      Origin: 'https://d.viva88.net',
      'Sec-WebSocket-Version': 13,
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8,vi;q=0.7',
      'Sec-WebSocket-Key': `${crypto.randomBytes(16).toString('base64')}`,
      'Sec-WebSocket-Extensions': 'permessage-deflate; client_max_window_bits'
    }
  })

  ws.on('open', () => {
    if (pingIntervalId) {
      clearInterval(pingIntervalId)
    }
    pingIntervalId = setInterval(() => sendPing(account), 7000)

    const init =
      42 +
      JSON.stringify([
        'init',
        {
          gid,
          token,
          id,
          rid,
          v: 2
        }
      ])

    ws.send(init)

    const marketid: string = gameTypeMapViva88[gameType] //(E-early;T-today;L-live)
    const sub =
      42 +
      JSON.stringify([
        'subscribe',
        [
          [
            'odds',
            [
              {
                id: 'c3',
                rev: null,
                sorting: 't',
                condition: {
                  sporttype: 1,
                  marketid,
                  no_stream: true,
                  bettype: [1, 3, 7, 8]
                }
              }
            ]
          ]
        ]
      ])

    ws.send(sub)
  })

  ws.on('message', async (message) => {
    const checkAccount = Account.findOne({
      id: account.id,
      status: 'Logout',
      statusLogin: 'Success'
    }) as AccountType

    if (!checkAccount) {
      ws?.close()
      process.exit(0)
    }

    const data = message.toString()

    if (data.startsWith('42')) {
      if (data.includes('disconnectReason') || data.includes('42["err","A002"]')) {
        logToFile(account.platformName, account.loginID, `Logged Again : ${data}`, 'Program')
        const dataAccount = Account.findOne({ id: account.id }) as AccountType

        if (dataAccount.autoLogin == 1) {
          port?.postMessage({
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
          port?.postMessage({
            type: 'DataUpdateAccount',
            data: Account.update(
              { id: account.id },
              {
                status: 'Exit',
                statusLogin: 'Fail',
                textLog: String(data)
              }
            )
          })
        }
        ws?.close()
        process.exit(0)
      }

      isAccountActive(account.id) &&
        port?.postMessage({
          type: 'DataUpdateAccount',
          data: Account.update(
            { id: account.id },
            {
              status: 'Logout',
              statusLogin: 'Success',
              textLog: `Data Event ${count++} / Soccer ${gameType}...`
            }
          )
        })

      logToFile(
        account.platformName,
        account.loginID,
        `Data Event ${count++} / Soccer ${gameType}...`,
        'Program'
      )

      isAccountActive(account.id) &&
        port?.postMessage({
          type: 'DataViva88',
          data
        })
    }
  })

  ws.on('error', (error) => {
    console.error('WebSocket error:', error)
  })

  ws.on('close', () => {
    console.log('WebSocket connection closed')
    if (pingInterval) {
      clearInterval(pingInterval)
      pingIntervalId = null
    }
  })
}

async function sendPing(account: AccountType) {
  const { ErrorCode, Data } = await getBalanceViva88bet(account)

  if (ErrorCode == 106 || ErrorCode == -1) {
    logToFile(account.platformName, account.loginID, `${Data}`, 'Program')

    const dataAccount = Account.findOne({ id: account.id }) as AccountType

    if (dataAccount.autoLogin == 1) {
      port?.postMessage({
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
      port?.postMessage({
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
    ws.close()
    process.exit(0)
  }

  const checkAccount = Account.findOne({ id: account.id, status: 'Logout' }) as AccountType
  const settingInfo = Setting.findAll() as SettingType[]
  if (!checkAccount) {
    ws.close()
    process.exit(0)
  }
  if (gameType !== settingInfo[0].gameType || checkAccount.typeCrawl !== gameType) {
    if (pingIntervalId) {
      clearInterval(pingIntervalId)
    }

    ws.close()
    clearTable('Viva88Bet')
    handleCrawlData(checkAccount)

    return
  }

  isAccountActive(account.id) &&
    port?.postMessage({
      type: 'DataUpdateAccount',
      data: Account.update({ id: account.id }, { credit: Data })
    })

  if (ws.readyState === WebSocket.OPEN) {
    ws.send('2')
  }
}
