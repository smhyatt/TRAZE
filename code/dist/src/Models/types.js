"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformationDB = exports.TransportDB = exports.TransferDB = void 0;
const { v4: uuidv4 } = require('uuid'); // Unique identifier generator
class TransferDB {
    constructor(id, transferor, transferee, type, amount, time, info) {
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "transferor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "transferee", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "amount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "time_of_effect", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "info", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.id = (id === 'INIT') ? uuidv4() : id;
        this.transferor = transferor;
        this.transferee = transferee;
        this.type = type;
        this.amount = amount;
        this.time_of_effect = (time === 'INIT') ? new Date() : time;
        this.info = info;
    }
}
exports.TransferDB = TransferDB;
class TransportDB {
    constructor(owner, location_start, destination, type, amount, distance, id, time) {
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "owner", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "location_start", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "destination", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "resource_type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "amount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "time_of_effect", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "distance", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.owner = owner;
        this.location_start = location_start;
        this.destination = destination;
        this.resource_type = type;
        this.amount = amount;
        this.distance = distance;
        (id == undefined) ? this.id = uuidv4() : this.id = id;
        (time == undefined) ? this.time_of_effect = new Date() : this.time_of_effect = time;
    }
}
exports.TransportDB = TransportDB;
class TransformationDB {
    constructor(owner, info) {
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "owner", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "time_of_effect", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "info", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.id = uuidv4();
        this.owner = owner;
        this.time_of_effect = new Date();
        this.info = info;
    }
}
exports.TransformationDB = TransformationDB;
//# sourceMappingURL=types.js.map