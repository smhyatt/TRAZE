const pgp = require('pg-promise')({
    capSQL: true // ! Obs. capslock has to be on
})
import { db } from '../database/instance'
import { OwnershipDB, uid } from '../types'
const {
    createOwnership,
    getOwnerships,
    delOwnership,
    getOwnershipstate
} = require('../database/queries')

export class OwnershipRepo {
    
    async selectOwnerships() {
        return await db.any(getOwnerships).then(data => { return data })
    }
    
    async insertOwnership(ownership : OwnershipDB) : Promise<OwnershipDB> {
        return await db.any(createOwnership, ownership).then(data => {return data})
    }

    async insertOwnershipMulti(ownershipArr) {
        const cols = ['agent', 'type', 'amount']
        const cs = new pgp.helpers.ColumnSet(cols, {table: 'ownership'})
        const query = pgp.helpers.insert(ownershipArr, cs)
        return await db.many(query).then(() => 'OK')
    } 

    async delOwnership(ownership : OwnershipDB) {
        return await db.none(delOwnership, ownership).then(() => 'OK')
    }

    async getOwnershipstate() {
        return await db.any(getOwnershipstate).then(data => { return data })
    }
}