import { ResourceTypeRepo } from "../repositories/resourceRepository"
import { ResourceType } from "../classes/resourceType"

export class ResourceTypeService {
    resourceTypeRepo : ResourceTypeRepo
    
    constructor(rtr : ResourceTypeRepo) { this.resourceTypeRepo = rtr }

    async selectResourceTypes(res) {
        await this.resourceTypeRepo.selectResourceTypes()
        .then(rts => { return res.send(rts) })
        .catch(error => {return res.status(400).send({ error: "Error selecting resource types.", msg: error }) })
    }

    async selectResourceTypeById(req, res) {
        const { id } = req.params
        await this.resourceTypeRepo.selectResourceTypeById(id)
        .then(rts => { return res.send(rts) })
        .catch(error => {return res.status(400).send({ error: "Error selecting resource types.", msg: error }) })
    }

    async insertResourceTypes(req, res) {
        const { rtypes } = req.body

        const rtypeArr = []
        rtypes.forEach(rtype => {
            rtypeArr.push(new ResourceType(rtype.name, rtype.valuation))
        })
        await this.resourceTypeRepo.addResourceType(rtypeArr)
        .then(rt => { return res.send(rt) })
        .catch(error => { return res.status(400).send({error: "Error inserting resource type.", msg: error}) })
    }

}