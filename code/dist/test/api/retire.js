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
const { resetSchema, schema } = require('../../src/Models/database/queries');
const instance_1 = require("../../src/Models/database/instance");
const server = require('../../src/Controller/routes');
const { expect } = chai;
let cccId;
let aid;
let retireId;
describe('Retire carbon credit certificates', () => {
    before(() => instance_1.db.none(resetSchema));
    before(() => instance_1.db.none(schema));
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        // Add carbon credit certificate
        const ccc = {
            name: "The best CCC",
            valuation: 24000,
            time_period: {
                startTime: new Date(),
                endTime: new Date(),
            },
            area: [
                { longitude: 0, latitude: 0 },
                { longitude: 0, latitude: 5 },
                { longitude: 5, latitude: 0 },
                { longitude: 5, latitude: 5 },
            ],
            evidence: {}
        };
        const cccRes = yield chai.request(server).post('/api/carbon-credit-certificates').send(ccc);
        cccId = cccRes.body.id;
        // Add agent
        const agentRes = yield chai.request(server).post('/api/agents').send({ name: "Alice", type: "Coffee lover" });
        aid = agentRes.body.id;
        // Add ownership of CCC to agent
        const transfer = {
            transferor: "INIT",
            transferee: aid,
            resources: [{ type: cccId, amount: 1.0 }],
            info: {},
        };
        yield chai.request(server).post('/api/transfers').send(transfer);
    }));
    it('Retire part of carbon credit certificate (CCC)', () => __awaiter(void 0, void 0, void 0, function* () {
        const cccRetire = {
            transferor: aid,
            carbon_credit_certificate: cccId,
            amount: 0.1,
        };
        const cccRetireRes = yield chai.request(server).post('/api/carbon-credit-certificates/retire').send(cccRetire);
        expect(cccRetireRes).to.have.status(200);
        expect(cccRetireRes.body[0].transferor).to.equal(aid);
        expect(cccRetireRes.body[0].type).to.equal(cccId);
        expect(cccRetireRes.body[0].amount).to.equal(0.1);
        retireId = cccRetireRes.body[0].id;
    }));
    it('Cannot retire more than the whole of a carbon credit certificate (CCC)', () => __awaiter(void 0, void 0, void 0, function* () {
        // Setup
        const cccRetire = {
            transferor: aid,
            carbon_credit_certificate: cccId,
            amount: 1.1,
        };
        // Act
        const cccRetireRes = yield chai.request(server).post('/api/carbon-credit-certificates/retire').send(cccRetire);
        // Assert
        expect(cccRetireRes).to.have.status(400);
    }));
    it('Get retire of specific CCC transfer', () => __awaiter(void 0, void 0, void 0, function* () {
        // Act
        const res = yield chai.request(server).get(`/api/carbon-credit-certificates/retire/${retireId}`);
        // Assert
        expect(res).to.have.status(200);
        expect(res.body.id).to.equal(retireId);
    }));
    it('Get retire of carbon credit certificates transfers', () => __awaiter(void 0, void 0, void 0, function* () {
        // Act
        const res = yield chai.request(server).get('/api/carbon-credit-certificates/retire');
        // Assert
        expect(res).to.have.status(200);
        expect(res.body.length).to.equal(1);
    }));
    it('Cannot make more than ONE whole (1.0) CCC at once', () => __awaiter(void 0, void 0, void 0, function* () {
        const ccc = {
            name: "The next best CCC",
            valuation: 25000,
            time_period: {
                startTime: new Date(),
                endTime: new Date(),
            },
            area: [
                { longitude: 100, latitude: 100 },
                { longitude: 100, latitude: 105 },
                { longitude: 105, latitude: 100 },
            ],
            evidence: {}
        };
        const cccRes = yield chai.request(server).post('/api/carbon-credit-certificates').send(ccc);
        const transfer = {
            transferor: "INIT",
            transferee: aid,
            resources: [{ type: cccRes.body.id, amount: 1.1 }]
        };
        const res = yield chai.request(server).post('/api/transfers').send(transfer);
        expect(res).to.have.status(400);
    }));
    it('Cannot make more than ONE whole (1.0) CCC in two consecutive times', () => __awaiter(void 0, void 0, void 0, function* () {
        // Add agent
        const agentRes = yield chai.request(server).post('/api/agents').send({ name: "Bob", type: "Coffee lover" });
        const aid = agentRes.body.id;
        // Add carbon credit certificate
        const ccc = {
            name: "The next best CCC",
            valuation: 25000,
            time_period: {
                startTime: new Date(),
                endTime: new Date(),
            },
            area: [
                { longitude: 110, latitude: 110 },
                { longitude: 110, latitude: 115 },
                { longitude: 115, latitude: 110 },
            ],
            evidence: {}
        };
        const cccRes = yield chai.request(server).post('/api/carbon-credit-certificates').send(ccc);
        // Initialise resource: 0.7 CCC
        const transfer = {
            transferor: "INIT",
            transferee: aid,
            resources: [{ type: cccRes.body.id, amount: 0.7 }]
        };
        const res = yield chai.request(server).post('/api/transfers').send(transfer);
        expect(res).to.have.status(200);
        // Try to initialise resource: 0.9 CCC, but is not possible because we already have 0.7 CCC and 1.0 is maximum
        const transfer2 = {
            transferor: "INIT",
            transferee: aid,
            resources: [{ type: cccRes.body.id, amount: 0.9 }]
        };
        const res2 = yield chai.request(server).post('/api/transfers').send(transfer2);
        expect(res2).to.have.status(400);
    }));
    it('Can spend CCC using multiple retire transfers', () => __awaiter(void 0, void 0, void 0, function* () {
        // Add CCC to system
        const ccc = {
            name: "The Silver CCC",
            valuation: 25000,
            time_period: {
                startTime: new Date(),
                endTime: new Date(),
            },
            area: [
                { longitude: -52.2159, latitude: -3.5653 },
                { longitude: -50.055521, latitude: -3.164733 },
                { longitude: -45.126648, latitude: -2.263106 },
            ],
            evidence: {}
        };
        const cccRes = yield chai.request(server).post('/api/carbon-credit-certificates').send(ccc);
        // Setup ownership of a whole CCC
        const transfer1 = {
            transferor: "INIT",
            transferee: aid,
            resources: [{ type: cccRes.body.id, amount: 1.0 }]
        };
        const res1 = yield chai.request(server).post('/api/transfers').send(transfer1);
        expect(res1).to.have.status(200);
        // Retire CCC 
        const cccRetire = {
            transferor: aid,
            carbon_credit_certificate: cccId,
            amount: 0.5,
        };
        const cccRetireRes = yield chai.request(server).post('/api/carbon-credit-certificates/retire').send(cccRetire);
        expect(cccRetireRes).to.have.status(200);
        const cccRetireRes2 = yield chai.request(server).post('/api/carbon-credit-certificates/retire').send(cccRetire);
        expect(cccRetireRes2).to.have.status(400);
    }));
    after(() => instance_1.db.none(resetSchema));
});
//# sourceMappingURL=retire.js.map