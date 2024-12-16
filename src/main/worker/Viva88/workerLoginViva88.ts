import { parentPort } from 'worker_threads'
import puppeteer, { Browser } from 'puppeteer'
import { AccountType } from '@shared/types'
import { Account } from '@db/model'
import { logToFile } from '@/worker/lib/logToFile'
import { getBalanceViva88bet } from '@/worker/lib/getBalanceViva88bet'

type ResLoginViva88 = {
  errorCode: number
  errorMessage: string
  redirectUrl: string
  resCode: number
  userLanguage: string
  msgResourceKey: null | string
  gestureFailCnt: number
  userName: null | string
  nickname: null | string
  requestIp: null | string
}

let browser: Browser | undefined
const port = parentPort

if (!port) throw new Error('IllegalState')

port.on('message', async ({ account }: { account: AccountType }) => {
  await loginToViva88Bet(port, account)
})

async function loginToViva88Bet(port: import('worker_threads').MessagePort, account: AccountType) {
  let socketUrl: string = ''
  try {
    if (Account.findOne({ id: account.id, status: 'Login' })) {
      process.exit(0)
    }

    port.postMessage({
      type: 'DataUpdateAccount',
      data: Account.update(
        { id: account.id },
        {
          textLog: 'Checking Login Info...'
        }
      )
    })

    logToFile(
      account.platformName,
      account.loginID,
      `Login Status: Checking Login Info...`,
      'Program'
    )

    const { proxyIP, proxyPort, proxyUsername, proxyPassword } = account
    if (!proxyIP || !proxyPort || proxyPort === '0' || !proxyUsername || !proxyPassword) {
      logToFile(
        account.platformName,
        account.loginID,
        `Login Status: (ERROR) - Invalid URI: The format of the URI could not be determined.`,
        'Program'
      )

      port.postMessage({
        type: 'DataUpdateAccount',
        data: Account.update(
          { id: account.id },
          {
            status: 'Exit',
            statusLogin: 'Fail',
            textLog: `Login Status: (ERROR) - Invalid URI: The format of the URI could not be determined.`
          }
        )
      })
      process.exit(0)
    }

    browser = await puppeteer.launch({
      headless: true,
      ignoreHTTPSErrors: true,
      executablePath:
        'resources/.cache/puppeteer/chrome/win64-126.0.6478.182/chrome-win64/chrome.exe',
      args: [
        `--proxy-server=${`http://${proxyIP}:${proxyPort}`}`,
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-breakpad',
        '--disable-client-side-phishing-detection',
        '--disable-default-apps',
        '--disable-features=site-per-process,TranslateUI',
        '--disable-hang-monitor',
        '--disable-popup-blocking',
        '--disable-prompt-on-repost',
        '--disable-renderer-backgrounding',
        '--disable-sync',
        '--disable-extensions',
        '--disable-translate',
        '--metrics-recording-only',
        '--mute-audio',
        '--no-default-browser-check',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--window-size=1920,1080',
        '--disable-background-networking',
        '--disable-notifications',
        '--disable-infobars',
        '--disable-http-cache',
        '--disable-plugins',
        '--disable-dev-tools'
      ].filter(Boolean)
    })

    const pages = await browser.pages()
    const page = pages[0]

    await page.authenticate({
      username: proxyUsername,
      password: proxyPassword
    })

    await page.setViewport({ width: 1920, height: 1080 })

    const cdpSession = await page.target().createCDPSession()
    await cdpSession.send('Network.enable')
    await cdpSession.send('Network.setCacheDisabled', { cacheDisabled: false })
    cdpSession.removeAllListeners()
    cdpSession.on('Network.webSocketCreated', async (payload) => {
      socketUrl = payload.url as string
    })

    if (Account.findOne({ id: account.id, status: 'Login' })) {
      process.exit(0)
    }

    port.postMessage({
      type: 'DataUpdateAccount',
      data: Account.update(
        { id: account.id },
        {
          textLog: 'Accessing Website...'
        }
      )
    })
    logToFile(
      account.platformName,
      account.loginID,
      `Login Status: Accessing Website...`,
      'Program'
    )

    await page.goto('https://www.viva88.net/b/en', { waitUntil: 'load', timeout: 90000 })
    await page.evaluate(() => {
      window.addEventListener(
        'scroll',
        (e) => {
          e.stopImmediatePropagation()
          window.scrollTo(0, 0)
        },
        true
      )
    })
    await new Promise((resolve) => setTimeout(resolve, 2000))

    await page.reload({ waitUntil: 'load', timeout: 90000 })
    const bodyHTML = await page.content()
    if (bodyHTML.includes('- Access Denied -')) {
      if (Account.findOne({ id: account.id, status: 'Login' })) {
        process.exit(0)
      }

      port.postMessage({
        type: 'DataUpdateAccount',
        data: Account.update(
          { id: account.id },
          {
            status: 'Exit',
            statusLogin: 'Fail',
            textLog: `Access Denied...`
          }
        )
      })

      logToFile(account.platformName, account.loginID, `Login Failed: Access Denied`, 'Program')

      process.exit(0)
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))

    await page.waitForSelector('a.btn.btn--secondary span.text', { visible: true, timeout: 30000 })
    await page.click('a.btn.btn--secondary')

    await page.waitForSelector('.modal.modal--login[data-open="true"]', {
      visible: true,
      timeout: 30000
    })

    await page.waitForSelector('input#username', { visible: true })
    await page.type('input#username', account.loginID)

    await page.waitForSelector('input#password', { visible: true })
    await page.type('input#password', account.password)
    await page.setRequestInterception(true)
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
        req.abort()
      } else {
        req.continue()
      }
    })
    page.on('response', async (response) => {
      const url = response.url()

      if (url.includes('https://www.viva88.net/api/Login')) {
        const data = (await response.json()) as ResLoginViva88
        if (data.errorCode === 0) {
          Account.update(
            { id: account.id },
            {
              status: 'Logout',
              statusLogin: 'Success',
              textLog: `Login ${account.loginID} successfully!`
            }
          )
        } else if (data.errorCode === 2) {
          if (Account.findOne({ id: account.id, status: 'Login' })) {
            process.exit(0)
          }
          port.postMessage({
            type: 'DataUpdateAccount',
            data: Account.update(
              { id: account.id },
              {
                status: 'Exit',
                statusLogin: 'Fail',
                textLog: `Login Error: Incorrect account or password`
              }
            )
          })

          logToFile(
            account.platformName,
            account.loginID,
            `Error Login ${account.loginID}: Incorrect account or password`,
            'Program'
          )
          process.exit(0)
        } else {
          if (Account.findOne({ id: account.id, status: 'Login' })) {
            process.exit(0)
          }

          port.postMessage({
            type: 'DataUpdateAccount',
            data: Account.update(
              { id: account.id },
              {
                status: 'Exit',
                statusLogin: 'Fail',
                textLog: `Login Error: ${data.errorMessage}`
              }
            )
          })

          logToFile(
            account.platformName,
            account.loginID,
            `Error: Login ${account.loginID}: ${data.errorMessage} Fail`,
            'Program'
          )
          process.exit(0)
        }
      }
    })
    if (Account.findOne({ id: account.id, status: 'Login' })) {
      process.exit(0)
    }
    port.postMessage({
      type: 'DataUpdateAccount',
      data: Account.update(
        { id: account.id },
        {
          textLog: `Login User ${account.loginID}...`
        }
      )
    })
    logToFile(
      account.platformName,
      account.loginID,
      `Login Status: Login User ${account.loginID}...`,
      'Program'
    )
    await new Promise((resolve) => setTimeout(resolve, 1000))

    await Promise.all([
      page.click('.login-form__item > a'),
      page.waitForNavigation({ waitUntil: 'load', timeout: 90000 })
    ])

    const cookies = await page.cookies()
    const cookieString = cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ')
    const host = new URL(page.url()).origin
    if (cookieString && socketUrl) {
      const accountFind = Account.update(
        { id: account.id },
        { cookie: cookieString, host, socketUrl }
      ) as AccountType

      const { ErrorCode, Data } = await getBalanceViva88bet(accountFind)

      if (ErrorCode == 106 || ErrorCode == -1) {
        if (Account.findOne({ id: account.id, status: 'Login' })) {
          process.exit(0)
        }

        logToFile(account.platformName, account.loginID, `${Data}`, 'Program')

        port?.postMessage({
          type: 'DataUpdateAccount',
          data: Account.update(
            { id: account.id },
            {
              status: 'Exit',
              statusLogin: 'Fail',
              textLog: Data,
              cookie: null,
              host: null,
              socketUrl: null
            }
          )
        })
        process.exit(0)
      }

      const accountUpdate = Account.update(
        { id: account.id },
        {
          credit: Data,
          autoLogin: 1
        }
      )
      if (Account.findOne({ id: account.id, status: 'Login' })) {
        process.exit(0)
      }
      port.postMessage({
        type: 'DataUpdateAccount',
        data: accountUpdate
      })
      logToFile(
        account.platformName,
        account.loginID,
        `Login Status: Login ${account.loginID} successfully!`,
        'Program'
      )
      port.postMessage({
        type: 'LoginSuccess',
        data: accountUpdate
      })
      process.exit(0)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.log('12321', errorMessage)
    let textLog = 'Error: Access failed, please try again later...'
    if (errorMessage.includes('_CONNECTION_FAILED')) {
      textLog = 'Login Status: (ERROR) - Proxy connection failed.'
    }

    if (Account.findOne({ id: account.id, status: 'Login' })) {
      process.exit(0)
    }

    port.postMessage({
      type: 'DataUpdateAccount',
      data: Account.update(
        { id: account.id },
        {
          status: 'Exit',
          statusLogin: 'Fail',
          textLog
        }
      )
    })
    logToFile(
      account.platformName,
      account.loginID,
      `Error Access ${account.loginID}:${textLog}`,
      'Program'
    )
    console.log('***************Login Viva88 Fail***************\n', error)
    process.exit(0)
  }
}
