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
// * Setup framework (database, server, testing) * //
const instance_1 = require("../../src/Models/database/instance");
const server = require('../../src/Controller/routes');
const { expect } = chai;
// * Variables for testing * //
const data_1 = require("../data");
let resourceType1;
let resourceType2;
let agents = [];
// * Tests * //
describe('Ownership', () => {
    before(() => instance_1.db.none(resetSchema));
    before(() => instance_1.db.none(schema));
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        // * Setup resource types.
        const resRtypes = yield chai.request(server).post('/api/resourcetypes').send({ rtypes: data_1.resourceTypesInput });
        resourceType1 = resRtypes.body[0];
        resourceType2 = resRtypes.body[1];
        yield Promise.all(data_1.agentsInput.map((a) => __awaiter(void 0, void 0, void 0, function* () {
            const agentRes = yield chai.request(server).post('/api/agents').send(a);
            expect(agentRes).to.have.status(200);
            agents.push(agentRes.body[0]);
        })));
    }));
    after(() => instance_1.db.none(resetSchema));
    it('Ensure that ownerships are created for multiple agents and resources.', () => __awaiter(void 0, void 0, void 0, function* () {
        const rs = [{ type: resourceType1.id, amount: 0.3 }, { type: resourceType2.id, amount: 0.8 }];
        agents.forEach((agent) => __awaiter(void 0, void 0, void 0, function* () {
            const transfer = { transferor: 'INIT', transferee: agent.id, info: {}, resources: rs };
            const res = yield chai.request(server).post('/api/transfers').send(transfer);
            expect(res).to.have.status(200);
        }));
        const ownerships = yield chai.request(server).get('/api/ownerships');
        ownerships.body.forEach(o => {
            expect(o).to.have.property('agent');
            expect(o).to.have.property('type');
            expect(o).to.have.property('amount');
        });
    }));
});
//# sourceMappingURL=ownership.js.map