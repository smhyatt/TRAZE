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
exports.AgentRepo = void 0;
const instance_1 = require("../database/instance");
const { createAgent, createDesignatedAgent, getAgent, getAgents, getAgentHolding } = require('../database/queries');
class AgentRepo {
    selectAgentById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.one(getAgent, id).then(data => { return data; });
        });
    }
    selectAgents() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.any(getAgents).then(data => { return data; });
        });
    }
    addAgent(agent) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.one(createAgent, agent).then(agentId => { return agentId; });
        });
    }
    addDesignatedAgent(agent) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.any(createDesignatedAgent, agent).then(agentId => { return agentId; });
        });
    }
    getAgentHolding(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.any(getAgentHolding, id).then(data => { return data; });
        });
    }
}
exports.AgentRepo = AgentRepo;
//# sourceMappingURL=agentRepository.js.map