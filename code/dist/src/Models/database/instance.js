"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const pgp = require('pg-promise')({ noWarnings: true });
const conn = {
    host: 'localhost',
    port: 5432,
    database: 'trazec',
    user: 'user1',
    password: '1234',
    allowExitOnIdle: true
};
// Initialise database connection instance
const db = pgp(conn);
exports.db = db;
//# sourceMappingURL=instance.js.map