const settingPerMatchLimitSettingSchema = `
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        namePlatform TEXT,
        limitMethod TEXT,
        livePreGame INTEGER,

        limitType TEXT,
        totalAmount TEXT,
        totalCount TEXT
      `

export default settingPerMatchLimitSettingSchema
