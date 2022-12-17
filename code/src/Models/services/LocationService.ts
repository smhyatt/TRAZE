import { Location } from "../classes/location";
import { LocationRepo } from "../repositories/locationRepository";
import { ResourceManager } from "../classes/resourceManager";

export class LocationService {
    locationRepo : LocationRepo
    resourceManager : ResourceManager

    constructor(rm : ResourceManager, lr : LocationRepo) { 
        this.resourceManager = rm
        this.locationRepo = lr 
    }
    
    async selectLocation(req, res) {
        const { id } = req.params
        await this.locationRepo.selectLocationById(id)
        .then(data => { return res.send(data) })
        .catch(err => { return res.status(400).send({error: "Error getting location", msg: err}) })
    }

    async selectLocations(res) {
        await this.locationRepo.selectLocations()
        .then(data => { return res.send(data)})
        .catch(err => { return res.status(400).send({error: "Error getting locations", msg: err}) })
    }

    async selectLocationStates(res) {
        await this.locationRepo.selectLocationStates()
        .then(data => { return res.send(data) })
        .catch(err => { return res.status(400).send({error: "Error getting location state", msg: err}) })
    }

    async insertLocation(req, res) {
        const { name, coordinates } = req.body
        const location : Location = new Location(name, coordinates)
        this.resourceManager.addLocation(location)
        await this.locationRepo.addLocation(location)
        .then(data => { return res.send(data) })
        .catch(err => { return res.status(400).send({error: "Error inserting location in database", msg: err}) })
    }
}