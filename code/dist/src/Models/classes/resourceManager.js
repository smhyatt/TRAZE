"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceManager = void 0;
const exactMath = require('exact-math'); // Computing with floating points accurately
const ownership_1 = require("./ownership");
const transfer_1 = require("./transfer");
const resource_1 = require("./resource");
const agent_1 = require("./agent");
const location_1 = require("./location");
const transport_1 = require("./transport");
class ResourceManager extends agent_1.Agent {
    //private creditLimit : CreditLimit // Everybody has 0 as credit limit
    constructor(name, M) {
        super(name, "resource manager", '11111111-2222-3333-4444-555555555555'); // ! Not a secure solution  ¯\_(ツ)_/¯
        // The states are implemented as zero-balance ownership states
        Object.defineProperty(this, "ownershipState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "locationState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // Designated agents
        // The following two agents enables zero-balance ownership states
        Object.defineProperty(this, "rmAgent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new agent_1.Agent(this.name, this.type, this.id, this.key)
        });
        Object.defineProperty(this, "designatedLocation", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new location_1.Location("designated", { longitude: -1, latitude: -1 })
        });
        // Atmosphere is the special agent that carbon credits retire to
        Object.defineProperty(this, "atmosphere", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new agent_1.Agent("Atmosphere", "Atmosphere")
        });
        if (M === undefined) {
            this.ownershipState = transfer_1.Transfer.add(transfer_1.Transfer.zero(), new transfer_1.Transfer(new Map([[this.atmosphere, resource_1.Resources.zero()]])));
        }
        else {
            M.forEach((resources, agent) => {
                this.addAgent(agent, resources);
            });
        }
        this.locationState = transport_1.Transport.add(transport_1.Transport.zero(), new transport_1.Transport(new Map([[this.designatedLocation, resource_1.Resources.zero()]])));
    }
    get getDesignatedLocation() { return this.designatedLocation; }
    get getRMAgent() { return this.rmAgent; }
    get ownership() { return this.ownershipState; }
    get LocationState() { return this.locationState; }
    get Atmosphere() { return this.atmosphere; }
    applyTransport(transport) {
        // Check the resources to be transported are located where the transport deems
        for (let [location, resources] of transport.entries()) {
            if (location.id !== this.designatedLocation.id
                && !this.actorCanBeInEvent(location, resources, this.locationState)) {
                return false;
            }
        }
        this.locationState = ownership_1.Ownership.add(this.locationState, transport);
        return true;
    }
    // * By creating the Transfer object, it is ensured that the transfer respects the
    // * invariant because checkSumTotalIsZero is called from the Transfer constructor.
    applyTransfer(transfer) {
        // * Ensure the agents and resources respect the requirements for the transfer.
        for (let [agent, resources] of transfer.entries()) {
            if (agent.id !== this.id && !this.actorCanBeInEvent(agent, resources, this.ownershipState)) {
                return false;
            }
        }
        this.ownershipState = transfer_1.Transfer.add(this.ownershipState, transfer);
        return true;
    }
    applyTransformation(agent, location, transformation) {
        // * Update the ownershipstate with the transformation.
        let ownershipM = new Map();
        ownershipM.set(agent, transformation);
        ownershipM.set(this.getRMAgent, resource_1.Resources.mult(-1, transformation)); // * RM update
        this.ownershipState = transfer_1.Transfer.add(this.ownershipState, new transfer_1.Transfer(ownershipM));
        // * Update the locationstate with the transformation if locations exist in the transformation.
        if (typeof location != "boolean") { // * There are locations involved.
            let locationM = new Map();
            locationM.set(location, transformation);
            locationM.set(this.getDesignatedLocation, resource_1.Resources.mult(-1, transformation)); // * RM update
            this.locationState = transport_1.Transport.add(this.locationState, new transport_1.Transport(locationM));
        }
    }
    actorCanBeInEvent(actor, resources, state) {
        if (!state.has(actor)) {
            return false;
        }
        // Ensure the actor can transfer or transport the resources
        for (let [resourceType, amount] of resources.entries()) {
            if (amount < 0) { // The agent is transferring this amount
                if (!this.actorOwnsResource(state, actor, resourceType, amount)) {
                    return false;
                }
            }
        }
        return true;
    }
    actorCanTransform(actor, resources, state) {
        if (!state.has(actor)) {
            console.log(`${actor.name} is not a valid actor.`, actor.id);
            return false;
        }
        // Ensure the actor can transform the resources
        for (let [resourceType, amount] of resources.entries()) {
            if (!this.actorOwnsResource(state, actor, resourceType, amount)) {
                return false;
            }
        }
        return true;
    }
    // * The credit limit is currently 0 for all resources, but should be seperate limits for each agent and resource
    // If actor is of type Location the creditlimit must be 0, because they cannot transport resources that are not at a location
    actorOwnsResource(state, actor, resourceType, amount, creditlimit = 0) {
        const agentsResources = state.get(actor);
        if (agentsResources != null) {
            const r = agentsResources.get(resourceType);
            if (r != null) {
                // If the credit limit is negative, the agent can transfer more resources than availabe
                return (r >= Math.abs(exactMath.add(amount, creditlimit)) ? true : false);
            }
            else {
                return false;
            }
        }
        else {
            console.log("The actor doesn't own the needed resource");
            return false;
        }
    }
    // Only for testing of resource manager class
    addAgent(agent, resources) {
        if (this.ownershipState.has(agent)) {
            return false;
        }
        // * Handle resources and ownership
        if (resources === undefined) {
            const agentOwnership = new transfer_1.Transfer(new Map([[agent, resource_1.Resources.zero()]]));
            this.ownershipState = transfer_1.Transfer.add(this.ownershipState, agentOwnership);
        }
        else {
            let balance = new transfer_1.Transfer(new Map([
                [agent, resources],
                [this, resource_1.Resources.mult(-1, resources)]
            ]));
            this.ownershipState = transfer_1.Transfer.add(this.ownershipState, balance);
        }
        return true;
    }
    // Only an owner can add resources to a location
    addLocation(location, owner, resources) {
        if (this.locationState.has(location)) {
            return false;
        }
        if (resources === undefined) {
            const locationZeroResources = new transport_1.Transport(new Map([[location, resource_1.Resources.zero()]]));
            this.locationState = transport_1.Transport.add(this.locationState, locationZeroResources);
        }
        else if (owner === undefined) {
            console.log("Error. An owner of the resources is missing.");
            return false;
        }
        else {
            if (!this.actorCanBeInEvent(owner, resources, this.ownershipState)) {
                return false;
            }
            let balance = new transport_1.Transport(new Map([
                [location, resources],
                [this.designatedLocation, resource_1.Resources.mult(-1, resources)]
            ]));
            this.locationState = transport_1.Transport.add(this.locationState, balance);
        }
        return true;
    }
    getAmountOfTypeFromState(actor, type, state) {
        for (let [a, rs] of state.entries()) {
            if (a.id === actor) {
                for (let [rt, r] of rs.entries()) {
                    if (rt.id === type) {
                        return r;
                    }
                }
                break;
            }
        }
    }
    print() {
        console.log("\n#########################\n## The ownership state ##\n#########################");
        this.ownershipState.print();
        console.log("\n########################\n## The location state ##\n########################");
        this.locationState.print();
        console.log("");
    }
}
exports.ResourceManager = ResourceManager;
//# sourceMappingURL=resourceManager.js.map