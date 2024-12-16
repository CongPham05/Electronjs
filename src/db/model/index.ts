import db from '@db/config/database'
import accountSchema from '@db/schema/account'
import betListResultSchema from '@db/schema/betListResult'
import combinationPlatformSchema from '@db/schema/combinationPlatform'
import contraListSchema from '@db/schema/contraList'
import dataBetSchema from '@db/schema/dataBet'
import eventViva88Schema from '@db/schema/eventViva88'
import leagueViva88Schema from '@db/schema/leagueViva88'
import nameLeagueSchema from '@db/schema/nameLeague'
import nameTeamSchema from '@db/schema/nameTeam'
import platformSchema from '@db/schema/platform'
import settingSchema from '@db/schema/setting'
import settingAccountPairSchema from '@db/schema/settingAccountPair'
import settingBetListSchema from '@db/schema/settingBetList'
import settingContraList from '@db/schema/settingContraList'
import settingPerMatchLimitSettingSchema from '@db/schema/settingPerMatchLimitSetting'
import settingSuccessList from '@db/schema/settingSuccessList'
import settingWaitingList from '@db/schema/settingWaitingList'
import sportsBookSchema from '@db/schema/sportsBook'
import successListSchema from '@db/schema/successList'
import waitingListSchema from '@db/schema/waitingList'

interface RecordData {
  [key: string]: string | number | boolean | null
}
type QueryCondition = Record<string, string | number | boolean>

class Model {
  private tableName: string

  constructor(tableName: string, schema: string) {
    this.tableName = tableName
    db.prepare(`CREATE TABLE IF NOT EXISTS ${this.tableName} (${schema})`).run()
  }

  count(): number {
    const result = db.prepare(`SELECT COUNT(*) AS count FROM ${this.tableName}`).get()
    return result.count
  }

  findOne<T>(query: QueryCondition): T | undefined {
    const keys = Object.keys(query)
    const values = Object.values(query)

    const conditions = keys.map((key) => `${key} = ?`).join(' AND ')

    return db.prepare(`SELECT * FROM ${this.tableName} WHERE ${conditions}`).get(...values) as
      | T
      | undefined
  }

  findAll(query: RecordData = {}): RecordData[] {
    const keys = Object.keys(query)
    if (keys.length === 0) {
      return db.prepare(`SELECT * FROM ${this.tableName}`).all()
    }

    const conditions = keys.map((key) => `${key} = ?`).join(' AND ')
    const values = Object.values(query)
    return db.prepare(`SELECT * FROM ${this.tableName} WHERE ${conditions}`).all(...values)
  }

  findAndDeleteFirst20(): RecordData[] {
    const records = db.prepare(`SELECT * FROM ${this.tableName} LIMIT 20`).all()
    if (records.length === 0) return []

    const idsToDelete = records.map((record) => record.id).join(', ')
    db.prepare(`DELETE FROM ${this.tableName} WHERE id IN (${idsToDelete})`).run()

    return records
    /*
    const records = db.prepare(`SELECT * FROM ${this.tableName} LIMIT 20`).all()
    if (records.length === 0) return []
    db.prepare(`DELETE FROM ${this.tableName}`).run()

    return records
    */
  }

  findById(id: number) {
    return db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`).get(id)
  }

  create(data: RecordData) {
    const keys = Object.keys(data).join(', ')
    const values = Object.values(data)
    const placeholders = values.map(() => '?').join(', ')

    const stmt = db.prepare(`INSERT INTO ${this.tableName} (${keys}) VALUES (${placeholders})`)
    const info = db.transaction(() => {
      return stmt.run(...values)
    })()
    const lastInsertId = info.lastInsertRowid
    return db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`).get(lastInsertId)
  }

  create_SettingAccountPair(data: RecordData) {
    const account1 = db
      .prepare('SELECT platformName FROM Account WHERE id = ?')
      .get(data.id_account1)
    const account2 = db
      .prepare('SELECT platformName FROM Account WHERE id = ?')
      .get(data.id_account2)

    if (!account1 || !account2) {
      throw new Error('Accounts not found')
    }

    const sortedPlatforms = [account1.platformName, account2.platformName].sort()
    data.combinationPlatform = `${sortedPlatforms[0]}_${sortedPlatforms[1]}`

    const keys = Object.keys(data).join(', ')
    const values = Object.values(data)
    const placeholders = values.map(() => '?').join(', ')

    let insertedId: number | null = null

    db.transaction(() => {
      const stmt = db.prepare(`INSERT INTO ${this.tableName} (${keys}) VALUES (${placeholders})`)
      const result = stmt.run(...values)
      insertedId = result.lastInsertRowid
    })()

    const record = db
      .prepare(
        `
      SELECT 
        s.*, 
        a1.loginID as account1_loginID,
        a1.platformName as account1_platForm, 
        a2.loginID as account2_loginID,
        a2.platformName as account2_platForm
      FROM ${this.tableName} s
      LEFT JOIN Account a1 ON s.id_account1 = a1.id
      LEFT JOIN Account a2 ON s.id_account2 = a2.id
      WHERE s.id = ?
    `
      )
      .get(insertedId)

    return record
  }

  findAll_SettingAccountPair(query: RecordData = {}): RecordData[] {
    const keys = Object.keys(query)
    let records: RecordData[]

    if (keys.length === 0) {
      records = db
        .prepare(
          `
        SELECT 
          s.*, 
          a1.loginID as account1_loginID,
          a1.platformName as account1_platForm, 
          a2.loginID as account2_loginID,
          a2.platformName as account2_platForm
        FROM ${this.tableName} s
        LEFT JOIN account a1 ON s.id_account1 = a1.id
        LEFT JOIN account a2 ON s.id_account2 = a2.id
      `
        )
        .all()
    } else {
      const conditions = keys.map((key) => `${key} = ?`).join(' AND ')
      const values = Object.values(query)
      records = db
        .prepare(
          `
        SELECT 
          s.*, 
          a1.loginID as account1_loginID,
          a1.platformName as account1_platForm, 
          a2.loginID as account2_loginID,
          a2.platformName as account2_platForm
        FROM ${this.tableName} s
        LEFT JOIN account a1 ON s.id_account1 = a1.id
        LEFT JOIN account a2 ON s.id_account2 = a2.id
        WHERE ${conditions}
      `
        )
        .all(...values)
    }

    return records
  }

  delete_SettingAccountPairByAccountId(accountId: number) {
    return db.transaction(() => {
      const recordsToDelete = db
        .prepare(
          `
        SELECT * FROM ${this.tableName}
        WHERE id_account1 = ? OR id_account2 = ?
        `
        )
        .all(accountId, accountId)

      db.prepare(
        `
        DELETE FROM ${this.tableName}
        WHERE id_account1 = ? OR id_account2 = ?
        `
      ).run(accountId, accountId)

      return recordsToDelete
    })()
  }

  delete_SettingAccountPairByNamePlatform(platform: string) {
    const accountIds = db
      .prepare(
        `
      SELECT id FROM account WHERE platformName = ?
    `
      )
      .all(platform)
      .map((row) => row.id)

    if (accountIds.length === 0) {
      return
    }

    const placeholders = accountIds.map(() => '?').join(', ')

    db.transaction(() => {
      db.prepare(
        `
        DELETE FROM ${this.tableName}
        WHERE id_account1 IN (${placeholders}) OR id_account2 IN (${placeholders})
      `
      ).run(...accountIds, ...accountIds)
    })()
  }

  create_CombinationPlatform() {
    clearTable('CombinationPlatform')

    const selectPairsStmt = db.prepare('SELECT id_account1, id_account2 FROM SettingAccountPair')
    const selectAccountsStmt = db.prepare('SELECT id, platformName FROM Account WHERE id IN (?, ?)')
    const selectCombinationStmt = db.prepare(`
        SELECT 1 FROM CombinationPlatform 
        WHERE (namePlatform1 = ? AND namePlatform2 = ?) 
           OR (namePlatform1 = ? AND namePlatform2 = ?)
    `)
    const insertCombinationStmt = db.prepare(
      'INSERT INTO CombinationPlatform (namePlatform1, namePlatform2, combinationPlatform) VALUES (?, ?, ?)'
    )

    const insertCombinationsTransaction = db.transaction(() => {
      const settingAccountPairs = selectPairsStmt.all()

      settingAccountPairs.forEach((pair) => {
        const accounts = selectAccountsStmt.all(pair.id_account1, pair.id_account2)

        if (accounts.length === 2) {
          const account1 = accounts.find((a) => a.id === pair.id_account1)
          const account2 = accounts.find((a) => a.id === pair.id_account2)

          const sortedPlatforms = [account1.platformName, account2.platformName].sort()
          const namePlatform1 = sortedPlatforms[0]
          const namePlatform2 = sortedPlatforms[1]

          const combinationPlatform = `${namePlatform1}_${namePlatform2}`

          const existingCombination = selectCombinationStmt.get(
            namePlatform1,
            namePlatform2,
            namePlatform2,
            namePlatform1
          )

          if (!existingCombination) {
            insertCombinationStmt.run(namePlatform1, namePlatform2, combinationPlatform)
          }
        }
      })
    })

    insertCombinationsTransaction()
  }

  insertMany(records: RecordData[]) {
    if (records.length === 0) return

    const keys = Object.keys(records[0]).join(', ')
    const placeholders = records
      .map(
        () =>
          `(${Object.values(records[0])
            .map(() => '?')
            .join(', ')})`
      )
      .join(', ')

    const values = records.flatMap((record) => Object.values(record))

    db.transaction(() => {
      db.prepare(`INSERT INTO ${this.tableName} (${keys}) VALUES ${placeholders}`).run(...values)
    })()
  }

  update(query: RecordData, updates: RecordData): RecordData | null {
    if (Object.keys(query).length === 0) {
      const updateKeys = Object.keys(updates)
        .map((key) => `${key} = ?`)
        .join(', ')
      const updateValues = Object.values(updates)

      const sql = `UPDATE ${this.tableName} SET ${updateKeys}`
      db.prepare(sql).run(...updateValues)

      const selectSql = `SELECT * FROM ${this.tableName} LIMIT 1`
      const updatedRecord = db.prepare(selectSql).get()
      return updatedRecord || null
    } else {
      const queryKeys = Object.keys(query)
        .map((key) => `${key} = ?`)
        .join(' AND ')
      const queryValues = Object.values(query)

      const updateKeys = Object.keys(updates)
        .map((key) => `${key} = ?`)
        .join(', ')
      const updateValues = Object.values(updates)

      const sql = `UPDATE ${this.tableName} SET ${updateKeys} WHERE ${queryKeys}`
      const params = [...updateValues, ...queryValues]

      const selectBeforeUpdateSql = `SELECT * FROM ${this.tableName} WHERE ${queryKeys}`

      db.prepare(sql).run(...params)

      const updatedRecord = db.prepare(selectBeforeUpdateSql).get(...queryValues)
      return updatedRecord || null
    }
  }

  updateTypeCrawlForRefresh(newTypeCrawl: string): number {
    const updateQuery = `UPDATE ${this.tableName} SET typeCrawl = ? WHERE refresh = ?`
    const result = db.prepare(updateQuery).run(newTypeCrawl, 1)

    return result.changes
  }

  delete(query: RecordData) {
    // model.delete({ id: 1 })
    const [key, value] = Object.entries(query)[0]

    db.transaction(() => {
      db.prepare(`DELETE FROM ${this.tableName} WHERE ${key} = ?`).run(value)
    })()
  }

  deleteMany(query: RecordData) {
    const conditions = Object.entries(query)
      .map(([key]) => `${key} = ?`)
      .join(' AND ')

    const values = Object.values(query)

    db.transaction(() => {
      db.prepare(`DELETE FROM ${this.tableName} WHERE ${conditions}`).run(...values)
    })()
  }
}

export function createModel(tableName: string, schema: string): Model {
  return new Model(tableName, schema)
}

export function clearTable(tableName: string) {
  const tableExists = db
    .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`)
    .get(tableName)

  if (tableExists) {
    const stmt = db.prepare(`DELETE FROM ${tableName}`)
    stmt.run()
  }
}

export const Account = createModel('Account', accountSchema)
export const Platform = createModel('Platform', platformSchema)
export const SportsBook = createModel('SportsBook', sportsBookSchema)
export const Setting = createModel('Setting', settingSchema)
export const NameTeam = createModel('NameTeam', nameTeamSchema)
export const NameLeague = createModel('NameLeague', nameLeagueSchema)
export const LeagueViva88 = createModel('LeagueViva88', leagueViva88Schema)
export const EventViva88 = createModel('EventViva88', eventViva88Schema)
export const SettingAccountPair = createModel('SettingAccountPair', settingAccountPairSchema)
export const CombinationPlatform = createModel('CombinationPlatform', combinationPlatformSchema)
export const DataBet = createModel('DataBet', dataBetSchema)
export const BetListResult = createModel('BetListResult', betListResultSchema)
export const WaitingList = createModel('WaitingList', waitingListSchema)
export const ContraList = createModel('ContraList', contraListSchema)
export const SuccessList = createModel('SuccessList', successListSchema)

export const SettingPerMatchLimit = createModel(
  'SettingPerMatchLimit',
  settingPerMatchLimitSettingSchema
)

export const SettingBetList = createModel('SettingBetList', settingBetListSchema)
export const SettingWaitingList = createModel('SettingWaitingList', settingWaitingList)
export const SettingContraList = createModel('SettingContraList', settingContraList)
export const SettingSuccessList = createModel('SettingSuccessList', settingSuccessList)

export default Model
