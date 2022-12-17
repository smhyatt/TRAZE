import { AgentRepo } from "../repositories/agentRepository";
import { TransferRepo } from "../repositories/transferRepository";
import { ResourceTypeRepo } from "../repositories/resourceRepository";
import { CarbonCreditCertificateRepo } from "../repositories/carbonCreditCertificateRepository";

import { Agent } from "../classes/agent";
import { Transfer } from "../classes/transfer";
import { Resources } from "../classes/resource";
import { ResourceType } from "../classes/resourceType";
import { ResourceManager } from "../classes/resourceManager";

import { uid, Resource, OwnershipDB, TransferDB } from "../types";

export class TransferService {
    agentRepo : AgentRepo
    transferRepo : TransferRepo
    resourceTypeRepo : ResourceTypeRepo
    carbonCreditCertificateRepo : CarbonCreditCertificateRepo
    resourceManager : ResourceManager
    designatedAgent : Agent

    constructor(rm : ResourceManager, tr : TransferRepo, ar : AgentRepo, 
                rtr : ResourceTypeRepo, cccr : CarbonCreditCertificateRepo) {
        this.resourceManager = rm
        this.transferRepo = tr
        this.agentRepo = ar
        this.resourceTypeRepo = rtr
        this.carbonCreditCertificateRepo = cccr
    }

    async selectTransfer(req, res) {
        const { id } = req.params
        this.handleSendWithReturn(res, this.transferRepo.selectTransferById, id, "Transfer not found.")
    }

    async selectTransferByAgentId(req, res) {
        const { id } = req.params
        this.handleSendWithReturn(res, this.transferRepo.selectTransferByAgentId, id, "Error getting transfers by transferee")
    }

    async insertTransfer(req, res) {
        let { transferor, transferee, info, resources } = req.body

        // * Ensure that the sender and recipient are not the same
        if (transferor === transferee) {
            return res.status(400).send({ error: 'Transferor and transferee must be different.' })
        }

        // * Fetch the agent objects of the transferor if there is any, otherwise use the resource manager
        let transferorObj
        if (transferor === "INIT") {
            this.insertDesignatedAgent()
            transferor = this.resourceManager.id
            transferorObj = this.resourceManager
        } else {
            transferorObj = await this.agentRepo.selectAgentById(transferor)
            .catch(err => { return res.status(400).send({error: `The agent with id: ${transferor} does not exist`, msg: err}) })
        }
        
        // * Fetch the agent objects of the transferee
        const transfereeObj = await this.agentRepo.selectAgentById(transferee)
            .catch(err => { return res.status(400).send({error: `The agent with id: ${transferee} does not exist`, msg: err}) })

        let resourcesM : Map<ResourceType,Resource> = new Map()
        let transferDB = []
        let transferId : uid
        let time : Date
        await Promise.all( resources.map(async r => {
            let amount = Number(r.amount)
            // Extract the resource type object from the database (TODO: change to RM)
            let resourceType : ResourceType =
                await this.resourceTypeRepo.selectResourceTypeById(r.type)
                .catch(err => { return res.status(400).send({ error: `The resource type with id: ${r.type} does not exist`, msg: err }) })

            const resourceTypeIsCCC = await this.carbonCreditCertificateRepo.cccExists(r.type)
            if (resourceTypeIsCCC) {
                if (amount > 1) { return res.status(400).send({ error: `There can maximum exist a whole CCC (1.0).`})}
                let alreadyOwned = 0
                for (let [agent, rs] of this.resourceManager.ownership.entries()) {
                    if (agent.id != this.resourceManager.id) {
                        alreadyOwned = alreadyOwned + rs.get(resourceType)
                    }
                }
                if (!(1 >= amount + alreadyOwned)) {
                    return res.status(400).send({ error: `There can maximum exist a whole CCC (1.0).`})
                }
            }
        
            resourcesM.set(resourceType, amount)

            if (transferDB.length === 0) {
                // * Only need to update transferId and time once, the first time data is put in transferDB
                transferDB.push(new TransferDB('INIT', transferor, transferee, r.type, amount, 'INIT', info))
                transferId = transferDB[0].id
                time = transferDB[0].time_of_effect
            } else {
                transferDB.push(new TransferDB(transferId, transferor, transferee, r.type, amount, time, info))
            }
        }))
        const resources_ = new Resources(resourcesM)
        const transfer = new Transfer(new Map<Agent, Resources>([
            [transferorObj, Resources.mult(-1, resources_)],
            [transfereeObj, resources_]
        ]))
        // * Ensure the transfer is valid
        const valid = this.resourceManager.applyTransfer(transfer)
        if (valid) {
            const ownershipDB = this.getOwnershipsFromTransfer(transferDB)
            this.handleSendWithReturn(res, this.transferRepo.addTransfer, {transferDB, ownershipDB}, "Error storing transfers.")
        } else {
            return res.status(400).send({ error: `Transfer ${transferId} was not valid (service).`})
        }
    }

    private getOwnershipsFromTransfer(transfer) : Array<OwnershipDB> {
        const res = []
        transfer.forEach(t => {
            const transferorAmount = this.resourceManager.getAmountOfTypeFromState(t.transferor, t.type, this.resourceManager.ownership)
            const transfereeAmount = this.resourceManager.getAmountOfTypeFromState(t.transferee, t.type, this.resourceManager.ownership)
            // ! OBS. it currently stores ownerships even if the amount is 0 
            // * Note that we do not need to add or subtract the transferring amount, because the transfer is already stored in 
            // * the resource manager and its ownershipstate, so we are merely extracting the amount after the transfer.
            res.push({ agent : t.transferor, type : t.type, amount : Number(transferorAmount)})
            res.push({ agent : t.transferee, type : t.type, amount : Number(transfereeAmount)})
        })
        return res
    }

    private async insertDesignatedAgent() {
        this.designatedAgent = this.resourceManager.getRMAgent
        await this.agentRepo.addDesignatedAgent(this.designatedAgent)
        .catch(err => {throw Error(`Could not insert designated agent in db. Error message: ${err}`)})
    }

    private async handleSendWithReturn(res, fun, params, errMsg: string) {
        await fun(params)
        .then(data => { return res.send(data) })
        .catch(error => { return res.status(400).send({ error: errMsg, msg: error }) })
    }

}