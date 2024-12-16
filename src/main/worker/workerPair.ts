import { calculateProfit } from '@/worker/lib/calculateProfit'
import { formatTime } from '@/worker/lib/formatTime'
import { setTimeout } from 'timers/promises'
import {
  Account,
  DataBet,
  CombinationPlatform,
  createModel,
  Setting,
  SettingAccountPair,
  clearTable
} from '@db/model'
import { CombinationPlatformType } from '@db/schema/combinationPlatform'
import dataCrawlByPlatformSchema from '@db/schema/dataCrawlByPlatform'
import { AccountType, DataCrawlType, SettingAccountPairType, SettingType } from '@shared/types'

import { parentPort } from 'worker_threads'

interface DataType extends DataCrawlType {
  bet: string
  odd: number
  profit: number
}

const port = parentPort
if (!port) throw new Error('IllegalState')

port.on('message', async (action) => {
  if (action == 'Start') {
    handlePairData()
  }
})

async function handlePairData() {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const listAllCombinationPlatform = CombinationPlatform.findAll() as CombinationPlatformType[]

    if (!listAllCombinationPlatform.length) {
      await setTimeout(1000)
      continue
    }

    for (const combinationPlatform of listAllCombinationPlatform) {
      await handleCombinationPlatform(combinationPlatform)
    }
  }
}

async function handleCombinationPlatform(combinationPlatform: CombinationPlatformType) {
  const [Platform1_Model, Platform2_Model] = [
    createModel(combinationPlatform.namePlatform1, dataCrawlByPlatformSchema),
    createModel(combinationPlatform.namePlatform2, dataCrawlByPlatformSchema)
  ]

  await setTimeout(100)

  const Platform1_count = Platform1_Model.count()
  const Platform2_count = Platform2_Model.count()

  if (!Platform1_count || !Platform2_count) {
    clearTable('DataBet')
    return
  }
  const Platform1_listData = Platform1_Model.findAll() as DataCrawlType[]
  for (const item1 of Platform1_listData) {
    const { league, home, away, typeOdd, hdp_point, number } = item1
    if (!league || !home || !away) continue

    const item2 = Platform2_Model.findOne({
      league,
      home,
      away,
      typeOdd,
      hdp_point,
      number
    }) as DataCrawlType
    if (!item2) continue

    let bet1: string, bet2: string, odd1: number, odd2: number

    const profitCase1 = calculateProfit(item1.home_over, item2.away_under)
    if (profitCase1 !== null) {
      bet1 = typeOdd === 'SPREAD' ? item1.nameHome : 'Over'
      bet2 = typeOdd === 'SPREAD' ? item2.nameAway : 'Under'
      odd1 = item1.home_over
      odd2 = item2.away_under

      createAndSaveRecord(
        {
          ...item1,
          bet: bet1,
          odd: odd1,
          profit: profitCase1
        },
        {
          ...item2,
          bet: bet2,
          odd: odd2,
          profit: profitCase1
        },
        combinationPlatform.combinationPlatform
      )
    }
    const profitCase2 = calculateProfit(item1.away_under, item2.home_over)
    if (profitCase2 !== null) {
      bet1 = typeOdd === 'SPREAD' ? item1.nameAway : 'Under'
      bet2 = typeOdd === 'SPREAD' ? item2.nameHome : 'Over'
      odd1 = item1.away_under
      odd2 = item2.home_over

      await createAndSaveRecord(
        {
          ...item1,
          bet: bet1,
          odd: odd1,
          profit: profitCase2
        },
        {
          ...item2,
          bet: bet2,
          odd: odd2,
          profit: profitCase2
        },
        combinationPlatform.combinationPlatform
      )
    }
  }
}

async function createAndSaveRecord(data1: DataType, data2: DataType, combinationPlatform: string) {
  const listAccPairByPlatform = SettingAccountPair.findAll({
    combinationPlatform
  }) as SettingAccountPairType[]

  const filterDataBet = listAccPairByPlatform.filter(
    (item) => item.account1_SelectBet !== 'NoBet' || item.account2_SelectBet !== 'NoBet'
  )

  if (!filterDataBet.length) return
  for (const accPairByPlatform of filterDataBet) {
    await handleRecord(data1, data2, accPairByPlatform)
  }
}

async function handleRecord(
  data1: DataType,
  data2: DataType,
  accPairByPlatform: SettingAccountPairType
) {
  await setTimeout(100)

  const setting = Setting.findAll() as SettingType[]
  const accounts = [
    Account.findOne({
      id: accPairByPlatform.id_account1,
      bet: 1,
      status: 'Logout',
      statusLogin: 'Success',
      statusDelete: 0
    }) as AccountType,
    Account.findOne({
      id: accPairByPlatform.id_account2,
      bet: 1,
      status: 'Logout',
      statusLogin: 'Success',
      statusDelete: 0
    }) as AccountType
  ]

  if (!accounts[0] || !accounts[1]) return

  const betSettings = [
    {
      idAccount: accPairByPlatform.id_account1,
      betAmount: accPairByPlatform.account1_BetAmount,
      selectBet: accPairByPlatform.account1_SelectBet,
      checkOdd: accPairByPlatform.account1_CheckOdd,
      checkOdd_From: accPairByPlatform.account1_CheckOdd_From,
      checkOdd_To: accPairByPlatform.account1_CheckOdd_To
    },
    {
      idAccount: accPairByPlatform.id_account2,
      betAmount: accPairByPlatform.account2_BetAmount,
      selectBet: accPairByPlatform.account2_SelectBet,
      checkOdd: accPairByPlatform.account2_CheckOdd,
      checkOdd_From: accPairByPlatform.account2_CheckOdd_From,
      checkOdd_To: accPairByPlatform.account2_CheckOdd_To
    }
  ]

  const dataOrder = accounts[0].platformName === data1.platform ? [data1, data2] : [data2, data1]

  const record = dataOrder.map((data, index) => ({
    ...data,
    idAccount: betSettings[index].idAccount,
    betAmount: betSettings[index].betAmount,
    selectBet: betSettings[index].selectBet,
    checkOdd: betSettings[index].checkOdd,
    checkOdd_From: betSettings[index].checkOdd_From,
    checkOdd_To: betSettings[index].checkOdd_To,
    company: `${accounts[index].platformName}-${accounts[index].loginID}`,
    coverage: data1.number === 0 ? 'FT' : 'FirstHalf',
    gameType: setting[0].gameType,
    bet: data.bet,
    odd: data.odd,
    time: formatTime(),
    info: '',
    receiptID: '',
    receiptStatus: ''
  }))

  // if (record[0].checkOdd == 1 && record[2].checkOdd == 1) {
  //   const from1 = parseFloat(record[0].checkOdd_From as string)
  //   const to1 = parseFloat(record[0].checkOdd_To as string)
  //   const min1 = Math.min(from1, to1)
  //   const max1 = Math.max(from1, to1)

  //   const from2 = parseFloat(record[1].checkOdd_From as string)
  //   const to2 = parseFloat(record[1].checkOdd_To as string)
  //   const min2 = Math.min(from2, to2)
  //   const max2 = Math.max(from2, to2)

  //   if (
  //     (record[0].odd < min1 || record[0].odd > max1) &&
  //     (record[1].odd < min2 || record[1].odd > max2)
  //   ) {
  //     return
  //   }
  // }

  DataBet.create({
    dataPair: JSON.stringify(record)
  })
}
