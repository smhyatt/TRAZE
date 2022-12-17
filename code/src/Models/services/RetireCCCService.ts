import { AgentRepo } from "../repositories/agentRepository";
import { RetireCCCRepo } from "../repositories/retireCCCRepository";
import { ResourceTypeRepo } from "../repositories/resourceRepository";
import { CarbonCreditCertificateRepo } from "../repositories/carbonCreditCertificateRepository";

import { Agent } from "../classes/agent";
import { Transfer } from "../classes/transfer";
import { Resources } from "../classes/resource";
import { ResourceType } from "../classes/resourceType";
import { ResourceManager } from "../classes/resourceManager";
const { v4: uuidv4 } = require('uuid')

export class RetireCCCService {
    retireCCCRepo : RetireCCCRepo
    agentRepo : AgentRepo
    resourceTypeRepo : ResourceTypeRepo
    carbonCreditCertificateRepo : CarbonCreditCertificateRepo
    atmosphere : Agent
    resourceManager : ResourceManager

    constructor(rm : ResourceManager, rcccr : RetireCCCRepo, ar : AgentRepo, rtr : ResourceTypeRepo, cccr : CarbonCreditCertificateRepo) {
        this.resourceManager = rm
        this.retireCCCRepo = rcccr
        this.agentRepo = ar
        this.resourceTypeRepo = rtr
        this.carbonCreditCertificateRepo = cccr
    }
    
    async selectRetiredCCC(req, res) {
        const { id } = req.params
        await this.retireCCCRepo.selectRetiredById(id)
        .then(data => { return res.send(data) })
        .catch(err => { return res.status(400).send({error: "Error getting transport", msg: err}) })
    }

    async selectRetiredCCCs(res) {
        await this.retireCCCRepo.selectAllRetired()
        .then(data => { return res.send(data) })
        .catch(err => { return res.status(400).send({error: "Error getting retire transfers", msg: err}) })
    }

    private async insertAtmosphere() {
        this.atmosphere = this.resourceManager.Atmosphere
        await this.agentRepo.addDesignatedAgent(this.atmosphere)
        .catch(err => {throw Error(`Could not insert atmosphere agent in db. Error message: ${err}`)})
    }

    async insertRetireCCC(req, res) {
        const { transferor, carbon_credit_certificate, amount } = req.body
        
        await this.insertAtmosphere()
        const agent = await this.agentRepo.selectAgentById(transferor)
            .catch(err => { return res.status(400).send({error: `The agent with id: ${transferor} does not exist`, msg: err}) })

        const ccc = await this.carbonCreditCertificateRepo.selectCarbonCreditCertificateById(carbon_credit_certificate)
            .catch(err => { return res.status(400).send({error: "Error getting carbon credit certificate", msg: err}) })
        let resourceType : ResourceType = await this.resourceTypeRepo.selectResourceTypeById(carbon_credit_certificate)
            .catch(err => { return res.status(400).send({ error: `The resource type with id: ${carbon_credit_certificate} does not exist`, msg: err }) })

        const resource = new Resources(new Map([[resourceType, amount]]))
        const transfer = new Transfer(new Map([
            [this.atmosphere, resource],
            [agent, Resources.mult(-1, resource)]
        ]))

        const validTransfer = this.resourceManager.applyTransfer(transfer)
        if (validTransfer) {
            let ownershipRows = [
                { agent: transferor, type: carbon_credit_certificate, amount: Number(this.resourceManager.ownership.get(agent).get(ccc)) },
                { agent: this.atmosphere.id, type: carbon_credit_certificate, amount: Number(this.resourceManager.ownership.get(this.atmosphere).get(ccc)) }
            ]
            let retireRow = [{id: uuidv4(), transferor: transferor, type: carbon_credit_certificate, amount:Number(amount), time_of_effect: new Date()}]
            await this.retireCCCRepo.addRetireTransfer(retireRow, ownershipRows)
                .then(data => { return res.send(data) })
                .catch(err => { return res.status(400).send({ error: "Error storing retire transfer in db", msg: err }) })
        }
        else { return res.status(400).send({ error: "The retirement of the carbon credit certificate by transfer to the atmosphere is not valid (service)."}) }
    }
    
}