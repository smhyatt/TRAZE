"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationRepo = void 0;
const instance_1 = require("../database/instance");
const location_1 = require("../classes/location");
const { getLocation, getLocations, getLocationHolding, createLocation, createDesignatedLocation, getLocationsState, } = require('../database/queries');
class LocationRepo {
    buildLocationDB(location) {
        return {
            id: location.id,
            name: location.name,
            location: `POINT(${location.longitude} ${location.latitude})`
        };
    }
    buildLocationFromDB(locationDB) {
        const coord = locationDB.location
            .slice(6, -1)
            .split(" ")
            .map(Number);
        if (coord.length != 2) {
            throw Error("A location only has one set of coordinates.");
        }
        const coordinates = {
            longitude: coord[0],
            latitude: coord[1]
        };
        return new location_1.Location(locationDB.name, coordinates, locationDB.id);
    }
    addLocation(location) {
        return __awaiter(this, void 0, void 0, function* () {
            const locationDB = this.buildLocationDB(location);
            return yield instance_1.db.one(createLocation, locationDB).then(locationId => { return locationId; });
        });
    }
    addDesignatedLocation(location) {
        return __awaiter(this, void 0, void 0, function* () {
            const locationDB = this.buildLocationDB(location);
            return yield instance_1.db.any(createDesignatedLocation, locationDB).then(locationId => { return locationId; });
        });
    }
    selectLocationById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.one(getLocation, id).then(locationDB => this.buildLocationFromDB(locationDB) // map POINT(long lati) to object with longitude and latitude fields
            );
        });
    }
    selectLocations() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.any(getLocations).then(locations => {
                let locs = [];
                locations.forEach(element => {
                    locs.push(this.buildLocationFromDB(element));
                });
                return locs;
            });
        });
    }
    selectLocationStates() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.any(getLocationsState).then(ls => { return ls; });
        });
    }
}
exports.LocationRepo = LocationRepo;
//# sourceMappingURL=locationRepository.js.map