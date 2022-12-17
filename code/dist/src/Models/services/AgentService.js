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
exports.AgentService = void 0;
const agent_1 = require("../classes/agent");
class AgentService {
    constructor(rm, ar) {
        Object.defineProperty(this, "agentRepo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "resourceManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.resourceManager = rm;
        this.agentRepo = ar;
    }
    selectAgent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            this.handleSendWithReturn(res, this.agentRepo.selectAgentById, id, "Agent not found.");
        });
    }
    selectAgents(res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.agentRepo.selectAgents()
                .then(agents => { return res.send(agents); })
                .catch(error => { return res.status(400).send({ error: "Error getting agents.", msg: error }); });
        });
    }
    selectAgentHolding(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            this.handleSendWithReturn(res, this.agentRepo.getAgentHolding, id, "Can't get the agent's holding.");
        });
    }
    insertAgent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, type } = req.body;
            const agent = new agent_1.Agent(name, type);
            this.resourceManager.addAgent(agent);
            this.handleSendWithReturn(res, this.agentRepo.addAgent, agent, "Error inserting agent.");
        });
    }
    handleSendWithReturn(res, fun, params, errMsg) {
        return __awaiter(this, void 0, void 0, function* () {
            yield fun(params)
                .then(data => { return res.send(data); })
                .catch(error => { return res.status(400).send({ error: errMsg, msg: error }); });
        });
    }
}
exports.AgentService = AgentService;
//# sourceMappingURL=AgentService.js.map