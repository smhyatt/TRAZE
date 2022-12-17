const pgp = require('pg-promise')({
    capSQL: true // ! Obs caplock has to be on. 
})
import { TransferDB, uid } from '../types'
import { db } from '../database/instance'
const { getTransfer, selectTransferByAgentId } = require('../database/queries')

export class TransferRepo {
    // * By grouping the queries we increase performance drastically, since one connection
    // * to the database is opened to perform all queries at once. 
    // * The first insert adds to the transfer table, while the upsert on the ownership table.
    async addTransfer(input) {
        const {transferDB:transferDB, ownershipDB:ownershipDB} = input

        // * Generate insertion to Transfer. 
        const transCols = ['id', 'transferor', 'transferee', 'type', 'amount', 'time_of_effect', 'info']
        const cs1 = new pgp.helpers.ColumnSet(transCols, {table: 'transfer'})
        const insert = pgp.helpers.insert(transferDB, cs1) + ' RETURNING *;'
        
        // * The Ownership table might already have the agent and resource type registered, 
        // * so we do an UPSERT, to update instead, when the agent and type already exist.
        const ownerCols = ['agent', 'type', 'amount']
        const cs2 = new pgp.helpers.ColumnSet(ownerCols, {table: 'ownership'})
        const onConflict = ' ON CONFLICT(agent, type) DO UPDATE SET ' +
            cs2.assignColumns({from: 'EXCLUDED', skip: ['agent', 'type']})
        const upsert = pgp.helpers.insert(ownershipDB, cs2) + onConflict // * Generates upsert

        const query = pgp.helpers.concat([upsert, insert])
        return await db.many(query).then(data => {return data})
    } 

    async selectTransferById(transferId : uid) : Promise<TransferDB> {
        return await db.any(getTransfer, transferId).then(transfer => { return transfer })
    }

    async selectTransferByAgentId(agent : uid) {
        return await db.any(selectTransferByAgentId, agent).then(transfers => { return transfers })
    }

}

