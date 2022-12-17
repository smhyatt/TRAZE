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
// Setup framework (database, server, testing)
const instance_1 = require("../../src/Models/database/instance");
const server = require('../../src/Controller/routes');
const { expect } = chai;
// Variables for testing
const data_1 = require("../data");
let locationsIds = [];
describe('Location', () => {
    before(() => instance_1.db.none(resetSchema));
    before(() => instance_1.db.none(schema));
    after(() => instance_1.db.none(resetSchema));
    it('Add location to database', () => __awaiter(void 0, void 0, void 0, function* () {
        const location = data_1.locationsInput[0];
        const res = yield chai.request(server).post('/api/locations').send(location);
        locationsIds.push(res.body.id);
        expect(res).to.have.status(200);
    }));
    it('Get location from database', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield chai.request(server).get(`/api/locations/${locationsIds[0]}`);
        expect(res.body.id).to.equal(locationsIds[0]);
        expect(res).to.have.status(200);
    }));
    it('Get locations from database', () => __awaiter(void 0, void 0, void 0, function* () {
        // Setup
        const res = yield chai.request(server).post('/api/locations').send(data_1.locationsInput[1]);
        locationsIds.push(res.body.id);
        // Act
        const res2 = yield chai.request(server).get('/api/locations');
        // Assert
        expect(res2.body).to.have.length(locationsIds.length);
        expect(res2.body[1].id).to.equal(locationsIds[1]);
        expect(res2).to.have.status(200);
    }));
});
//# sourceMappingURL=location.js.map