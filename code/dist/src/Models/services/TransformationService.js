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
exports.TransformationService = void 0;
const resource_1 = require("../classes/resource");
const transformation_1 = require("../classes/transformation");
const types_1 = require("../types");
class TransformationService {
    constructor(rm, ar, rtr, trr, tpr, lsr) {
        Object.defineProperty(this, "agentRepo", {
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
        Object.defineProperty(this, "transformationRepo", {
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
        this.agentRepo = ar;
        this.resourceTypeRepo = rtr;
        this.transformationRepo = trr;
        this.transportRepo = tpr;
        this.locationRepo = lsr;
    }
    selectTransformation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            this.handleSendWithReturn(res, this.transformationRepo.selectTransformationById, id, "Transformation not found.");
        });
    }
    selectTransformationByOwner(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            this.handleSendWithReturn(res, this.transformationRepo.selectTransformationsByOwner, id, "Transformation not found");
        });
    }
    selectTransformations(res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.transformationRepo.selectTransformations()
                .then(data => { return res.send(data); })
                .catch(error => { return res.status(400).send({ error: "Error getting transformations from database", msg: error }); });
        });
    }
    selectTransformationInput(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            this.handleSendWithReturn(res, this.transformationRepo.selectTransformationInputById, id, "Transformation Input not found.");
        });
    }
    selectTransformationOutput(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            this.handleSendWithReturn(res, this.transformationRepo.selectTransformationOutputById, id, "Transformation Output not found.");
        });
    }
    insertTransformation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agent, location, inputResources, outputResources, info } = req.body;
            // * Ensure the agent exists and fetch from database
            const owner = yield this.agentRepo.selectAgentById(agent)
                .catch(err => { return res.status(400).send({ error: `The agent with id: ${agent} does not exist`, msg: err }); });
            let locationO;
            let resourcesAtLocation;
            if (location != undefined) {
                locationO = yield this.locationRepo.selectLocationById(location)
                    .catch(err => { return res.status(400).send({ error: `LocationStart with id: ${location} does not exist`, msg: err }); });
                resourcesAtLocation = this.resourceManager.LocationState.get(locationO);
            }
            // * Ensure the resource types to input exists and retrieve from database
            let resourcesMIn = new Map();
            yield Promise.all(inputResources.map((r) => __awaiter(this, void 0, void 0, function* () {
                const type = yield this.resourceTypeRepo.selectResourceTypeById(r.type)
                    .catch(err => { return res.status(400).send({ error: `The resource type with id: ${r.type} does not exist`, msg: err }); });
                resourcesMIn.set(type, r.amount);
                // Get resource at specific location
                if (resourcesAtLocation != undefined) {
                    const resource = resourcesAtLocation.get({ id: r.type });
                    if (resource == null) {
                        return res.status(400).send({ error: 'A transformation can only occur for resources with the same location.' });
                    }
                }
            })));
            const resourcesIn = new resource_1.Resources(resourcesMIn);
            const locationExist = location != undefined ? locationO : false;
            // * Ensure the resource types to input exists and retrieve from database
            let resourcesMOut = new Map();
            yield Promise.all(outputResources.map((r) => __awaiter(this, void 0, void 0, function* () {
                const type = yield this.resourceTypeRepo.selectResourceTypeById(r.type)
                    .catch(err => { return res.status(400).send({ error: `The resource type with id: ${r.type} does not exist`, msg: err }); });
                resourcesMOut.set(type, r.amount);
            })));
            const resourcesOut = new resource_1.Resources(resourcesMOut);
            // * Ensure the agent owns the needed input resources using the resource manager
            let agentOwnsResources = this.resourceManager.actorCanTransform(owner, resourcesIn, this.resourceManager.ownership);
            if (agentOwnsResources) {
                // * Ensures that the sum total of the input and output is zero
                const transformation = new transformation_1.Transformation(resource_1.Resources.add(resource_1.Resources.mult(-1, resourcesIn), resourcesOut));
                // * Update the ownershipstate in the resource manager
                this.resourceManager.applyTransformation(owner, locationExist, transformation);
                // * Create and insert the transformation, inputs and outputs, and update ownerships to the database.
                const transformationDB = new types_1.TransformationDB(agent, info);
                const transformationInputDB = this.transformationInputAndOutput(transformationDB.id, resourcesMIn);
                const transformationOutputDB = this.transformationInputAndOutput(transformationDB.id, resourcesMOut);
                // * If locations exist, create the data to update the database.
                let locationDB = [];
                if (location != undefined) {
                    locationDB = this.getStateFromTransformation([location, this.resourceManager.getDesignatedLocation.id], transformation, this.resourceManager.LocationState, 'location');
                }
                // * Gets the updated ownership details for both the agent and the resource manager
                const ownershipDB = this.getStateFromTransformation([agent, this.resourceManager.id], transformation, this.resourceManager.ownership, 'ownership');
                const send = { transformationDB, transformationInputDB, transformationOutputDB, ownershipDB, locationDB };
                this.handleSendWithReturn(res, this.transformationRepo.addTransformation, send, "Error storing transformation.");
            }
            else {
                return res.status(400).send({ error: "The agent does not own the resources and cannot transform them." });
            }
        });
    }
    // * Retrieve the current ownership or location state for a given actor after a transformation is performed
    getStateFromTransformation([actor, rm], transformation, state, stateType) {
        const res = [];
        transformation.forEach((_r, rt) => {
            // * Extracting the amount from the updated ownershipstate.
            const actorAmount = this.resourceManager.getAmountOfTypeFromState(actor, rt.id, state);
            const RMAmount = this.resourceManager.getAmountOfTypeFromState(rm, rt.id, state);
            // ! OBS. it currently stores ownerships even if the amount is 0
            if (stateType === 'ownership') {
                res.push({ agent: actor, type: rt.id, amount: Number(actorAmount) });
                res.push({ agent: rm, type: rt.id, amount: Number(RMAmount) });
            }
            else {
                res.push({ location_id: actor, resource_type: rt.id, amount: Number(actorAmount) });
                res.push({ location_id: rm, resource_type: rt.id, amount: Number(RMAmount) });
            }
        });
        return res;
    }
    transformationInputAndOutput(transformationId, updates) {
        const res = [];
        updates.forEach((r, rt) => {
            res.push({ transformation: transformationId, type: rt.id, amount: r });
        });
        return res;
    }
    handleSendWithReturn(res, fun, params, errMsg) {
        return __awaiter(this, void 0, void 0, function* () {
            yield fun(params)
                .then(data => { return res.send(data); })
                .catch(error => { return res.status(400).send({ error: errMsg, msg: error }); });
        });
    }
}
exports.TransformationService = TransformationService;
//# sourceMappingURL=TransformationService.js.map