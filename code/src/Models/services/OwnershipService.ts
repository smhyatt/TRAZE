import { OwnershipRepo } from "../repositories/ownershipRepository"

export class OwnershipService {
    ownershipRepo : OwnershipRepo
    constructor(or : OwnershipRepo) { this.ownershipRepo = or }

    async selectOwnerships(res) {
        await this.ownershipRepo.selectOwnerships()
        .then(data => { return res.send(data) })
        .catch(error => { return res.status(400).send({error: "Error getting ownerships from db", msg: error})} )
    }

    async getOwnershipstate(res) {
        await this.ownershipRepo.getOwnershipstate()
        .then(data => { return res.send(data) })
        .catch(error => { return res.status(400).send({error: "Error getting ownerships from db", msg: error})} )
    }
}