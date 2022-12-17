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
const data_1 = require("../data");
// * Setup framework (database, server, testing)
const instance_1 = require("../../src/Models/database/instance");
const server = require('../../src/Controller/routes');
const { expect } = chai;
// * Tests * //
describe('Resource Type', () => {
    before(() => instance_1.db.none(resetSchema)); // Drop if tables already exist
    before(() => instance_1.db.none(schema)); // Create all needed tables
    after(() => instance_1.db.none(resetSchema));
    // * Testing Resource Type
    it('Add resource types to the database', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield chai.request(server).post('/api/resourcetypes').send({ rtypes: data_1.resourceTypesInput });
        expect(res).to.have.status(200);
    }));
    it('GET list of all resource types', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield chai.request(server).get('/api/resourcetypes');
        expect(res).to.have.status(200);
        expect(res.body).to.have.length(data_1.resourceTypesInput.length);
    }));
});
//# sourceMappingURL=resourceType.js.map