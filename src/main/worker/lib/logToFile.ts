import { logTime } from '@/worker/lib/logTime'
import fs from 'fs'

export function logToFile(
  platformName: string,
  loginID: string,
  message: string,
  typeFile: string
) {
  fs.appendFileSync(
    `BetLog/${platformName}_${loginID}_${typeFile}.txt`,
    `${logTime()} ${message}\n`
  )
}
