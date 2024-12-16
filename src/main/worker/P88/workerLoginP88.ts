import puppeteer, { Browser } from 'puppeteer'
import { parentPort } from 'worker_threads'
import { logToFile } from '@/worker/lib/logToFile'
import { Account } from '@db/model'
import { AccountType } from '@shared/types'

let browser: Browser | undefined
const port = parentPort

if (!port) throw new Error('IllegalState')

port.on('message', async ({ account }: { account: AccountType }) => {
  await loginToP88Bet(port, account)
})

async function loginToP88Bet(port: import('worker_threads').MessagePort, account: AccountType) {
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
      'Login Status: Checking Login Info...',
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
      'Login Status: Accessing Website...',
      'Program'
    )

    await page.goto('https://www.p88.bet/en', { waitUntil: 'load', timeout: 90000 })
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

    page.on('response', async (response) => {
      const url = response.url()
      if (url.includes('https://www.p88.bet/member-service/v2/authenticate')) {
        try {
          const data = await response.json()

          if (data === 0) {
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
            const cookies = await page.cookies()
            const cookieString = cookies.map(({ name, value }) => `${name}=${value}`).join('; ')
            const host = new URL(page.url()).origin

            Account.update({ id: account.id }, { autoLogin: 1, cookie: cookieString, host })

            if (Account.findOne({ id: account.id, status: 'Login' })) {
              process.exit(0)
            }
            port.postMessage({
              type: 'DataUpdateAccount',
              data: Account.update(
                { id: account.id },
                {
                  status: 'Logout',
                  statusLogin: 'Success',
                  textLog: `Login ${account.loginID} successfully!`
                }
              )
            })
            logToFile(
              account.platformName,
              account.loginID,
              `Login Status: Login ${account.loginID} successfully!`,
              'Program'
            )
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          if (errorMessage.includes('Unexpected token \'<\', "<!DOCTYPE "... is not valid JSON')) {
            port.postMessage({
              type: 'TooManyRequests',
              data: Account.update(
                { id: account.id },
                {
                  status: 'In-Progress',
                  textLog: `Login Status: (ERROR) - The remote server returned an error: Too Many Requests.`
                }
              )
            })

            logToFile(
              account.platformName,
              account.loginID,
              `Error Login ${account.loginID}: Login Status: (ERROR) - The remote server returned an error: Too Many Requests.`,
              'Program'
            )
            process.exit(0)
          }

          if (Account.findOne({ id: account.id, status: 'Login' })) {
            process.exit(0)
          }
          port.postMessage({
            type: 'DataUpdateAccount',
            data: Account.update(
              { id: account.id },
              {
                status: 'Logout',
                statusLogin: 'Fail',
                textLog: `Access failed, please try again later...`
              }
            )
          })

          logToFile(
            account.platformName,
            account.loginID,
            `Error Login ${account.loginID} Fail.`,
            'Program'
          )
          process.exit(0)
        }
      }
      if (url.includes('https://www.p88.bet/member-service/v2/account-balance')) {
        const data = await response.json()

        port.postMessage({
          type: 'DataUpdateAccount',
          data: Account.update(
            { id: account.id },
            {
              credit: data.betCredit
            }
          )
        })
        process.exit(0)
      }
    })

    await new Promise((resolve) => setTimeout(resolve, 1000))

    await page.waitForSelector('input[name="loginId"]', { visible: true, timeout: 30000 })
    await page.type('input[name="loginId"]', account.loginID)

    await page.waitForSelector('input[name="password"]', { visible: true })
    await page.type('input[name="password"]', account.password)

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
      page.click('#login'),
      page.waitForNavigation({ waitUntil: 'load', timeout: 90000 })
    ])
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.log('Loi123', errorMessage)
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
    console.log('***************Login P88 Fail...***************\n')
    process.exit(0)
  }
}
