import { uid } from '../types'
import { ResourceType } from '../classes/resourceType'
const pgp = require('pg-promise')({ capSQL: true }) // ! Obs. capslock has to be on
import { db } from '../database/instance'
const {
    getResourceType,
    getResourceTypes,
    getResourceTypeBasedOnType,
    deleteResourceTypeById,
} = require('../database/queries')

export class ResourceTypeRepo {
    
    async addResourceType(rtypeArr) {
        const cols = ['id', 'name', 'valuation']
        const cs = new pgp.helpers.ColumnSet(cols, {table: 'resource_type'})
        const query = pgp.helpers.insert(rtypeArr, cs) + ' RETURNING *;'
        return await db.many(query).then(data => {return data})
    }
    
    async selectResourceTypeById(id : uid) : Promise<ResourceType> {
        return await db.one(getResourceType, id).then(resourceType => { return resourceType })
    }

    async selectResourceTypeByName(name : string) : Promise<ResourceType> {
        return await db.one(getResourceTypeBasedOnType, name).then(resourceType => { return resourceType })
    }

    async selectResourceTypes() : Promise<ResourceType> {
        return await db.any(getResourceTypes).then(resourceTypes => { return resourceTypes })
    }

    async deleteResourceTypeById(id : uid) : Promise<any> {
        return await db.any(deleteResourceTypeById, id).then(res => { return res })
    }
}
