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
process.env.NODE_ENV = 'test';
require("mocha");
require("chai-http");
const chai = require("chai");
chai.use(require('chai-http'));
const { expect } = chai;
const exactMath = require('exact-math'); // Computing with floating points accurately
const instance_1 = require("../../src/Models/database/instance");
const { resetSchema, schema } = require('../../src/Models/database/queries');
const server = require('../../src/Controller/routes');
// Variables
const data_1 = require("../data");
const amount = 0.1;
const amount1 = 0.7;
const amount2 = 0.3;
let agents = [];
let locationsIds = [];
let resourceType1;
let resourceType2;
describe('Transports', () => {
    before(() => instance_1.db.none(resetSchema));
    before(() => instance_1.db.none(schema));
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        // Setup resource types
        const resRtypes = yield chai.request(server).post('/api/resourcetypes').send({ rtypes: data_1.resourceTypesInput });
        resourceType1 = resRtypes.body[0];
        resourceType2 = resRtypes.body[1];
        // Add locations
        const locationRes0 = yield chai.request(server).post('/api/locations').send(data_1.locationsInput[0]);
        locationsIds.push(locationRes0.body.id);
        const locationRes1 = yield chai.request(server).post('/api/locations').send(data_1.locationsInput[1]);
        locationsIds.push(locationRes1.body.id);
        // Add agent with resources to the ownership
        const agentRes = yield chai.request(server).post('/api/agents').send(data_1.agentsInputCS[0]);
        expect(agentRes).to.have.status(200);
        agents.push(agentRes.body);
        const rs = [{ type: resourceType1.id, amount: amount1 }, { type: resourceType2.id, amount: amount2 }];
        const transfer = { transferor: 'INIT', transferee: agents[0].id, info: {}, resources: rs };
        const res = yield chai.request(server).post('/api/transfers').send(transfer);
        expect(res).to.have.status(200);
    }));
    it('Set initial location for resources using transport', () => __awaiter(void 0, void 0, void 0, function* () {
        // Setup
        const transport = {
            agent: agents[0].id,
            location_start: "INIT",
            destination: locationsIds[0],
            resources: [
                { type: resourceType1.id, amount: amount1 },
            ],
            distance: 0
        };
        // Act
        const res = yield chai.request(server).post('/api/transports').send(transport);
        // Assert
        expect(res).to.have.status(200);
        expect(res.body[0].resource_type).to.equal(resourceType1.id);
    }));
    it('Transport resources from location to other location', () => __awaiter(void 0, void 0, void 0, function* () {
        const transport = {
            agent: agents[0].id,
            location_start: locationsIds[0],
            destination: locationsIds[1],
            resources: [
                { type: resourceType1.id, amount: amount },
            ],
            distance: 10
        };
        const res = yield chai.request(server).post('/api/transports').send(transport);
        expect(res).to.have.status(200);
        res.body.forEach(t => {
            expect(t).to.have.property('id');
            expect(t).to.have.property('owner');
            expect(t).to.have.property('location_start');
            expect(t).to.have.property('destination');
            expect(t).to.have.property('resource_type');
            expect(t).to.have.property('amount');
            expect(t).to.have.property('time_of_effect');
        });
        const locationStates = yield chai.request(server).get('/api/location-states');
        locationStates.body.forEach(ls => {
            if (ls.location_id === locationsIds[0]) {
                expect(ls.amount).to.equal(exactMath.sub(amount1, amount));
            }
            else if (ls.location_id === locationsIds[1]) {
                expect(ls.amount).to.equal(amount);
            }
        });
    }));
    it('Transport resources back', () => __awaiter(void 0, void 0, void 0, function* () {
        const transportBack = {
            agent: agents[0].id,
            location_start: locationsIds[1],
            destination: locationsIds[0],
            resources: [
                { type: resourceType1.id, amount: amount },
            ],
            distance: 10
        };
        const tBackRes = yield chai.request(server).post('/api/transports').send(transportBack);
        expect(tBackRes).to.have.status(200);
        const locationStates = yield chai.request(server).get('/api/location-states');
        locationStates.body.forEach(ls => {
            if (ls.location_id === locationsIds[0]) {
                expect(ls.amount).to.equal(amount1);
            }
            else if (ls.location_id === locationsIds[1]) {
                expect(ls.amount).to.equal(0);
            }
        });
    }));
    it('Transport compound resource', () => __awaiter(void 0, void 0, void 0, function* () {
        const inp = [{ name: 'okse', valuation: 1 },
            { name: 'gris', valuation: 1 }];
        const resRtypes = yield chai.request(server).post('/api/resourcetypes').send({ rtypes: inp });
        let rts = resRtypes.body;
        const transportI = {
            agent: agents[0].id,
            location_start: "INIT",
            destination: locationsIds[0],
            resources: [
                { type: rts[0].id, amount: 11 },
                { type: rts[1].id, amount: 11 }
            ],
            distance: 0
        };
        const res = yield chai.request(server).post('/api/transports').send(transportI);
        expect(res).to.have.status(200);
        const transport = {
            agent: agents[0].id,
            location_start: locationsIds[0],
            destination: locationsIds[1],
            resources: [
                { type: rts[0].id, amount: 8.5 },
                { type: rts[1].id, amount: 8.5 }
            ],
            distance: 5
        };
        const tres = yield chai.request(server).post('/api/transports').send(transport);
        expect(tres).to.have.status(200);
        tres.body.forEach(t => {
            expect(t).to.have.property('id');
            expect(t).to.have.property('owner');
            expect(t).to.have.property('location_start');
            expect(t).to.have.property('destination');
            expect(t).to.have.property('resource_type');
            expect(t).to.have.property('amount');
            expect(t).to.have.property('time_of_effect');
        });
        const locationStates = yield chai.request(server).get('/api/location-states');
        locationStates.body.forEach(ls => {
            if (ls.location_id === locationsIds[0] &&
                (ls.resource_type === rts[0] || ls.resource_type === rts[1])) {
                expect(ls.amount).to.equal(exactMath.sub(11, 8.5));
            }
            else if (ls.location_id === locationsIds[1] && (ls.resource_type === rts[0] || ls.resource_type === rts[1])) {
                expect(ls.amount).to.equal(8.5);
            }
        });
    }));
    it('Transport should fail when location does not exist.', () => __awaiter(void 0, void 0, void 0, function* () {
        const transport = {
            agent: agents[0].id,
            location_start: 'unknown location',
            destination: locationsIds[1],
            resources: [
                { type: resourceType1.id, amount: amount1 },
            ],
            distance: 0
        };
        const res = yield chai.request(server).post('/api/transports').send(transport);
        expect(res).to.have.status(400);
    }));
    it('Transport should fail when agent does not exist.', () => __awaiter(void 0, void 0, void 0, function* () {
        const transport = {
            agent: 'unknown agent',
            location_start: locationsIds[0],
            destination: locationsIds[1],
            resources: [
                { type: resourceType1.id, amount: amount1 },
            ],
            distance: 5
        };
        const res = yield chai.request(server).post('/api/transports').send(transport);
        expect(res).to.have.status(400);
    }));
    it('Transport should fail when resource type does not exist.', () => __awaiter(void 0, void 0, void 0, function* () {
        const transport = {
            agent: agents[0].id,
            location_start: locationsIds[0],
            destination: locationsIds[1],
            resources: [
                { type: 'unknown id', amount: amount1 },
            ],
            distance: 5
        };
        const res = yield chai.request(server).post('/api/transports').send(transport);
        expect(res).to.have.status(400);
    }));
    after(() => instance_1.db.none(resetSchema));
});
//# sourceMappingURL=transport.js.map