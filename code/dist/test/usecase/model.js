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
exports.modelForCarbonUsageOfAgent = exports.immediateNeighbors = void 0;
process.env.NODE_ENV = 'test';
require("mocha");
require("chai-http");
const chai = require("chai");
chai.use(require('chai-http'));
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const server = require('../../src/Controller/routes');
const printTransformationI = (ts, i) => console.log({ transformation: ts[i].t, input: ts[i].in, output: ts[i].out });
const printTransformation = (ts) => ts.forEach(t => { console.log({ transformation: t.t, input: t.in, output: t.out }); });
function getTransformationsOwnedByAgent(agentId) {
    return __awaiter(this, void 0, void 0, function* () {
        const trOwner = yield chai.request(server).get(`/api/transformations/owner/${agentId}`);
        let transformations = [];
        yield Promise.all(trOwner.body.map((t) => __awaiter(this, void 0, void 0, function* () {
            const ti = yield chai.request(server).get(`/api/transformation-inputs/${t.id}`);
            const to = yield chai.request(server).get(`/api/transformation-outputs/${t.id}`);
            transformations.push({ t: t, in: ti.body, out: to.body });
        })));
        return transformations;
    });
}
function getTransportsOwnedByAgent(agentId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield chai.request(server).get(`/api/transports/owner/${agentId}`)
            .then(transports => { return transports.body; })
            .catch(error => { return error; });
    });
}
function getCarbonFromCoffeeTransports(transports) {
    return __awaiter(this, void 0, void 0, function* () {
        let sum = 0;
        yield Promise.all(transports.map((transport) => __awaiter(this, void 0, void 0, function* () {
            const resourceTypeId = transport.resource_type;
            const resourceType = yield chai.request(server).get(`/api/resourcetypes/${resourceTypeId}`);
            sum = sum + (transport.distance * (transport.amount * resourceType.body.valuation) / 10000000);
        })));
        return sum;
    });
}
function getCarbonFromCoffeeTransformation(transformations, wetParchmentId, dryParchmentId) {
    return __awaiter(this, void 0, void 0, function* () {
        let sum = 0;
        yield Promise.all(transformations.map((transformation) => __awaiter(this, void 0, void 0, function* () {
            /*  input type:                                    // - output
            *      coffee cherry: amount * valuation * 0.000004
            *      wet parchment: amount * valuation * 0.000009
            *      dry parchment: amount * valuation * 0.000050 */
            const inputAmount = transformation.in[0].amount;
            const resourceTypeId = transformation.in[0].type;
            const resourceTypeRes = yield chai.request(server).get(`/api/resourcetypes/${resourceTypeId}`);
            const resourceType = resourceTypeRes.body;
            let c;
            let outAmount;
            if (resourceType.name == 'Coffee cherry') {
                c = 0.000004;
                try {
                    let o1 = transformation.out[0];
                    let o2 = transformation.out[1];
                    if (o1.type == wetParchmentId) {
                        outAmount = o1.amount;
                    }
                    else {
                        outAmount = o2.amount;
                    }
                }
                catch (_) {
                    throw Error('Must be 2 outputs (wet parchment and pulp) when transforming cherries');
                }
            }
            else if (resourceType.name == 'Wet parchment') {
                c = 0.000009;
                try {
                    let o1 = transformation.out[0];
                    let o2 = transformation.out[1];
                    if (o1.type == dryParchmentId) {
                        outAmount = o1.amount;
                    }
                    else {
                        outAmount = o2.amount;
                    }
                }
                catch (_) {
                    throw Error('Must be 2 outputs when transforming wet parchment');
                }
            }
            else if (resourceType.name == 'Dry parchment') {
                c = 0.000050;
                outAmount = 0.1;
            }
            else {
                throw Error('No resource type match in coffee transformation');
            }
            let carbonAmount = inputAmount * resourceType.valuation * c - (outAmount * 0.0000005);
            sum = sum + carbonAmount;
        })));
        return sum;
    });
}
function modelForCarbonUsageOfAgent(agentId, wetParchmentId, dryParchmentId) {
    return __awaiter(this, void 0, void 0, function* () {
        const transports = yield getTransportsOwnedByAgent(agentId);
        const carbonTransport = yield getCarbonFromCoffeeTransports(transports);
        const transformations = yield getTransformationsOwnedByAgent(agentId);
        const carbonTransformation = yield getCarbonFromCoffeeTransformation(transformations, wetParchmentId, dryParchmentId);
        return carbonTransport + carbonTransformation;
    });
}
exports.modelForCarbonUsageOfAgent = modelForCarbonUsageOfAgent;
function getTransfersAgentParticipatesIn(agentId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield chai.request(server).get(`/api/transfers/agent/${agentId}`)
            .then(res => { return res.body; })
            .catch(error => { return error; });
    });
}
function getTransferors(transfers, agentId) {
    let transferors = new Set();
    transfers.map(t => t.transferor != agentId ? transferors.add(t.transferor) : transferors.add(t.transferee));
    return transferors;
}
function immediateNeighbors(agentId, wetParchmentId, dryParchmentId) {
    return __awaiter(this, void 0, void 0, function* () {
        const transfers = yield getTransfersAgentParticipatesIn(agentId);
        const transferors = getTransferors(transfers, agentId);
        let sum = 0;
        for (let transferor of transferors) {
            const carbonOfTransferor = yield modelForCarbonUsageOfAgent(transferor, wetParchmentId, dryParchmentId);
            sum = sum + carbonOfTransferor;
        }
        return sum;
    });
}
exports.immediateNeighbors = immediateNeighbors;
//# sourceMappingURL=model.js.map