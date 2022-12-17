import { uid } from '../types'
import { db } from '../database/instance'
const { insertResourceLocation } = require('../database/queries')

export class LocationStateRepo {

    async addResourceLocation(resourceLocation) : Promise<uid> {
        return await db.none(insertResourceLocation, resourceLocation).then(() => 'OK')
    }

}