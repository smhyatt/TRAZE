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
exports.TransportService = void 0;
const resource_1 = require("../classes/resource");
const transport_1 = require("../classes/transport");
const types_1 = require("../types");
class TransportService {
    constructor(rm, ar, tpr, lr, rtr) {
        Object.defineProperty(this, "agentRepo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "locationRepo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "transportRepo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "resourceTypeRepo", {
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
        Object.defineProperty(this, "designatedLocation", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.resourceManager = rm;
        this.agentRepo = ar;
        this.locationRepo = lr;
        this.transportRepo = tpr;
        this.resourceTypeRepo = rtr;
    }
    selectTransport(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            yield this.transportRepo.selectTransportById(id)
                .then(data => { return res.send(data); })
                .catch(err => { return res.status(400).send({ error: "Error getting transport", msg: err }); });
        });
    }
    selectTransportsByAgent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            yield this.transportRepo.selectTransportsByAgent(id)
                .then(data => { return res.send(data); })
                .catch(err => { return res.status(400).send({ error: "Error getting transport", msg: err }); });
        });
    }
    selectTransports(res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.transportRepo.selectTransports()
                .then(data => { return res.send(data); })
                .catch(err => { return res.status(400).send({ error: "Error getting transports", msg: err }); });
        });
    }
    /* Input format:
     * { agent: uid,
     *   location_start: uid | "INIT", -- "INIT" is for when the resources have no location yet, and they need to get one
     *   destination: uid,
     *   resources: [{ type: uid, amount: number}] } */
    insertTransport(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { agent, location_start, destination, resources, distance } = req.body;
            const a = yield this.agentRepo.selectAgentById(agent)
                .catch(err => { return res.status(400).send({ error: `The agent with id: ${agent} does not exist`, msg: err }); });
            let l1;
            if (location_start === "INIT") {
                yield this.insertDesignatedLocation(res);
                l1 = this.designatedLocation;
                location_start = this.designatedLocation.id;
            }
            else {
                l1 = yield this.locationRepo.selectLocationById(location_start)
                    .catch(err => { return res.status(400).send({ error: `LocationStart with id: ${location_start} does not exist`, msg: err }); });
            }
            const l2 = yield this.locationRepo.selectLocationById(destination)
                .catch(err => { return res.status(400).send({ error: `destination location with id: ${destination} does not exist`, msg: err }); });
            let resourcesM = new Map(); // for resource vector
            let transportDB = []; // for db
            let transportId;
            let time;
            yield Promise.all(resources.map((r) => __awaiter(this, void 0, void 0, function* () {
                let resource = Number(r.amount);
                let resourceType = yield this.resourceTypeRepo.selectResourceTypeById(r.type)
                    .catch(err => { return res.status(400).send({ error: `The resource type with id: ${r.type} does not exist`, msg: err }); });
                resourcesM.set(resourceType, resource);
                if (transportDB.length === 0) {
                    // Only need to update transportId and time once; the first time data is pushed to transportDB
                    transportDB.push(new types_1.TransportDB(agent, location_start, destination, r.type, resource, distance));
                    transportId = transportDB[0].id;
                    time = transportDB[0].time_of_effect;
                }
                else {
                    transportDB.push(new types_1.TransportDB(agent, location_start, destination, r.type, resource, distance, transportId, time));
                }
            })));
            const resources_ = new resource_1.Resources(resourcesM);
            let agentOwnsResources = this.resourceManager.actorCanBeInEvent(a, resources_, this.resourceManager.ownership);
            if (agentOwnsResources) {
                const transport = new transport_1.Transport(new Map([
                    [l1, resource_1.Resources.mult(-1, resources_)],
                    [l2, resources_]
                ]));
                const validTransport = this.resourceManager.applyTransport(transport);
                if (validTransport) {
                    // build data about resources locations for database
                    let newResourceLocations = [];
                    transportDB.forEach(tdb => {
                        let updateResLocs = this.getResourceLocationFromLocationState(location_start, destination, tdb);
                        newResourceLocations.push({ location_id: location_start, resource_type: tdb.resource_type, amount: Number(updateResLocs.get(location_start)) });
                        newResourceLocations.push({ location_id: destination, resource_type: tdb.resource_type, amount: Number(updateResLocs.get(destination)) });
                    });
                    yield this.transportRepo.addTransport(transportDB, newResourceLocations)
                        .then(data => { return res.send(data); })
                        .catch(err => { return res.status(400).send({ error: "Error storing transport in db", msg: err }); });
                }
                else {
                    return res.status(400).send({ error: "The transport is not valid (service)." });
                }
            }
            else {
                return res.status(400).send({ error: "The agent does not own the resources and cannot transport them" });
            }
        });
    }
    insertDesignatedLocation(res) {
        return __awaiter(this, void 0, void 0, function* () {
            this.designatedLocation = this.resourceManager.getDesignatedLocation;
            return yield this.locationRepo.addDesignatedLocation(this.designatedLocation)
                .catch(err => { res.status(400).send({ error: err }); });
        });
    }
    getResourceLocationFromLocationState(location_start, destination, transport) {
        const locationState = this.resourceManager.LocationState;
        let M = new Map;
        for (let [l, rs] of locationState.entries()) {
            if (l.id === location_start || l.id === destination) {
                rs.forEach((resource, resourceType) => {
                    if (resourceType.id == transport.resource_type) {
                        M.set(l.id, Number(resource));
                    }
                });
            }
        }
        return M;
    }
}
exports.TransportService = TransportService;
//# sourceMappingURL=TransportService.js.map