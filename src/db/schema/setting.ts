const settingSchema = `
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profitMin REAL,
        profitMax REAL,
        gameType TEXT,

        enablePerMatchLimitSetting INTEGER,

        ipAddress TEXT,
        port TEXT,
        username TEXT,
        password TEXT
      `

export default settingSchema
