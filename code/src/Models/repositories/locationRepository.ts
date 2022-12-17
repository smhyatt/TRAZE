import { uid } from '../types'
import { db } from '../database/instance'
import { Location } from '../classes/location'
const {
    getLocation,
    getLocations,
    getLocationHolding,
    createLocation,
    createDesignatedLocation,
    getLocationsState,
} = require('../database/queries')


export class LocationRepo {
    
    private buildLocationDB(location : Location) {
        return {
            id: location.id,
            name: location.name,
            location: `POINT(${location.longitude} ${location.latitude})`
        } 
    }

    private buildLocationFromDB(locationDB) {
        const coord : Array<number> = 
            locationDB.location
            .slice(6, -1)
            .split(" ")
            .map(Number)

        if (coord.length != 2) {  throw Error("A location only has one set of coordinates.") }

        const coordinates = {
            longitude: coord[0],
            latitude: coord[1]
        }

        return new Location(locationDB.name, coordinates, locationDB.id)
    }

    async addLocation(location : Location) : Promise<uid> {
        const locationDB = this.buildLocationDB(location)
        return await db.one(createLocation, locationDB).then(locationId => { return locationId })
    }

    async addDesignatedLocation(location : Location) : Promise<uid> {
        const locationDB = this.buildLocationDB(location)
        return await db.any(createDesignatedLocation, locationDB).then(locationId => { return locationId })
    }
    
    async selectLocationById(id : uid) : Promise<Location> { 
        return await db.one(getLocation, id).then(locationDB => 
            this.buildLocationFromDB(locationDB) // map POINT(long lati) to object with longitude and latitude fields
        )
    }

    async selectLocations() : Promise<Location[]> {
        return await db.any(getLocations).then(locations => {
            let locs : Location[] = []
            locations.forEach(element => {
              locs.push(this.buildLocationFromDB(element))
            })
            return locs
        })
    }

    async selectLocationStates() : Promise<any> {
        return await db.any(getLocationsState).then(ls => { return ls })
    }


    /* async getLocationHolding(id : uid) : Promise<any> {
        return await db.any(getLocationHolding, id).then(data => { return data })
    } */
}