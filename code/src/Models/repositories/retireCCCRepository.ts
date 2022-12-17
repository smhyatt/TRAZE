const pgp = require('pg-promise')({ capSQL: true })
import { uid } from '../types'
import { db } from '../database/instance'
const { getRetiredById, getAllRetired } = require('../database/queries')

export class RetireCCCRepo {

    buildInsert(table, columns : Array<string>, data : Array<any>) {
        const columnSet = new pgp.helpers.ColumnSet(columns, { table: table })
        return pgp.helpers.insert(data, columnSet) + ' RETURNING *;'
    }

    buildUpsert(table : string, columns : Array<string>, data : Array<any>) {
        const columnSet = new pgp.helpers.ColumnSet(columns, { table: table})
        const onConflict = ' ON CONFLICT(agent, type) DO UPDATE SET ' +
            columnSet.assignColumns({from: 'EXCLUDED', skip: ['agent', 'type']})
        return pgp.helpers.insert(data, columnSet) + onConflict 
    }

    async addRetireTransfer(retireRows, ownershipRows) {
        const retireColumns = ['id', 'transferor', 'type', 'amount', 'time_of_effect']
        const insertRetire = this.buildInsert('cc_retire', retireColumns, retireRows)
        
        const ownershipColumns = ['agent', 'type', 'amount']
        const upsertOwnership = this.buildUpsert('ownership', ownershipColumns, ownershipRows)

        const query = pgp.helpers.concat([
            upsertOwnership,
            insertRetire,
        ])

        return await db.many(query).then(data => { return data })
    }

    async selectRetiredById(id : uid) : Promise<any> {
        return await db.one(getRetiredById, id).then(transfer => { return transfer })
    }

    async selectAllRetired() : Promise<any> { 
        return await db.any(getAllRetired).then(ts => { return ts })
    }
}

