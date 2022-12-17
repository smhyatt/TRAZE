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
exports.LocationService = void 0;
const location_1 = require("../classes/location");
class LocationService {
    constructor(rm, lr) {
        Object.defineProperty(this, "locationRepo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "resourceManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.resourceManager = rm;
        this.locationRepo = lr;
    }
    selectLocation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            yield this.locationRepo.selectLocationById(id)
                .then(data => { return res.send(data); })
                .catch(err => { return res.status(400).send({ error: "Error getting location", msg: err }); });
        });
    }
    selectLocations(res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.locationRepo.selectLocations()
                .then(data => { return res.send(data); })
                .catch(err => { return res.status(400).send({ error: "Error getting locations", msg: err }); });
        });
    }
    selectLocationStates(res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.locationRepo.selectLocationStates()
                .then(data => { return res.send(data); })
                .catch(err => { return res.status(400).send({ error: "Error getting location state", msg: err }); });
        });
    }
    insertLocation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, coordinates } = req.body;
            const location = new location_1.Location(name, coordinates);
            this.resourceManager.addLocation(location);
            yield this.locationRepo.addLocation(location)
                .then(data => { return res.send(data); })
                .catch(err => { return res.status(400).send({ error: "Error inserting location in database", msg: err }); });
        });
    }
}
exports.LocationService = LocationService;
//# sourceMappingURL=LocationService.js.map