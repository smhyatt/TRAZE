const pgp = require('pg-promise')({ noWarnings: true })

const conn = {
    host: 'localhost',
    port: 5432,
    database: 'trazec',
    user: 'user1',
    password: '1234',
    allowExitOnIdle: true
}

// Initialise database connection instance
const db = pgp(conn)
export { db }
