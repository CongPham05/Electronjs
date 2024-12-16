const sportsBookSchema = `
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        platform TEXT NOT NULL,
        url TEXT NOT NULL,
        delayNormal TEXT,
        delaySameGame TEXT,
        suggestedClient TEXT,
        delayLoginSec_from TEXT,
        delayLoginSec_to TEXT,
        VIPAccountLogout INTEGER
      `

export default sportsBookSchema
