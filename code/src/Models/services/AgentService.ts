import { AgentRepo } from "../repositories/agentRepository";
import { Agent } from "../classes/agent";
import { ResourceManager } from "../classes/resourceManager";

export class AgentService {
    agentRepo : AgentRepo
    resourceManager : ResourceManager

    constructor(rm : ResourceManager, ar : AgentRepo) { 
        this.resourceManager = rm
        this.agentRepo = ar 
    }

    async selectAgent(req, res) {
        const { id } = req.params
        this.handleSendWithReturn(res, this.agentRepo.selectAgentById, id, "Agent not found.")
    }

    async selectAgents(res) {
        await this.agentRepo.selectAgents()
        .then(agents => { return res.send(agents)})
        .catch(error => { return res.status(400).send({ error: "Error getting agents.", msg: error })})
    }

    async selectAgentHolding(req, res) {
        const { id } = req.params
        this.handleSendWithReturn(res, this.agentRepo.getAgentHolding, id, "Can't get the agent's holding.")
    }

    async insertAgent(req, res) {
        const { name, type } = req.body
        const agent : Agent = new Agent(name, type)
        this.resourceManager.addAgent(agent)
        this.handleSendWithReturn(res, this.agentRepo.addAgent, agent, "Error inserting agent.")
    }

    private async handleSendWithReturn(res, fun, params, errMsg: string) {
        await fun(params)
        .then(data => { return res.send(data) })
        .catch(error => { return res.status(400).send({ error: errMsg, msg: error }) })
    }

}