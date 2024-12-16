/* eslint-disable @typescript-eslint/no-explicit-any */
import { parentPort } from 'worker_threads'
import { EventViva88Type } from '@db/schema/eventViva88'
import { LeagueViva88Type } from '@db/schema/leagueViva88'
import { toPositiveNumber } from '@/worker/lib/toPositiveNumber'
import { eventMappings, SPREAD, TOTAL } from '@shared/constants'
import dataCrawlByPlatformSchema from '@db/schema/dataCrawlByPlatform'
import { DataCrawlType, NameLeagueType, NameTeamType } from '@shared/types'
import Model, { createModel, EventViva88, LeagueViva88, NameLeague, NameTeam } from '@db/model'
import { convertHDP } from '@shared/convertHDP'

let dataEvent: any[]
const port = parentPort
if (!port) throw new Error('IllegalState')

port.on('message', async ({ data }) => {
  if (!data) return
  handleData(data)
})

function handleData(data: any) {
  const Viva88Bet = createModel('Viva88Bet', dataCrawlByPlatformSchema)

  const records: DataCrawlType[] = []
  const BATCH_SIZE: number = 50

  const dataLeagueViva88bet = NameLeague.findAll({ platform: 'Viva88Bet' }) as NameLeagueType[]

  const [type, message, content] = JSON.parse(data.substring(2))

  if (type === 'm' && message && content) {
    for (const item of content) {
      if (item[1] == 'l') {
        const dataLeague = LeagueViva88.findAll() as LeagueViva88Type[]
        const findLeague = dataLeague.find((league) => league.idLeague === item[3])
        if (!findLeague) {
          const standardLeagueName = dataLeagueViva88bet.find(
            (leagueViva88) => leagueViva88.nameLeague == String(item[7]).trim()
          )
          const league = {
            idLeague: item[3],
            nameLeague: item[7],
            league: standardLeagueName?.league || null
          }
          LeagueViva88.create(league)
        }
      }
      if (item[1] == 'm') {
        for (const { indexHome, indexAway, indexLeague } of eventMappings) {
          if (
            typeof item[indexHome] === 'string' &&
            typeof item[indexAway] === 'string' &&
            typeof item[indexLeague] === 'number' &&
            item[indexLeague]
          ) {
            const dataEvent = EventViva88.findAll() as EventViva88Type[]
            const findEvent = dataEvent.find((event) => event.idEvent === item[5])
            if (!findEvent) {
              const listDataLeague = LeagueViva88.findAll() as LeagueViva88Type[]
              const dataLeague = listDataLeague.map(({ id, ...rest }) => rest)

              const findLeague = dataLeague.find((league) => league.idLeague === item[indexLeague])
              if (findLeague) {
                const standardHomeName = NameTeam.findOne({
                  nameTeam: item[indexHome].trim(),
                  nameLeague: findLeague.nameLeague,
                  platform: 'Viva88Bet'
                }) as NameTeamType
                const standardAwayName = NameTeam.findOne({
                  nameTeam: item[indexAway].trim(),
                  nameLeague: findLeague.nameLeague,
                  platform: 'Viva88Bet'
                }) as NameTeamType
                if (!standardHomeName || !standardAwayName) {
                  continue
                }

                const event = {
                  idEvent: item[5],
                  nameHome: item[indexHome],
                  nameAway: item[indexAway],
                  home: standardHomeName.team,
                  away: standardAwayName.team,
                  ...findLeague
                }
                EventViva88.create(event)
              }
            }
          }
        }
        const listDataEvent = EventViva88.findAll() as EventViva88Type[]
        dataEvent = listDataEvent.map(({ id, ...rest }) => rest)
      }
      if ((item[1] == 'o' && item[9] == 1) || (item[1] == 'o' && item[9]) == 7) {
        const findEvent = dataEvent.find((event) => event.idEvent === item[5])
        const findTicket = Viva88Bet.findOne({
          altLineId: item[3]
        }) as DataCrawlType
        const hdp = item[17] || (item[15] !== 0 ? -item[15] : 0)
        if (findEvent && !findTicket) {
          records.push({
            platform: 'Viva88Bet',
            number: item[9] == 1 ? 0 : 1,
            altLineId: item[3],
            hdp_point: hdp,
            home_over:
              item[45].toString().includes('.') || item[47].toString().includes('.')
                ? item[45]
                : item[51],
            away_under:
              item[45].toString().includes('.') || item[47].toString().includes('.')
                ? item[47]
                : item[53],
            typeOdd: SPREAD,
            betType: item[9],
            HDP: convertHDP[toPositiveNumber(+hdp)],
            specialOdd: null,
            ...findEvent
          })
          if (records.length >= BATCH_SIZE) {
            insertRecords(records, Viva88Bet)
          }
        }
      }
      if ((item[1] == 'o' && item[9] == 3) || (item[1] == 'o' && item[9] == 8)) {
        const findEvent = dataEvent.find((event) => event.idEvent === item[5])
        const findTicket = Viva88Bet.findOne({
          altLineId: item[3]
        }) as DataCrawlType
        if (findEvent && !findTicket) {
          records.push({
            platform: 'Viva88Bet',
            number: item[9] == 3 ? 0 : 1,
            altLineId: item[3],
            hdp_point: item[15],
            home_over:
              item[45].toString().includes('.') || item[47].toString().includes('.')
                ? item[45]
                : item[51],
            away_under:
              item[45].toString().includes('.') || item[47].toString().includes('.')
                ? item[47]
                : item[53],
            typeOdd: TOTAL,
            betType: item[9],
            HDP: convertHDP[toPositiveNumber(+item[15])],
            specialOdd: null,
            ...findEvent
          })
          if (records.length >= BATCH_SIZE) {
            insertRecords(records, Viva88Bet)
          }
        }
      }
      if (
        item[1] === 'o' &&
        item.length === 8 &&
        !item.includes('running') &&
        !item.includes('suspend')
      ) {
        const findTicket = Viva88Bet.findOne({
          altLineId: item[3]
        }) as DataCrawlType

        if (findTicket) {
          Viva88Bet.create({
            platform: 'Viva88Bet',
            idLeague: findTicket.idLeague,
            nameLeague: findTicket.nameLeague,
            idEvent: findTicket.idEvent,
            nameHome: findTicket.nameHome,
            nameAway: findTicket.nameAway,
            number: findTicket.number,
            altLineId: findTicket.altLineId,
            hdp_point: findTicket.hdp_point,
            home_over: item[5],
            away_under: item[7],
            typeOdd: findTicket.typeOdd,
            league: findTicket.league,
            home: findTicket.home,
            away: findTicket.away,
            specialOdd: findTicket.specialOdd,
            betType: findTicket.betType,
            HDP: findTicket.HDP
          })
          Viva88Bet.delete({
            id: findTicket.id
          })
        }
      }
      if (item[1] === '-o') {
        Viva88Bet.delete({
          altLineId: item[3]
        })
      }
      if (records.length > 0) {
        insertRecords(records, Viva88Bet)
      }
    }
  }
}
function insertRecords(records: any, Viva88Bet: Model) {
  for (const record of records) {
    Viva88Bet.insertMany([record])
  }
  records.length = 0
}
