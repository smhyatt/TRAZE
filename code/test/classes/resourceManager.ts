process.env.NODE_ENV = 'test'
import 'mocha'
import 'chai-http'
import * as chai from 'chai'
chai.use(require('chai-http'))
const { expect } = chai
const { resetSchema, schema } = require('../../src/Models/database/queries')
import { db } from '../../src/Models/database/instance'
import { ResourceManager } from '../../src/Models/classes/resourceManager'
import { ResourceType } from '../../src/Models/classes/resourceType'
import { Resources } from '../../src/Models/classes/resource'
import { Transport } from '../../src/Models/classes/transport'
import { Resource } from "../../src/Models/types"
import { Transfer } from '../../src/Models/classes/transfer'
import { Location } from '../../src/Models/classes/location'
import { Agent } from '../../src/Models/classes/agent'


const diku = new Location("DIKU", { latitude: 42, longitude:42 } )
const hcoe = new Location("hcø", {longitude: 2, latitude: 2})
const agent = new Agent("Alice", "Farmer grl")
const rtype = new ResourceType("USD", 1)
const resource = 500
const resources = new Resources(new Map([[rtype, resource]]))

describe('ResourceManager class tests', () => {
    before(() => db.none(resetSchema))
    before(() => db.none(schema))

    it('Add agent with zero resources', async () => {
        // Setup
        const rm = new ResourceManager("rm")
        // Act
        const res = rm.addAgent(agent)
        // Assert
        expect(res).to.be.true
    })

    it('Do not add agent to resource manager if another agent with the id is present', () => {
        // Setup
        const rm = new ResourceManager("rm")
        const agent2 : Agent = { 
            id: agent.id,
            name: "cami",
            type: "normal",
            key: "some key"
        }
        rm.addAgent(agent)
        // Act
        const agentIsAdded = rm.addAgent(agent2)
        // Assert
        expect(agentIsAdded).to.be.false
    })

    it('Add multiple resources with same resource type', async () => {
        const rm = new ResourceManager("rm")
        const agent : Agent = new Agent("Superman", "Alien")

        const rtype1 : ResourceType = new ResourceType("Broccoli", 20)
        const rtype2 : ResourceType = new ResourceType("Kryptonite", 1)

        // * Creating resources where some use the same type. 
        const r1 : Resource = 5
        const r2 : Resource = 2 
        const r3 : Resource = 10

        const rs1 = new Resources( new Map<ResourceType, Resource>( [[rtype1, r1], [rtype2, r2]] ) )
        const rs2 = Resources.add(rs1, new Resources(new Map<ResourceType, Resource>( [[rtype1, r3]] )) )

        const agentIsAdded = rm.addAgent(agent, rs2)
        expect(agentIsAdded).to.be.true

        // * The ownershipstate should contain the resourcetype once with the amounts summed. 
        const resources = rm.ownership.get(agent)
        expect(resources.get(rtype1)).to.equal(15)
    })

    // * We have not implemented this yet
    /*it('Remove resources from the ownership state if the amount is 0', async () => {
        const rm = new ResourceManager("rm")
        const agent : Agent = new Agent("Batman", "Vigilante")

        const rtype1 : ResourceType = new ResourceType("USD", 1)
        const rtype2 : ResourceType = new ResourceType("bats", 20)

        const r1 : Resource = initResource(5000, rtype1.id)
        const r2 : Resource = initResource(200, rtype2.id)
        const r3 : Resource = initResource(-5000, rtype1.id)

        const rs1 = new Resources( new Map<ResourceType, Resource>( [[rtype1, r1], [rtype2, r2]] ) )
        const rs2 = Resources.add(rs1, new Resources(new Map<ResourceType, Resource>( [[rtype1, r3]] )) )

        const res = rm.addAgent(agent, rs2)
        expect(res).to.be.true
        //rm.ownership.print2()

        // * The ownershipstate should not contain the resourcetype with 0 amount. 
        const ownership = rm.ownership.get(agent)
        expect(ownership.get(rtype1).amount).to.equal(0)

        const ownsRes1 = rm.actorOwnsResource(rm.ownership, agent, rtype1.id, 0)
        const ownsRes2 = rm.actorOwnsResource(rm.ownership, agent, rtype2.id, 200)
        expect(ownsRes1).to.be.true //false
        expect(ownsRes2).to.be.true
    }) */
    
    after( () => db.none(resetSchema))
}) 

describe('Location and transports in the ResourceManager', () => {
    before(() => db.none(schema))
    
    it('Add location with zero resources', async () => {
        // Setup
        const rm = new ResourceManager("rm")
        // Act
        const res = rm.addLocation(diku)
        // Assert
        expect(res).to.be.true
    })

    it('Do not add location to the location state of resource manager if another location with the id exists', () => {
        // Setup
        const rm = new ResourceManager("rm")
        const location : Location = { 
            id: diku.id,
            name: "diku",
            longitude: 0,
            latitude: 0,
        }
        // Act
        rm.addLocation(diku)
        const res = rm.addLocation(location)
        // Assert
        expect(res).to.be.false
        expect(Array.from(rm.LocationState)).to.have.length(2)
    })

    it('Agent cannot add resource location when agent is not owner', () => {
        // Setup
        const rm = new ResourceManager("rm")
        // Act
        const res = rm.addLocation(diku, agent, resources)
        // Assert
        expect(res).to.be.false

    }) 

    it('Agent adds resource location when agent is owner', async () => {
        // Setup
        const rm = new ResourceManager("rm")
        rm.addAgent(agent, resources)
        // Act
        const res = rm.addLocation(diku, agent, resources)
        // Assert
        expect(res).to.be.true
        expect(Array.from(rm.LocationState)).to.have.length(2)
    })

    it('Transport test', () => {
        // Setup
        const rm = new ResourceManager("rm")
        rm.addAgent(agent, resources)
        rm.addLocation(diku, agent, resources)
        rm.addLocation(hcoe)
        const transport = new Transport(new Map<Location, Resources>([ 
            [diku, Resources.mult(-1, resources)], 
            [hcoe, resources]
        ]))
        // Act
        const inserted = rm.applyTransport(transport)
        // Assert
        expect(inserted).to.be.true
    })
    after(() => db.none(resetSchema))
})



describe('Transfers in the ResourceManager', () => {
    before(() => db.none(resetSchema))
    before(() => db.none(schema))

    it('Should transfer resources', async () => {
        const rm = new ResourceManager("rm")

        const seller : Agent = new Agent("Dog4U", "Dog Pound")
        const buyer : Agent = new Agent("Customer", "Dog lover")

        // * Create resourcetypes and store them to the database.
        const rtype1 : ResourceType = new ResourceType("Dog", 10000)

        // * Define the resources to store to the ownershipstate.
        const r1 : Resource = 1.0
        const dogResources = new Resources( new Map<ResourceType, Resource>( [[rtype1, r1]] ) )
        
        // * Local ResourceManager
        const rmSellerRes = rm.addAgent(seller, dogResources)
        const rmBuyerRes = rm.addAgent(buyer)
        expect(rmSellerRes).to.be.true
        expect(rmBuyerRes).to.be.true

        // * Define the resources to transfer.
        const r = 0.1
        const buyDogResources = new Resources( new Map<ResourceType, Resource>( [[rtype1, r]] ) )

        const t : Transfer = new Transfer(new Map<Agent, Resources>([ 
            [buyer, buyDogResources], 
            [seller, Resources.mult(-1, buyDogResources)]
        ]))
        const tRes = rm.applyTransfer(t)
        expect(tRes).to.be.true

        // * The ownershipstate should contain the resourcetype once with the amounts summed. 
        const ownershipSeller = rm.ownership.get(seller)
        const ownershipBuyer = rm.ownership.get(buyer)
        expect(ownershipSeller.get(rtype1)).to.equal(0.9)
        expect(ownershipBuyer.get(rtype1)).to.equal(0.1)
    })

    it('Should transfer resources one to one between two agents.', async () => {
        const rm = new ResourceManager("rm")

        const transferor : Agent = new Agent("Cami's Bakery", "Bakery")
        const transferee : Agent = new Agent("Customer", "Hungry person")

        const rtype1 : ResourceType = new ResourceType("Hot cross buns", 5)
        const rtype2 : ResourceType = new ResourceType("DKK", 1)

        const r1 : Resource = 8
        const r2 : Resource = 40

        const bakerResources = new Resources( new Map( [[rtype1, r1]] ) )
        const customerResources = new Resources( new Map( [[rtype2, r2]]) )

        const res1 = rm.addAgent(transferor, bakerResources)
        const res2 = rm.addAgent(transferee, customerResources)
        expect(res1).to.be.true
        expect(res2).to.be.true
        
        const transfer : Transfer = new Transfer(new Map([
            [transferor, Resources.add(customerResources, Resources.mult(-1, bakerResources))],
            [transferee, Resources.add(bakerResources, Resources.mult(-1, customerResources))], 
        ]))
 
        const res3 = rm.applyTransfer(transfer)
        expect(res3).to.be.true

        // * The ownershipstate should contain the resourcetype once with the amounts summed. 
        const ownershipTransferor = rm.ownership.get(transferor)
        const ownershipTransferee = rm.ownership.get(transferee)
        expect(ownershipTransferor.get(rtype1)).to.equal(0)
        expect(ownershipTransferor.get(rtype2)).to.equal(40)
        expect(ownershipTransferee.get(rtype1)).to.equal(8)
        expect(ownershipTransferee.get(rtype2)).to.equal(0)
    })

    it('Should transfer amounts of resources between two agents.', async () => {
        const rm = new ResourceManager("rm")
        const seller = new Agent("Dog4U", "Dog Pound")
        const buyer = new Agent("Customer", "Dog lover")

        const rtype1 = new ResourceType("Dog", 10000) // 10.000 g dog
        const rtype2 = new ResourceType("DKK", 1000)  // 1000 DKK

        const dogResources = new Resources( new Map( [[rtype1, 1.0]] ) )
        const customerResources = new Resources( new Map( [[rtype2, 1.0]]) )

        const res1 = rm.addAgent(seller, dogResources)
        const res2 = rm.addAgent(buyer, customerResources)
        expect(res1).to.be.true
        expect(res2).to.be.true

        const buyDogResources = new Resources( new Map( [[rtype1, 0.1]] ) )
        const payCustomerResources = new Resources( new Map( [[rtype2, 0.5]]) )
        
        const transfer = new Transfer(new Map([ 
            [buyer, Resources.add(buyDogResources, Resources.mult(-1, payCustomerResources))], 
            [seller, Resources.add(payCustomerResources, Resources.mult(-1, buyDogResources))]
        ]))

        const res3 = rm.applyTransfer(transfer)
        expect(res3).to.be.true

        const ownsRes1Seller = rm.actorOwnsResource(rm.ownership, seller, rtype1, 0.9)
        const ownsRes2Seller = rm.actorOwnsResource(rm.ownership, seller, rtype2, 0.5)
        const ownsRes1Buyer = rm.actorOwnsResource(rm.ownership, buyer, rtype1, 0.1)
        const ownsRes2Buyer = rm.actorOwnsResource(rm.ownership, buyer, rtype2, 0.5)
        expect(ownsRes1Seller).to.be.true
        expect(ownsRes2Seller).to.be.true
        expect(ownsRes1Buyer).to.be.true
        expect(ownsRes2Buyer).to.be.true
    })
})







