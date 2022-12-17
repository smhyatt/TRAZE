"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Location = void 0;
const { v4: uuidv4 } = require('uuid');
class Location {
    constructor(name, coordinates, id) {
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "longitude", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "latitude", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = name;
        this.longitude = coordinates.longitude;
        this.latitude = coordinates.latitude;
        (id == undefined) ? this.id = uuidv4() : this.id = id;
    }
}
exports.Location = Location;
//# sourceMappingURL=location.js.map