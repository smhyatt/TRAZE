const exactMath = require('exact-math') // Computing with floating points accurately
import { Ownership } from "./ownership"
import { Transfer } from "./transfer"
import { Resources } from "./resource"
import { ResourceType } from "./resourceType"
import { Transformation } from "./transformation"
import { Agent } from "./agent"
import { Location } from "./location"
import { Transport } from "./transport"
import { IActor } from "../interfaces/IActor"
import { uid } from "../types"

export class ResourceManager extends Agent {
    // The states are implemented as zero-balance ownership states
    private ownershipState : Transfer
    private locationState : Transport
    // Designated agents
    // The following two agents enables zero-balance ownership states
    private rmAgent = new Agent(this.name, this.type, this.id, this.key)
    private designatedLocation = new Location("designated", { longitude: -1, latitude: -1 })
    // Atmosphere is the special agent that carbon credits retire to
    private atmosphere = new Agent("Atmosphere", "Atmosphere")
    //private creditLimit : CreditLimit // Everybody has 0 as credit limit

    constructor(name: string, M? : Map<Agent, Resources>) {
        super(name, "resource manager", '11111111-2222-3333-4444-555555555555') // ! Not a secure solution  ¯\_(ツ)_/¯
        if (M === undefined) {
            this.ownershipState = Transfer.add(Transfer.zero(), new Transfer(new Map([[this.atmosphere, Resources.zero()]]))) 
        }
        else {
            M.forEach( (resources: Resources, agent: Agent) => {
                this.addAgent(agent, resources)
            })
        }
        this.locationState = Transport.add(Transport.zero(), new Transport(new Map([[this.designatedLocation, Resources.zero()]])))
    }

    public get getDesignatedLocation() : Location { return this.designatedLocation }
    public get getRMAgent() : Agent { return this.rmAgent }
    public get ownership() : Transfer { return this.ownershipState }
    public get LocationState() : Transport { return this.locationState }
    public get Atmosphere() : Agent { return this.atmosphere }

    applyTransport(transport : Transport) : boolean {
        // Check the resources to be transported are located where the transport deems
        for (let [location, resources] of transport.entries()) {
            if (location.id !== this.designatedLocation.id
                && !this.actorCanBeInEvent(location, resources, this.locationState)) { 
                return false
            }
        }
        this.locationState = Ownership.add(this.locationState, transport)
        return true
    }

    // * By creating the Transfer object, it is ensured that the transfer respects the
    // * invariant because checkSumTotalIsZero is called from the Transfer constructor.
    applyTransfer(transfer : Transfer) : boolean {
        // * Ensure the agents and resources respect the requirements for the transfer.
        for (let [agent, resources] of transfer.entries()) {
            if (agent.id !== this.id && !this.actorCanBeInEvent(agent, resources, this.ownershipState)) { 
                return false
            }
        }
        this.ownershipState = Transfer.add(this.ownershipState, transfer)
        return true
    }

    applyTransformation(agent : Agent, location : Location | boolean, transformation : Transformation) {
        // * Update the ownershipstate with the transformation.
        let ownershipM : Map<Agent,Resources> = new Map()
        ownershipM.set(agent, transformation)
        ownershipM.set(this.getRMAgent, Resources.mult(-1, transformation)) // * RM update
        this.ownershipState = Transfer.add(this.ownershipState, new Transfer(ownershipM))

        // * Update the locationstate with the transformation if locations exist in the transformation.
        if (typeof location != "boolean") { // * There are locations involved.
            let locationM : Map<Location,Resources> = new Map()
            locationM.set(location, transformation)
            locationM.set(this.getDesignatedLocation, Resources.mult(-1, transformation)) // * RM update
            this.locationState = Transport.add(this.locationState, new Transport(locationM))
        }
    }

    actorCanBeInEvent(actor : IActor, resources : Resources, state) : boolean {
        if (!state.has(actor)) { return false }
        
        // Ensure the actor can transfer or transport the resources
        for (let [resourceType, amount] of resources.entries()) {
            if (amount < 0) { // The agent is transferring this amount
                 if (!this.actorOwnsResource(state, actor, resourceType, amount)) {
                    return false
                 }
            }
        }
        return true
    }

    actorCanTransform(actor : IActor, resources : Resources, state) : boolean {
        if (!state.has(actor)) {
            console.log(`${actor.name} is not a valid actor.`, actor.id)
            return false
        }
        
        // Ensure the actor can transform the resources
        for (let [resourceType, amount] of resources.entries()) {
            if (!this.actorOwnsResource(state, actor, resourceType, amount)) {
                return false
            }
        }
        return true
    }

    // * The credit limit is currently 0 for all resources, but should be seperate limits for each agent and resource
    // If actor is of type Location the creditlimit must be 0, because they cannot transport resources that are not at a location
    actorOwnsResource(state : Ownership, actor : IActor, resourceType : ResourceType, amount : number, creditlimit : number = 0) : boolean {
        const agentsResources : Resources = state.get(actor)
        if (agentsResources != null) {
            const r = agentsResources.get(resourceType)
            if (r != null) {
                // If the credit limit is negative, the agent can transfer more resources than availabe
                return (r >= Math.abs(exactMath.add(amount, creditlimit)) ? true : false)
            } else { return false }
        } 
        else {
            console.log("The actor doesn't own the needed resource")
            return false
        }
    }

    // Only for testing of resource manager class
    addAgent(agent : Agent, resources? : Resources) : boolean {
        if (this.ownershipState.has(agent)){ return false }

        // * Handle resources and ownership
        if (resources === undefined) {
            const agentOwnership = new Transfer(new Map([[agent, Resources.zero()]]))
            this.ownershipState = Transfer.add(this.ownershipState, agentOwnership)
        } else {
            let balance = 
                new Transfer(new Map<Agent, Resources>([ 
                    [agent, resources], 
                    [this, Resources.mult(-1, resources)] 
                ]))
            this.ownershipState = Transfer.add(this.ownershipState, balance)
        }
        return true
    }

    // Only an owner can add resources to a location
    addLocation(location : Location, owner? : Agent, resources? : Resources) : boolean {
        if (this.locationState.has(location)) { return false }

        if (resources === undefined) {
            const locationZeroResources = new Transport(new Map([[location, Resources.zero()]]))
            this.locationState = Transport.add(this.locationState, locationZeroResources)
        }
        else if (owner === undefined) {
            console.log("Error. An owner of the resources is missing.") 
            return false
        }
        else {
            if(!this.actorCanBeInEvent(owner, resources, this.ownershipState)) {
                return false
            }
            let balance =
                new Transport(new Map<Location, Resources>([
                        [location, resources],
                        [this.designatedLocation, Resources.mult(-1, resources)]
                    ])
                )
            this.locationState = Transport.add(this.locationState, balance)
        }
        return true
    }

    getAmountOfTypeFromState(actor : uid, type : uid, state : Ownership) : number {
        for (let [a, rs] of state.entries()) {
            if (a.id === actor) {
                for (let [rt, r] of rs.entries()) {
                    if (rt.id === type) {
                        return r
                    }
                } 
                break
            }
        }
    }

    print() {
        console.log("\n#########################\n## The ownership state ##\n#########################")
        this.ownershipState.print() 
        console.log("\n########################\n## The location state ##\n########################")
        this.locationState.print()
        console.log("")
    }
    
 /*async loadData(ownershipRepo : ownershipRepo, agentRepo : agentRepo, resourceRepo : resourceRepo) {
        this.ownershipRepo = ownershipRepo
        this.agentRepo = agentRepo
        this.resourceRepo = resourceRepo
        await this.loadOwnership()
    }

    private async loadOwnership() {
        try {
            const ownership = await this.ownershipRepo.selectOwnerships()
            if (ownership.length === 0) { return }

            let bankDebt : Resources = Resources.zero()
            let M : Map<Agent, Resources> = new Map()

            for (let elm of ownership) {
                const a : Agent = await this.agentRepo.selectAgentById(elm.agent)
                const r : Resource = Number(elm.amount)
                const rType : ResourceType = await this.resourceRepo.selectResourceTypeById(elm.type)
                const resources = new Resources( new Map<ResourceType, Resource>([[rType.id, r]]) )
                M.set(a, resources)
            
                bankDebt = Resources.add(bankDebt, Resources.mult(-1, resources))
            }

            M.set(this, bankDebt)

            try { this.ownershipState = new Transfer(M) }
            catch (error) {
                console.log(`Error loading ownerships: ${error}`)
                this.ownershipState = Transfer.zero()
            }
            return ownership
        } catch (error) { throw new Error(`Error loading ownerships from database : ${error}`) }
    } */
}
