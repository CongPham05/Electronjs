const dataCrawlByPlatformSchema = `
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        platform TEXT,

        idLeague INTEGER NOT NULL,
        nameLeague TEXT NOT NULL,

        idEvent INTEGER NOT NULL,
        nameHome TEXT NOT NULL,
        nameAway TEXT NOT NULL,

        number INTEGER NOT NULL,
        altLineId INTEGER NOT NULL,
        hdp_point REAL NOT NULL,
        home_over REAL NOT NULL,
        away_under REAL NOT NULL,
        typeOdd TEXT NOT NULL,

        league TEXT,
        home TEXT,
        away TEXT,

        specialOdd INTEGER,
        betType INTEGER,

        HDP REAL
      `
export default dataCrawlByPlatformSchema
