import { AgentRepo } from "../repositories/agentRepository"
import { LocationRepo } from "../repositories/locationRepository"
import { TransportRepo } from "../repositories/transportRepository"
import { ResourceTypeRepo } from "../repositories/resourceRepository"

import { Location } from "../classes/location"
import { Resources } from "../classes/resource"
import { Transport } from "../classes/transport"
import { ResourceType } from "../classes/resourceType"
import { ResourceManager } from "../classes/resourceManager"

import { uid, Resource, TransportDB } from "../types"

export class TransportService {
    agentRepo : AgentRepo
    locationRepo : LocationRepo
    transportRepo : TransportRepo
    resourceTypeRepo : ResourceTypeRepo
    
    resourceManager : ResourceManager
    designatedLocation : Location

    constructor(rm : ResourceManager, ar : AgentRepo, tpr : TransportRepo, lr : LocationRepo, rtr : ResourceTypeRepo) {
        this.resourceManager = rm
        this.agentRepo = ar
        this.locationRepo = lr
        this.transportRepo = tpr
        this.resourceTypeRepo = rtr
    }

    async selectTransport(req, res) {
        const { id } = req.params
        await this.transportRepo.selectTransportById(id)
        .then(data => { return res.send(data) })
        .catch(err => { return res.status(400).send({error: "Error getting transport", msg: err}) })
    }

    async selectTransportsByAgent(req, res) {
        const { id } = req.params
        await this.transportRepo.selectTransportsByAgent(id)
        .then(data => { return res.send(data) })
        .catch(err => { return res.status(400).send({error: "Error getting transport", msg: err}) })
    }

    async selectTransports(res) {
        await this.transportRepo.selectTransports()
        .then(data => { return res.send(data) })
        .catch(err => { return res.status(400).send({error: "Error getting transports", msg: err}) })
    }

    /* Input format:
     * { agent: uid,
     *   location_start: uid | "INIT", -- "INIT" is for when the resources have no location yet, and they need to get one
     *   destination: uid,
     *   resources: [{ type: uid, amount: number}] } */
    async insertTransport(req, res) {
        let { agent, location_start, destination, resources, distance } = req.body
        
        const a = await this.agentRepo.selectAgentById(agent)
            .catch(err => { return res.status(400).send({error: `The agent with id: ${agent} does not exist`, msg: err}) })

        let l1 : Location
        if (location_start === "INIT") {
            await this.insertDesignatedLocation(res)
            l1 = this.designatedLocation
            location_start = this.designatedLocation.id
        } else {
            l1 = await this.locationRepo.selectLocationById(location_start)
            .catch(err => { return res.status(400).send({error: `LocationStart with id: ${location_start} does not exist`, msg: err}) })
        }

        const l2 = await this.locationRepo.selectLocationById(destination)
            .catch(err => { return res.status(400).send({error: `destination location with id: ${destination} does not exist`, msg: err}) })

        let resourcesM : Map<ResourceType,Resource> = new Map() // for resource vector
        let transportDB : TransportDB[] = [] // for db
        let transportId : uid
        let time : Date
        await Promise.all( resources.map(async r => {
            let resource = Number(r.amount)
            let resourceType : ResourceType =
                await this.resourceTypeRepo.selectResourceTypeById(r.type)
                .catch(err => { return res.status(400).send({ error: `The resource type with id: ${r.type} does not exist`, msg: err }) })

            resourcesM.set(resourceType, resource)

            if (transportDB.length === 0) {
                // Only need to update transportId and time once; the first time data is pushed to transportDB
                transportDB.push(new TransportDB(agent, location_start, destination, r.type, resource, distance))
                transportId = transportDB[0].id
                time = transportDB[0].time_of_effect
            }
            else {
                transportDB.push(new TransportDB(agent, location_start, destination, r.type, resource, distance, transportId, time, ))
            }
        }))

        const resources_ = new Resources(resourcesM)

        let agentOwnsResources = this.resourceManager.actorCanBeInEvent(a, resources_, this.resourceManager.ownership)
        if (agentOwnsResources) {
            const transport = new Transport(new Map<Location, Resources>([
                [l1, Resources.mult(-1, resources_)],
                [l2, resources_]
            ]))
            const validTransport = this.resourceManager.applyTransport(transport)
            if (validTransport) {
                // build data about resources locations for database
                let newResourceLocations = []
                transportDB.forEach( tdb => {
                    let updateResLocs = this.getResourceLocationFromLocationState(location_start, destination, tdb)
                    newResourceLocations.push({location_id: location_start, resource_type: tdb.resource_type, amount: Number(updateResLocs.get(location_start))})
                    newResourceLocations.push({location_id: destination, resource_type: tdb.resource_type, amount: Number(updateResLocs.get(destination))})
                })
                await this.transportRepo.addTransport(transportDB, newResourceLocations)
                    .then(data => { return res.send(data) })
                    .catch(err => { return res.status(400).send({ error: "Error storing transport in db", msg: err }) })
                }
            else { return res.status(400).send({ error: "The transport is not valid (service)."}) }
        } else { return res.status(400).send({ error: "The agent does not own the resources and cannot transport them"})}
    }

    private async insertDesignatedLocation(res) {
        this.designatedLocation = this.resourceManager.getDesignatedLocation
        return await this.locationRepo.addDesignatedLocation(this.designatedLocation)
        .catch(err => { res.status(400).send({error: err}) } )
    }

   private getResourceLocationFromLocationState(location_start, destination, transport : TransportDB) : Map<uid, number> {
        const locationState = this.resourceManager.LocationState
        let M = new Map<uid, Resource>
        for (let [l, rs] of locationState.entries()) {
            if (l.id === location_start || l.id === destination) {
                rs.forEach((resource, resourceType) => {
                    if (resourceType.id == transport.resource_type) {
                        M.set(l.id, Number(resource))
                    }
                })
            }
        }
        return M
    }

}