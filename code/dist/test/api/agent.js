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
const chaiAsPromised = require('chai-as-promised');
const { expect } = chai;
chai.use(chaiAsPromised);
const { resetSchema, schema } = require('../../src/Models/database/queries');
// * Setup framework (database, server, testing) * //
const instance_1 = require("../../src/Models/database/instance");
const server = require('../../src/Controller/routes');
// * Variables for testing
const data_1 = require("../data");
let agentIds = [];
let resourceType1;
let resourceType2;
let agentWithResourceId;
let resource;
// * Tests of agent api * //
describe('Agent', () => {
    before(() => instance_1.db.none(resetSchema)); // Drop if tables already exist
    before(() => instance_1.db.none(schema)); // Create all needed tables
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        const resResourceT = yield chai.request(server).post('/api/resourcetypes').send({ rtypes: data_1.resourceTypesInput });
        resourceType1 = resResourceT.body[0];
        resourceType2 = resResourceT.body[1];
        resource = 0.5;
    }));
    it('Add multiple agents to database at once without resources', () => __awaiter(void 0, void 0, void 0, function* () {
        yield Promise.all(data_1.agentsInputCS.map((a) => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield chai.request(server).post('/api/agents').send(a);
            expect(res).to.have.status(200);
        })));
    }));
    it('GET list of all agents', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield chai.request(server).get('/api/agents');
        // Adding to global agentIds var to use agent ids in other tests
        agentIds.push(res.body.map(data => data.id));
        agentIds = agentIds.flat(1);
        expect(res).to.have.status(200);
        expect(res.body).to.have.length(agentIds.length);
        expect(res.body.every(agent => expect(agent).to.have.property('id').with.lengthOf(36)));
    }));
    it('GET an agent based on its id', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield chai.request(server).get(`/api/agents/${agentIds[0]}`);
        expect(res).to.have.status(200);
        expect(res.body.id).to.eq(agentIds[0]);
    }));
    it('Add agents with resources to database all at once', () => __awaiter(void 0, void 0, void 0, function* () {
        const agentRes = yield chai.request(server).post('/api/agents').send(data_1.agentsInput[0]);
        expect(agentRes).to.have.status(200);
        expect(agentRes.body).to.have.property('id');
        expect(agentRes.body).to.have.property('name');
        expect(agentRes.body).to.have.property('type');
        expect(agentRes.body).to.have.property('key');
        agentWithResourceId = agentRes.body.id; // store for other test
        const amount = 0.1;
        const rs = [{ type: resourceType1.id, amount: amount }, { type: resourceType2.id, amount: amount }];
        const transfer = { transferor: 'INIT', transferee: agentWithResourceId, info: {}, resources: rs };
        const res = yield chai.request(server).post('/api/transfers').send(transfer);
        expect(res).to.have.status(200);
        res.body.forEach(t => {
            expect(t).to.have.property('id');
            expect(t).to.have.property('transferor');
            expect(t).to.have.property('transferee');
            expect(t).to.have.property('type');
            expect(t).to.have.property('amount');
            expect(t).to.have.property('time_of_effect');
            expect(t).to.have.property('info');
        });
    }));
    it('GET an agents resource holding based on agent id', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield chai.request(server).get(`/api/agent-holdings/${agentWithResourceId}`);
        expect(res).to.have.status(200);
        res.body.forEach(a => {
            expect(a).to.have.property('agent');
            expect(a).to.have.property('type');
            expect(a).to.have.property('amount');
        });
    }));
    after(() => instance_1.db.none(resetSchema));
});
//# sourceMappingURL=agent.js.map