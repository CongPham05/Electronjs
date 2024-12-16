export type EventViva88Type = {
  id: number
  idLeague: number
  nameLeague: string
  league: string

  idEvent: number
  nameHome: string
  nameAway: string
  home: string
  away: string
}

const eventViva88Schema = `
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        idLeague INTEGER NOT NULL,
        nameLeague TEXT NOT NULL,
        league TEXT,

        idEvent INTEGER NOT NULL,
        nameHome TEXT NOT NULL,
        nameAway TEXT NOT NULL,
        home TEXT,
        away TEXT
      `
export default eventViva88Schema
