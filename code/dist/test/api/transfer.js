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
const data_1 = require("../data");
const { resetSchema, schema } = require('../../src/Models/database/queries');
const server = require('../../src/Controller/routes');
const amount1 = 0.7;
const amount2 = 0.3;
let agents = [];
let resourceType1;
let resourceType2;
let resourceType3;
let testTransfer;
// * Tests * //
describe('Transfers', () => {
    before(() => instance_1.db.none(resetSchema));
    before(() => instance_1.db.none(schema));
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        // * Setup resource types.
        const resRtypes = yield chai.request(server).post('/api/resourcetypes').send({ rtypes: data_1.resourceTypesInput });
        resourceType1 = resRtypes.body[0];
        resourceType2 = resRtypes.body[1];
        resourceType3 = resRtypes.body[2];
        // * Add agents with resources to the ownership.
        yield Promise.all(data_1.agentsInput.map((a) => __awaiter(void 0, void 0, void 0, function* () {
            const agentRes = yield chai.request(server).post('/api/agents').send(a);
            expect(agentRes).to.have.status(200);
            agents.push(agentRes.body);
        })));
        const rs = [{ type: resourceType1.id, amount: amount1 }, { type: resourceType2.id, amount: amount2 }];
        yield Promise.all(agents.map((agent) => __awaiter(void 0, void 0, void 0, function* () {
            const transfer = { transferor: 'INIT', transferee: agent.id, info: {}, resources: rs };
            const res = yield chai.request(server).post('/api/transfers').send(transfer);
            expect(res).to.have.status(200);
        })));
    }));
    after(() => instance_1.db.none(resetSchema));
    it('Should transfer resources from one agent to another.', () => __awaiter(void 0, void 0, void 0, function* () {
        const amount = 0.1;
        const rs = [{ type: resourceType1.id, amount: amount }, { type: resourceType2.id, amount: amount }];
        const transfer = { transferor: agents[0].id, transferee: agents[1].id, info: {}, resources: rs };
        const res = yield chai.request(server).post('/api/transfers').send(transfer);
        expect(res).to.have.status(200);
        testTransfer = res.body[0];
        res.body.forEach(t => {
            expect(t).to.have.property('id');
            expect(t).to.have.property('transferor');
            expect(t).to.have.property('transferee');
            expect(t).to.have.property('type');
            expect(t).to.have.property('amount');
            expect(t).to.have.property('time_of_effect');
            expect(t).to.have.property('info');
        });
        const ownerships = yield chai.request(server).get('/api/ownerships');
        ownerships.body.forEach(o => {
            // * Ensuring that agent0 has transferred the right resources. 
            if (o.agent === agents[0].id && o.type === resourceType1.id) {
                expect(o.amount).to.equal(exactMath.sub(amount1, amount));
            }
            if (o.agent === agents[0].id && o.type === resourceType2.id) {
                expect(o.amount).to.equal(exactMath.sub(amount2, amount));
            }
            // * Ensuring that agent1 has received the right resources. 
            if (o.agent === agents[1].id && o.type === resourceType1.id) {
                expect(o.amount).to.equal(exactMath.add(amount1, amount));
            }
            if (o.agent === agents[1].id && o.type === resourceType2.id) {
                expect(o.amount).to.equal(exactMath.add(amount2, amount));
            }
        });
    }));
    it('GET transfer based on its id', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield chai.request(server).get(`/api/transfers/${testTransfer.id}`);
        expect(res).to.have.status(200);
        expect(res.body[0].id).to.eq(testTransfer.id);
    }));
    it('Should fail when the agent does not exist.', () => __awaiter(void 0, void 0, void 0, function* () {
        const t = { transferor: 'faketransferor', transferee: 'faketransferee', info: {}, resources: [{ type: resourceType1.id, amount: 1.0 }] };
        const res = yield chai.request(server).post('/api/transfers').send(t);
        expect(res).to.have.status(400);
    }));
    it('Should fail when the resource type does not exist.', () => __awaiter(void 0, void 0, void 0, function* () {
        const t = { transferor: agents[0].id, transferee: agents[1].id, info: {}, resources: [{ type: 'faketype', amount: 0.2 }] };
        const res = yield chai.request(server).post('/api/transfers').send(t);
        expect(res).to.have.status(400);
    }));
    it('Should fail when transferor and transferee are the same.', () => __awaiter(void 0, void 0, void 0, function* () {
        const t = { transferor: agents[0].id, transferee: agents[0].id, info: {}, resources: [{ type: resourceType1.id, amount: 0.2 }] };
        const res = yield chai.request(server).post('/api/transfers').send(t);
        expect(res).to.have.status(400);
    }));
    it('Should fail when the agent doesnt own the resource to transfer.', () => __awaiter(void 0, void 0, void 0, function* () {
        const t = { transferor: agents[0].id, transferee: agents[1].id, info: {}, resources: [{ type: resourceType3, amount: 0.2 }] };
        const res = yield chai.request(server).post('/api/transfers').send(t);
        expect(res).to.have.status(400);
    }));
    it('Should fail when the agent doesnt own the amount of the resource to transfer.', () => __awaiter(void 0, void 0, void 0, function* () {
        const t = { transferor: agents[0].id, transferee: agents[1].id, info: {}, resources: [{ type: resourceType1, amount: 0.9 }] };
        const res = yield chai.request(server).post('/api/transfers').send(t);
        expect(res).to.have.status(400);
    }));
});
//# sourceMappingURL=transfer.js.map