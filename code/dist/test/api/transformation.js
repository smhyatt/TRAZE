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
const instance_1 = require("../../src/Models/database/instance");
const utilities_1 = require("../utilities");
const { resetSchema, schema } = require('../../src/Models/database/queries');
const server = require('../../src/Controller/routes');
// * Variables
const data_1 = require("../data");
let locationsIds = [];
let agent;
let agentRs;
const amount1 = 20.0;
const amount2 = 6.0;
const amount3 = 4.0;
let resourceTypeScrews;
let resourceTypeWoodenPlank;
let resourceTypeTableLeg;
let resourceTypeTable;
let resourceTypeFail1;
let resourceTypeFail2;
let testTransformation;
// * Tests * //
describe('Transformation with locations', () => {
    before(() => instance_1.db.none(resetSchema));
    before(() => instance_1.db.none(schema));
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        // * Setup resource types
        const resRtypes = yield chai.request(server).post('/api/resourcetypes').send({ rtypes: data_1.resourceTypesTransformation });
        resourceTypeScrews = resRtypes.body[0];
        resourceTypeWoodenPlank = resRtypes.body[1];
        resourceTypeTableLeg = resRtypes.body[2];
        resourceTypeTable = resRtypes.body[3];
        resourceTypeFail1 = resRtypes.body[4];
        resourceTypeFail2 = resRtypes.body[5];
        // * Add agent with resources to the ownership
        const agentRes = yield chai.request(server).post('/api/agents').send(data_1.agentsInputCS[0]);
        expect(agentRes).to.have.status(200);
        agent = agentRes.body;
        (0, utilities_1.sleep)(3000);
        agentRs = [{ type: resourceTypeScrews.id, amount: amount1 },
            { type: resourceTypeWoodenPlank.id, amount: amount2 },
            { type: resourceTypeTableLeg.id, amount: amount3 },
            { type: resourceTypeFail1.id, amount: 1.0 }];
        const transfer = { transferor: 'INIT', transferee: agent.id, info: {}, resources: agentRs };
        const transferRes = yield chai.request(server).post('/api/transfers').send(transfer);
        expect(transferRes).to.have.status(200);
        // * Create location
        const locationRes = yield chai.request(server).post('/api/locations').send(data_1.locationsInput[0]);
        locationsIds.push(locationRes.body.id);
        // * Create location for resource type
        const transport = { agent: agent.id, location_start: "INIT", destination: locationsIds[0], resources: agentRs, distance: 0 };
        const transportRes = yield chai.request(server).post('/api/transports').send(transport);
        expect(transportRes).to.have.status(200);
    }));
    after(() => instance_1.db.none(resetSchema));
    it('Should transform screws, woodenpland and tablelegs into a table.', () => __awaiter(void 0, void 0, void 0, function* () {
        const outputRs = [{ type: resourceTypeTable.id, amount: 1.0 }];
        const transformation = { agent: agent.id, inputResources: agentRs.slice(0, -1), outputResources: outputRs, info: {} };
        const res = yield chai.request(server).post('/api/transformations').send(transformation);
        expect(res).to.have.status(200);
        // * res.body contains data from Transformation_Output
        testTransformation = res.body[0];
        expect(res.body[0]).to.have.property('transformation');
        expect(res.body[0]).to.have.property('type');
        expect(res.body[0]).to.have.property('amount');
        expect(res.body[0].type).to.equal(resourceTypeTable.id);
        // * Doublecheck that the ownership is accurate. 
        const ownerships = yield chai.request(server).get('/api/ownerships');
        ownerships.body.forEach(o => {
            // * Ensuring that the agent now owns the right resources. 
            if (o.agent === agent.id && o.type === resourceTypeTable.id) {
                expect(o.amount).to.equal(1.0);
            }
            if (o.agent === agent.id && o.type === resourceTypeScrews.id) {
                expect(o.amount).to.equal(0);
            }
            if (o.agent === agent.id && o.type === resourceTypeWoodenPlank.id) {
                expect(o.amount).to.equal(0);
            }
            if (o.agent === agent.id && o.type === resourceTypeTableLeg.id) {
                expect(o.amount).to.equal(0);
            }
        });
    }));
    it('GET a transformation based on its id', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield chai.request(server).get(`/api/transformations/${testTransformation.transformation}`);
        expect(res).to.have.status(200);
        expect(res.body[0].id).to.eq(testTransformation.transformation);
    }));
    it('GET transformation inputs based on a transformation id', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield chai.request(server).get(`/api/transformation-inputs/${testTransformation.transformation}`);
        expect(res).to.have.status(200);
        expect(res.body).to.have.length(3);
    }));
    it('GET transformation outputs based on a transformation id', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield chai.request(server).get(`/api/transformation-outputs/${testTransformation.transformation}`);
        expect(res).to.have.status(200);
        expect(res.body).to.have.length(1);
    }));
    it('Should fail when the agent doesnt own one resource to transform.', () => __awaiter(void 0, void 0, void 0, function* () {
        const outputRs = [{ type: resourceTypeTable.id, amount: 1.0 }];
        const inputRs = [{ type: resourceTypeFail2.id, amount: 0.2 }, { type: resourceTypeFail1.id, amount: 0.2 }];
        const transformation = { agent: agent.id, inputResources: inputRs, outputResources: outputRs, info: {} };
        const res = yield chai.request(server).post('/api/transformations').send(transformation);
        expect(res).to.have.status(400);
    }));
    it('Should fail when the agent doesnt own all resources to transform.', () => __awaiter(void 0, void 0, void 0, function* () {
        const outputRs = [{ type: resourceTypeTable.id, amount: 1.0 }];
        const inputRs = [{ type: resourceTypeFail2.id, amount: 0.2 }];
        const transformation = { agent: agent.id, inputResources: inputRs, outputResources: outputRs, info: {} };
        const res = yield chai.request(server).post('/api/transformations').send(transformation);
        expect(res).to.have.status(400);
    }));
    it('Should fail when the agent doesnt own the amount of one resource to transform.', () => __awaiter(void 0, void 0, void 0, function* () {
        const outputRs = [{ type: resourceTypeScrews.id, amount: 2.5 }];
        const inputRs = [{ type: resourceTypeFail1.id, amount: 1.2 }, { type: resourceTypeTable.id, amount: 0.1 }];
        const transformation = { agent: agent.id, inputResources: inputRs, outputResources: outputRs, info: {} };
        const res = yield chai.request(server).post('/api/transformations').send(transformation);
        expect(res).to.have.status(400);
    }));
    it('Should fail when the agent doesnt own the amount of all resources to transform.', () => __awaiter(void 0, void 0, void 0, function* () {
        const outputRs = [{ type: resourceTypeScrews.id, amount: 2.5 }];
        const inputRs = [{ type: resourceTypeFail1.id, amount: 1.2 }, { type: resourceTypeTable.id, amount: 1.1 }];
        const transformation = { agent: agent.id, inputResources: inputRs, outputResources: outputRs, info: {} };
        const res = yield chai.request(server).post('/api/transformations').send(transformation);
        expect(res).to.have.status(400);
    }));
    it('Should fail because the output resource type does not exist.', () => __awaiter(void 0, void 0, void 0, function* () {
        const outputRs = [{ type: 'fake-id', amount: 2.5 }];
        const inputRs = [{ type: resourceTypeFail1.id, amount: 0.2 }];
        const transformation = { agent: agent.id, inputResources: inputRs, outputResources: outputRs, info: {} };
        const res = yield chai.request(server).post('/api/transformations').send(transformation);
        expect(res).to.have.status(400);
    }));
    it('Should fail because the input resource type does not exist.', () => __awaiter(void 0, void 0, void 0, function* () {
        const outputRs = [{ type: resourceTypeScrews.id, amount: 2.5 }];
        const inputRs = [{ type: 'fake-id', amount: 1.2 }];
        const transformation = { agent: agent.id, inputResources: inputRs, outputResources: outputRs, info: {} };
        const res = yield chai.request(server).post('/api/transformations').send(transformation);
        expect(res).to.have.status(400);
    }));
});
describe('Transformation without locations', () => {
    before(() => instance_1.db.none(resetSchema));
    before(() => instance_1.db.none(schema));
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        // * Setup resource types.
        const resRtypes = yield chai.request(server).post('/api/resourcetypes').send({ rtypes: data_1.resourceTypesTransformation });
        resourceTypeScrews = resRtypes.body[0];
        resourceTypeWoodenPlank = resRtypes.body[1];
        resourceTypeTableLeg = resRtypes.body[2];
        resourceTypeTable = resRtypes.body[3];
        resourceTypeFail1 = resRtypes.body[4];
        resourceTypeFail2 = resRtypes.body[5];
        // * Add agent with resources to the ownership.
        const agentRes = yield chai.request(server).post('/api/agents').send(data_1.agentsInputCS[0]);
        expect(agentRes).to.have.status(200);
        agent = agentRes.body;
        (0, utilities_1.sleep)(3000);
        agentRs = [{ type: resourceTypeScrews.id, amount: amount1 },
            { type: resourceTypeWoodenPlank.id, amount: amount2 },
            { type: resourceTypeTableLeg.id, amount: amount3 },
            { type: resourceTypeFail1.id, amount: 1.0 }];
        const transfer = { transferor: 'INIT', transferee: agent.id, info: {}, resources: agentRs };
        const transferRes = yield chai.request(server).post('/api/transfers').send(transfer);
        expect(transferRes).to.have.status(200);
    }));
    it('Should transform screws, woodenpland and table legs into a table.', () => __awaiter(void 0, void 0, void 0, function* () {
        const outputRs = [{ type: resourceTypeTable.id, amount: 1.0 }];
        const transformation = { agent: agent.id, inputResources: agentRs.slice(0, -1), outputResources: outputRs, info: {} };
        const res = yield chai.request(server).post('/api/transformations').send(transformation);
        expect(res).to.have.status(200);
        // * res.body contains data from Transformation_Output
        testTransformation = res.body[0];
        expect(res.body[0]).to.have.property('transformation');
        expect(res.body[0]).to.have.property('type');
        expect(res.body[0]).to.have.property('amount');
        expect(res.body[0].type).to.equal(resourceTypeTable.id);
        // * Doublecheck that the ownership is accurate. 
        const ownerships = yield chai.request(server).get('/api/ownerships');
        ownerships.body.forEach(o => {
            // * Ensuring that the agent now owns the right resources. 
            if (o.agent === agent.id && o.type === resourceTypeTable.id) {
                expect(o.amount).to.equal(1.0);
            }
            if (o.agent === agent.id && o.type === resourceTypeScrews.id) {
                expect(o.amount).to.equal(0);
            }
            if (o.agent === agent.id && o.type === resourceTypeWoodenPlank.id) {
                expect(o.amount).to.equal(0);
            }
            if (o.agent === agent.id && o.type === resourceTypeTableLeg.id) {
                expect(o.amount).to.equal(0);
            }
        });
    }));
    it('GET a transformation based on its id', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield chai.request(server).get(`/api/transformations/${testTransformation.transformation}`);
        expect(res).to.have.status(200);
        expect(res.body[0].id).to.eq(testTransformation.transformation);
    }));
    it('GET transformation inputs based on a transformation id', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield chai.request(server).get(`/api/transformation-inputs/${testTransformation.transformation}`);
        expect(res).to.have.status(200);
        expect(res.body).to.have.length(3);
    }));
    it('GET transformation outputs based on a transformation id', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield chai.request(server).get(`/api/transformation-outputs/${testTransformation.transformation}`);
        expect(res).to.have.status(200);
        expect(res.body).to.have.length(1);
    }));
    it('Should fail when the agent doesnt own one resource to transform.', () => __awaiter(void 0, void 0, void 0, function* () {
        const outputRs = [{ type: resourceTypeTable.id, amount: 1.0 }];
        const inputRs = [{ type: resourceTypeFail2.id, amount: 0.2 }, { type: resourceTypeFail1.id, amount: 0.2 }];
        const transformation = { agent: agent.id, inputResources: inputRs, outputResources: outputRs, info: {} };
        const res = yield chai.request(server).post('/api/transformations').send(transformation);
        expect(res).to.have.status(400);
    }));
    it('Should fail when the agent doesnt own all resources to transform.', () => __awaiter(void 0, void 0, void 0, function* () {
        const outputRs = [{ type: resourceTypeTable.id, amount: 1.0 }];
        const inputRs = [{ type: resourceTypeFail2.id, amount: 0.2 }];
        const transformation = { agent: agent.id, inputResources: inputRs, outputResources: outputRs, info: {} };
        const res = yield chai.request(server).post('/api/transformations').send(transformation);
        expect(res).to.have.status(400);
    }));
    it('Should fail when the agent doesnt own the amount of one resource to transform.', () => __awaiter(void 0, void 0, void 0, function* () {
        const outputRs = [{ type: resourceTypeScrews.id, amount: 2.5 }];
        const inputRs = [{ type: resourceTypeFail1.id, amount: 1.2 }, { type: resourceTypeTable.id, amount: 0.1 }];
        const transformation = { agent: agent.id, inputResources: inputRs, outputResources: outputRs, info: {} };
        const res = yield chai.request(server).post('/api/transformations').send(transformation);
        expect(res).to.have.status(400);
    }));
    it('Should fail when the agent doesnt own the amount of all resources to transform.', () => __awaiter(void 0, void 0, void 0, function* () {
        const outputRs = [{ type: resourceTypeScrews.id, amount: 2.5 }];
        const inputRs = [{ type: resourceTypeFail1.id, amount: 1.2 }, { type: resourceTypeTable.id, amount: 1.1 }];
        const transformation = { agent: agent.id, inputResources: inputRs, outputResources: outputRs, info: {} };
        const res = yield chai.request(server).post('/api/transformations').send(transformation);
        expect(res).to.have.status(400);
    }));
    it('Should fail because the output resource type does not exist.', () => __awaiter(void 0, void 0, void 0, function* () {
        const outputRs = [{ type: 'fake-id', amount: 2.5 }];
        const inputRs = [{ type: resourceTypeFail1.id, amount: 0.2 }];
        const transformation = { agent: agent.id, inputResources: inputRs, outputResources: outputRs, info: {} };
        const res = yield chai.request(server).post('/api/transformations').send(transformation);
        expect(res).to.have.status(400);
    }));
    it('Should fail because the input resource type does not exist.', () => __awaiter(void 0, void 0, void 0, function* () {
        const outputRs = [{ type: resourceTypeScrews.id, amount: 2.5 }];
        const inputRs = [{ type: 'fake-id', amount: 1.2 }];
        const transformation = { agent: agent.id, inputResources: inputRs, outputResources: outputRs, info: {} };
        const res = yield chai.request(server).post('/api/transformations').send(transformation);
        expect(res).to.have.status(400);
    }));
    after(() => instance_1.db.none(resetSchema));
});
//# sourceMappingURL=transformation.js.map