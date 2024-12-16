const db = require('better-sqlite3')('./resources/database.sqlite')
db.pragma('journal_mode = WAL')

export default db
