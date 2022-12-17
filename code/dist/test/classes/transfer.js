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
const resourceType_1 = require("../../src/Models/classes/resourceType");
const resource_1 = require("../../src/Models/classes/resource");
const transfer_1 = require("../../src/Models/classes/transfer");
const agent_1 = require("../../src/Models/classes/agent");
const agent = new agent_1.Agent("Alice", "Farmer grl");
const rtype = new resourceType_1.ResourceType("USD", 1);
const resources = new resource_1.Resources(new Map([[rtype, 500]]));
describe('Transfer class tests', () => {
    before(() => instance_1.db.none(resetSchema));
    before(() => instance_1.db.none(schema));
    it('Cannot initialize transfer if sum total is different from 0', () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            new transfer_1.Transfer(new Map([[agent, resources]]));
        }
        catch (_a) {
            err => err.must.be.error;
        }
    }));
});
//# sourceMappingURL=transfer.js.map