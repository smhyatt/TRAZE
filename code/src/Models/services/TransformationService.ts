import { AgentRepo } from "../repositories/agentRepository";
import { TransportRepo } from "../repositories/transportRepository";
import { ResourceTypeRepo } from "../repositories/resourceRepository";
import { LocationRepo } from "../repositories/locationRepository";
import { TransformationRepo } from "../repositories/transformationRepository";

import { Resources } from "../classes/resource";
import { ResourceType } from "../classes/resourceType";
import { Transformation } from "../classes/transformation";
import { ResourceManager } from "../classes/resourceManager";

import { Resource, uid, OwnershipDB, LocationDB, TransformationDB, TransformationOutputDB, TransformationInputDB } from "../types";

export class TransformationService {
    agentRepo : AgentRepo
    resourceTypeRepo : ResourceTypeRepo
    transformationRepo : TransformationRepo
    transportRepo : TransportRepo
    locationRepo : LocationRepo
    resourceManager : ResourceManager

    constructor(rm : ResourceManager, ar : AgentRepo, rtr : ResourceTypeRepo, trr : TransformationRepo, tpr : TransportRepo, lsr : LocationRepo) {
        this.resourceManager = rm
        this.agentRepo = ar
        this.resourceTypeRepo = rtr
        this.transformationRepo = trr
        this.transportRepo = tpr
        this.locationRepo = lsr
    }

    async selectTransformation(req, res) {
        const { id } = req.params
        this.handleSendWithReturn(res, this.transformationRepo.selectTransformationById, id, "Transformation not found.")
    }

    async selectTransformationByOwner(req, res) {
        const { id } = req.params
        this.handleSendWithReturn(res, this.transformationRepo.selectTransformationsByOwner, id, "Transformation not found")
    }

    async selectTransformations(res) {
        await this.transformationRepo.selectTransformations()
        .then(data => { return res.send(data) })
        .catch(error => { return res.status(400).send({ error: "Error getting transformations from database", msg: error }) })
    }

    async selectTransformationInput(req, res) {
        const { id } = req.params
        this.handleSendWithReturn(res, this.transformationRepo.selectTransformationInputById, id, "Transformation Input not found.")
    }

    async selectTransformationOutput(req, res) {
        const { id } = req.params
        this.handleSendWithReturn(res, this.transformationRepo.selectTransformationOutputById, id, "Transformation Output not found.")
    }

    async insertTransformation(req, res) {
        const { agent, location, inputResources, outputResources, info } = req.body

        // * Ensure the agent exists and fetch from database
        const owner = await this.agentRepo.selectAgentById(agent)
            .catch(err => { return res.status(400).send({error: `The agent with id: ${agent} does not exist`, msg: err}) })

        let locationO
        let resourcesAtLocation
        if (location != undefined) {
            locationO = await this.locationRepo.selectLocationById(location)
                .catch(err => { return res.status(400).send({error: `LocationStart with id: ${location} does not exist`, msg: err}) })
            resourcesAtLocation = this.resourceManager.LocationState.get(locationO)
        }

        // * Ensure the resource types to input exists and retrieve from database
        let resourcesMIn : Map<ResourceType,Resource> = new Map()
        await Promise.all( inputResources.map(async r => { 
            const type : ResourceType = await this.resourceTypeRepo.selectResourceTypeById(r.type)
                .catch(err => { return res.status(400).send({ error: `The resource type with id: ${r.type} does not exist`, msg: err }) })
            resourcesMIn.set(type, r.amount)
            
            // Get resource at specific location
            if (resourcesAtLocation != undefined) {
                const resource = resourcesAtLocation.get({id:r.type})
                if (resource == null) {
                    return res.status(400).send({ error: 'A transformation can only occur for resources with the same location.' })
                }
            }
        }))
        const resourcesIn = new Resources(resourcesMIn)
        const locationExist = location != undefined ? locationO : false

        // * Ensure the resource types to input exists and retrieve from database
        let resourcesMOut : Map<ResourceType,Resource> = new Map()
        await Promise.all( outputResources.map(async r => { 
            const type : ResourceType = await this.resourceTypeRepo.selectResourceTypeById(r.type)
                .catch(err => { return res.status(400).send({ error: `The resource type with id: ${r.type} does not exist`, msg: err }) })
            resourcesMOut.set(type, r.amount)
        }))
        const resourcesOut = new Resources(resourcesMOut)

        // * Ensure the agent owns the needed input resources using the resource manager
        let agentOwnsResources = this.resourceManager.actorCanTransform(owner, resourcesIn, this.resourceManager.ownership)
        
        if (agentOwnsResources) {
            // * Ensures that the sum total of the input and output is zero
            const transformation = new Transformation(
                Resources.add(Resources.mult(-1, resourcesIn),
                resourcesOut
            ))
            
            // * Update the ownershipstate in the resource manager
            this.resourceManager.applyTransformation(owner, locationExist, transformation)

            // * Create and insert the transformation, inputs and outputs, and update ownerships to the database.
            const transformationDB = new TransformationDB(agent, info)
            const transformationInputDB : TransformationInputDB[] = this.transformationInputAndOutput(transformationDB.id, resourcesMIn)
            const transformationOutputDB : TransformationOutputDB[] = this.transformationInputAndOutput(transformationDB.id, resourcesMOut)

            // * If locations exist, create the data to update the database.
            let locationDB = []
            if (location != undefined) {
                locationDB = this.getStateFromTransformation([location, this.resourceManager.getDesignatedLocation.id], 
                                                              transformation, this.resourceManager.LocationState, 'location')
            }
            // * Gets the updated ownership details for both the agent and the resource manager
            const ownershipDB = this.getStateFromTransformation([agent, this.resourceManager.id], transformation,
                                                                 this.resourceManager.ownership, 'ownership')
            const send = { transformationDB, transformationInputDB, transformationOutputDB, ownershipDB, locationDB }
            this.handleSendWithReturn(res, this.transformationRepo.addTransformation, send, "Error storing transformation.")
        } else { return res.status(400).send({ error: "The agent does not own the resources and cannot transform them."})}
    }

    // * Retrieve the current ownership or location state for a given actor after a transformation is performed
    private getStateFromTransformation([actor, rm], transformation, state, stateType) : Array<LocationDB> | Array<OwnershipDB> {
        const res = []
        transformation.forEach((_r, rt) => {
            // * Extracting the amount from the updated ownershipstate.
            const actorAmount = this.resourceManager.getAmountOfTypeFromState(actor, rt.id, state)
            const RMAmount = this.resourceManager.getAmountOfTypeFromState(rm, rt.id, state)
            // ! OBS. it currently stores ownerships even if the amount is 0
            if (stateType === 'ownership') {
                res.push({ agent : actor, type : rt.id, amount : Number(actorAmount)})
                res.push({ agent : rm, type : rt.id, amount : Number(RMAmount)})
            } else {
                res.push({ location_id : actor, resource_type : rt.id, amount : Number(actorAmount)})
                res.push({ location_id : rm, resource_type : rt.id, amount : Number(RMAmount)})
            }
        })
        return res
    }

    private transformationInputAndOutput(transformationId : uid, updates : Map<ResourceType, Resource>) 
            : TransformationOutputDB[] | TransformationInputDB[] {
        const res = []
        updates.forEach((r, rt) => {
            res.push({transformation: transformationId, type: rt.id, amount: r})
        })
        return res
    }

    private async handleSendWithReturn(res, fun, params, errMsg: string) {
        await fun(params)
        .then(data => { return res.send(data) })
        .catch(error => { return res.status(400).send({ error: errMsg, msg: error }) })
    }

}