import { OwnershipDB, uid } from '../types'
import { Agent } from '../classes/agent'
import { db } from '../database/instance'
const {
    createAgent,
    createDesignatedAgent,
    getAgent,
    getAgents,
    getAgentHolding
} = require('../database/queries')


export class AgentRepo {

    async selectAgentById(id : string) : Promise<Agent> {
        return await db.one(getAgent, id).then(data => { return data })
    }

    async selectAgents() : Promise<Agent> {
        return await db.any(getAgents).then(data => { return data })
    }

    async addAgent(agent : Agent) : Promise<uid> {
        return await db.one(createAgent, agent).then(agentId => { return agentId })
    }

    async addDesignatedAgent(agent : Agent) : Promise<uid> {
        return await db.any(createDesignatedAgent, agent).then(agentId => { return agentId })
    }

    async getAgentHolding(id : uid) : Promise<OwnershipDB> {
        return await db.any(getAgentHolding, id).then(data => { return data })
    }
    
}

