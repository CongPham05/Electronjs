import { BrowserWindow } from 'electron'
import { AccountType } from '@shared/types'
import { Worker } from 'worker_threads'
import { logToFile } from '@/worker/lib/logToFile'

import createWorkerLoginP88 from './P88/workerLoginP88?nodeWorker'
import createWorkerCrawlP88 from './P88/workerCrawlP88?nodeWorker'

import createWorkerLoginViva88 from './Viva88/workerLoginViva88?nodeWorker'
import createWorkerCrawlViva88 from './Viva88/workerCrawlViva88?nodeWorker'
import createWorkerHandleDataViva88 from './Viva88/workerHandleDataViva88?nodeWorker'

import createWorkerPair from './workerPair?nodeWorker'
import createWorkerPlaceBet from './workerPlaceBet?nodeWorker'
import { Account } from '@db/model'

let queue_P88Bet: AccountType[] = []
let queue_Viva88Bet: AccountType[] = []
let isProcessingQueueP88Bet = false
let isProcessingQueueViva88Bet = false

const workers: { [key: string]: Worker | null } = {}
let workerCrawlP88: Worker | null = null
let workerHandleDataViva88: Worker | null = null

let workerPair: Worker | null = null
let workerPlaceBet: Worker | null = null

const workerCreators = {
  P88Bet: createWorkerLoginP88,
  Viva88Bet: createWorkerLoginViva88
}

function handleWorkerMessages(worker: Worker, account: AccountType, mainWindow: BrowserWindow) {
  worker.on('message', async ({ type, data }) => {
    if (type === 'TooManyRequests') {
      sendAccountUpdate(account.id, mainWindow, data)
      const timeoutId = setTimeout(() => {
        startWorker(account, mainWindow)
        clearTimeout(timeoutId)
      }, 8000)
    }

    if (type === 'DataUpdateAccount') {
      sendAccountUpdate(account.id, mainWindow, data)
    }

    if (type === 'LoginSuccess') {
      const workerCrawlViva88 = createWorkerCrawlViva88({ workerData: 'worker' })
      workerCrawlViva88.postMessage(data)
      workerCrawlViva88.on('message', ({ type, data }) => {
        if (type === 'DataUpdateAccount') {
          sendAccountUpdate(account.id, mainWindow, data)
        }

        if (type === 'DataViva88') {
          if (!workerHandleDataViva88) {
            workerHandleDataViva88 = createWorkerHandleDataViva88({ workerData: 'worker' })
          }
          workerHandleDataViva88.postMessage({ data })
        }

        if (type == 'LoggedAgain') {
          sendAccountUpdate(account.id, mainWindow, data)
          enqueueWorker(data, mainWindow)
        }
      })

      workerCrawlViva88.on('exit', async () => {
        console.log(`workerCrawlViva88 [${account.loginID}] Exit ....`)
      })
    }
  })

  worker.on('exit', async (code) => {
    if (code !== 0) {
      console.error(`Worker stopped with exit code ${code}`)
    }

    const accountKey = account.loginID
    workers[accountKey] = null

    if (account.platformName === 'P88Bet') {
      queue_P88Bet = queue_P88Bet.filter((acc) => acc.loginID !== accountKey)
      if (isProcessingQueueP88Bet) {
        isProcessingQueueP88Bet = false
        processQueue_P88Bet(mainWindow)
      }
    } else {
      queue_Viva88Bet = queue_Viva88Bet.filter((acc) => acc.loginID !== accountKey)
      if (isProcessingQueueViva88Bet) {
        isProcessingQueueViva88Bet = false
        processQueue_Viva88Bet(mainWindow)
      }
    }

    console.log(`Worker exit ${account.loginID}`)
  })

  worker.on('error', (error) => {
    console.error('Worker error:', error)
  })
}

function processQueue_P88Bet(mainWindow: BrowserWindow) {
  if (isProcessingQueueP88Bet || queue_P88Bet.length === 0) return

  const account = queue_P88Bet.shift()
  if (account) {
    startWorker(account, mainWindow)
  }
}

function processQueue_Viva88Bet(mainWindow: BrowserWindow) {
  if (isProcessingQueueViva88Bet || queue_Viva88Bet.length === 0) return

  const account = queue_Viva88Bet.shift()
  if (account) {
    startWorker(account, mainWindow)
  }
}

export function enqueueWorker(account: AccountType, mainWindow: BrowserWindow) {
  if (account.platformName == 'P88Bet') {
    queue_P88Bet.push(account)
    processQueue_P88Bet(mainWindow)
  } else {
    queue_Viva88Bet.push(account)
    processQueue_Viva88Bet(mainWindow)
  }
}

export function startWorker(account: AccountType, mainWindow: BrowserWindow) {
  const accountKey = account.loginID
  if (workers[accountKey]) {
    console.log(`Worker for ${accountKey} is already running.`)
    return
  }

  const createWorkerFunc = workerCreators[account.platformName]

  if (createWorkerFunc) {
    logToFile(account.platformName, account.loginID, `Start handle crawl data ...`, 'Program')
    const worker = createWorkerFunc({ workerData: 'worker' })
    workers[accountKey] = worker
    worker.postMessage({ account })
    handleWorkerMessages(worker, account, mainWindow)
    if (account.platformName == 'P88Bet') {
      isProcessingQueueP88Bet = true
    } else {
      isProcessingQueueViva88Bet = true
    }

    if (account.platformName === 'P88Bet') {
      if (!workerCrawlP88) {
        workerCrawlP88 = createWorkerCrawlP88({ workerData: 'worker' })

        workerCrawlP88.postMessage('Start')
        workerCrawlP88.on('message', ({ type, data }) => {
          if (type === 'DataUpdateAccount') {
            sendAccountUpdate(account.id, mainWindow, data)
          }

          if (type === 'LoggedAgain') {
            sendAccountUpdate(account.id, mainWindow, data)
            enqueueWorker(data, mainWindow)
          }
        })

        workerCrawlP88.on('exit', async () => {
          console.log('WorkerCrawlP88 Exit')
          workerCrawlP88 = null
        })
      }
    }
  }

  initializeWorkerPairAndPlaceBet(mainWindow)
}

const initializeWorkerPairAndPlaceBet = (mainWindow: BrowserWindow) => {
  if (!workerPair) {
    workerPair = createWorkerPair({ workerData: 'worker' })
    workerPair.postMessage('Start')
    workerPair.on('exit', (code) => {
      console.log('Exit workerPair...', code)
    })
    workerPair.on('error', (error) => {
      console.error('WorkerPair error:', error)
    })
  }
  if (!workerPlaceBet) {
    workerPlaceBet = createWorkerPlaceBet({ workerData: 'worker' })
    workerPlaceBet.postMessage('Start')
    workerPlaceBet.on('message', async ({ type, recordDB }) => {
      if (!mainWindow.isDestroyed()) {
        mainWindow.webContents.send('DataBetList', recordDB)
        const channel = type === 'ContraList' ? 'DataContraList' : 'DataSuccessList'
        mainWindow.webContents.send(channel, recordDB)
      }
    })
  }
}

function sendAccountUpdate(accountId: number, mainWindow: BrowserWindow, data: string) {
  const account = Account.findOne({ id: accountId, status: 'Login' })
  if (!account) {
    mainWindow.webContents.send('DataUpdateAccount', data)
  }
}
