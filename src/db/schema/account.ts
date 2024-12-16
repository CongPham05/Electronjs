const accountSchema = `
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        loginID TEXT,
        password TEXT,

        platformName TEXT,
        loginURL TEXT,

        credit TEXT,
        textLog TEXT,

        proxyIP TEXT,
        proxyPort TEXT,
        proxyUsername TEXT,
        proxyPassword TEXT,

        typeCrawl TEXT,

        bet INTEGER,
        refresh INTEGER,
        autoLogin INTEGER,
        lockURL INTEGER,

        status TEXT,
        statusPair INTEGER,
        statusLogin TEXT,
        statusDelete INTEGER,

        cookie TEXT,
        host TEXT,
        socketUrl TEXT
      `

export default accountSchema
