const pgp = require('pg-promise')({
    capSQL: true // ! Obs caplock has to be on. 
})
import { uid, TransportDB } from '../types'
import { db } from '../database/instance'
const { 
    getTransport, 
    getTransports, 
    getTransportLocation, 
    getTransportsByAgent 
} = require('../database/queries')

export class TransportRepo {

    buildInsert(table: string, columns: Array<string>, data: Array<any>) {
        const columnSet = new pgp.helpers.ColumnSet(columns, { table: table})
        return pgp.helpers.insert(data, columnSet) + ' RETURNING *;'
    }

    buildUpsert(table: string, columns: Array<string>, data: Array<any>, v1: string, v2: string, skip: string[]) {
        const columnSet = new pgp.helpers.ColumnSet(columns, { table: table})
        const onConflict = ` ON CONFLICT(${v1}, ${v2}) DO UPDATE SET ` +
        columnSet.assignColumns({from: 'EXCLUDED', skip: skip})
        return pgp.helpers.insert(data, columnSet) + onConflict 
    }

    async addTransport(transportRows, resourceLocationRows) {
        const transportColumns = ['id', 'owner', 'location_start', 'destination', 'resource_type', 'amount', 'time_of_effect', 'distance']
        const insertTransport = this.buildInsert('transport', transportColumns, transportRows)
        
        const resourceLocationColumns = ['location_id', 'resource_type', 'amount']
        const lid = 'location_id'
        const rt = 'resource_type'
        const skip = [lid, rt]
        const upsertLocationState = this.buildUpsert('location_state', resourceLocationColumns, resourceLocationRows, lid, rt, skip)

        const query = pgp.helpers.concat([
            upsertLocationState,
            insertTransport,
        ])

        return await db.many(query).then(data => {return data})
    }

    async selectTransportById(transportId : uid) : Promise<TransportDB[]> {
        return await db.any(getTransport, transportId).then(transport => { return transport })
    }

    async selectTransportsByAgent(agentId : uid) {
        return await db.any(getTransportsByAgent, agentId).then(transports => { 
            function distanceNotZero(transport) { return (transport.distance > 0) }
            return transports.filter(distanceNotZero)
        })
    }

    async selectTransports() : Promise<TransportDB[]> { 
        return await db.any(getTransports).then(transports => { return transports })
    }

    async selectLocationFromTransport(owner, rtype) {
        return await db.manyOrNone(getTransportLocation, [owner, rtype]).then(id => { return id })
    }
}

