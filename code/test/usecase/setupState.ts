process.env.NODE_ENV = 'test'
import 'mocha'
import 'chai-http'
import * as chai from 'chai'
chai.use(require('chai-http'))
const chaiAsPromised = require('chai-as-promised')
const { expect } = chai
chai.use(chaiAsPromised)
const exactMath = require('exact-math')
import { uid, Resource } from "../../src/Models/types"
const { resetSchema, schema } = require('../../src/Models/database/queries')
import { ResourceType } from '../../src/Models/classes/resourceType'
import { Location } from '../../src/Models/classes/location'

import { db } from '../../src/Models/database/instance'
const server = require('../../src/Controller/routes')

import { agentsInput, locationsInput } from './actors'
import { resourceTypesInput } from './resourceTypes'
import { immediateNeighbors, modelForCarbonUsageOfAgent } from './model'


let agents : Array<any> = [{}, {}, {}]
let locations : Array<Location> = []
let resourceTypes : Array<ResourceType> = []
let cccId : uid
let gasId : uid
let muleId : uid
let pesosId : uid
let truckId : uid
let cherryId : uid
let wetParchmentId : uid
let pulpId : uid
let dryParchmentId : uid
let greenCoffeeId : uid
let pasillaId : uid
let unaccountedId : uid
let farmerId : uid
let cooperativeId : uid
let almacafeId : uid
let farmerLocId : uid
let cooperativeLocId : uid
let almacafeLocId : uid
let farmerResource : Array<{type: uid, amount: number}>
let cooperativeResource : Array<{type: uid, amount: number}>
let almacafeResource : Array<{type: uid, amount: number}>

let resourceTypesM
describe('Use case', () => {
    before(() => db.none(resetSchema))
    before(() => db.none(schema))

    it('Setup resource types, locations and agents in system', async () => {
        // Add resource types
        const resResourceType = await chai.request(server).post('/api/resourcetypes').send({rtypes: resourceTypesInput})
        resourceTypes = resResourceType.body
        resourceTypesM = Object.assign({}, ...resourceTypes.map(rt => ({[rt.id]: {name: rt.name, valuation: rt.valuation} })));
        cherryId = resourceTypes[0].id
        wetParchmentId = resourceTypes[1].id
        dryParchmentId = resourceTypes[2].id
        gasId = resourceTypes[3].id
        pesosId = resourceTypes[4].id
        muleId = resourceTypes[5].id
        truckId = resourceTypes[6].id
        unaccountedId = resourceTypes[7].id
        greenCoffeeId = resourceTypes[8].id
        pasillaId = resourceTypes[9].id
        pulpId = resourceTypes[10].id

        // Add carbon credit certificate
        const cccIn = {
            name: "Minas Gerais project",
            valuation: 24000,
            time_period: {
                startTime: new Date('2019-01-01'),
                endTime: new Date('2022-12-20'),
            },
            area: [
                { longitude: -17.090321157036403, latitude: -41.90358264072040 },
                { longitude: -17.060509871004097, latitude: -41.93235586458152 },
                { longitude: -17.081925771917348, latitude: -41.85025082680357 },
            ],
            evidence: {} // Add some evidence from i.e. the gold standard
        }
        const resCCC = await chai.request(server).post('/api/carbon-credit-certificates').send(cccIn)
        cccId = resCCC.body.id

        // Add locations
        const farmRes = await chai.request(server).post('/api/locations').send(locationsInput[0])
        expect(farmRes).to.have.status(200)
        locations[0] = farmRes.body
        const cooperativeRes = await chai.request(server).post('/api/locations').send(locationsInput[1])
        expect(cooperativeRes).to.have.status(200)
        locations[1] = cooperativeRes.body
        const almacafeRes = await chai.request(server).post('/api/locations').send(locationsInput[2])
        expect(almacafeRes).to.have.status(200)
        locations[2] = almacafeRes.body
        farmerLocId = locations[0].id
        cooperativeLocId = locations[1].id
        almacafeLocId = locations[2].id

        // Add agents
        const a0Res = await chai.request(server).post('/api/agents').send(agentsInput[0])
        expect(a0Res).to.have.status(200)
        agents[0] = a0Res.body
        const a1Res = await chai.request(server).post('/api/agents').send(agentsInput[1])
        expect(a1Res).to.have.status(200)
        agents[1] = a1Res.body
        const a2Res = await chai.request(server).post('/api/agents').send(agentsInput[2])
        expect(a2Res).to.have.status(200)
        agents[2] = a2Res.body
        farmerId = agents[0].id
        cooperativeId = agents[1].id
        almacafeId = agents[2].id
    })

    it('Setup start ownership state', async() => {
        // Farmer: coffee cherries, mule
        farmerResource = [
            { type: cherryId, amount: 210000 }, // Coffee cherries
            { type: muleId, amount: 1 } // Mule  
        ]
        const farmerTransfer = { transferor: 'INIT', transferee: farmerId, info: {amounts: "210 kg coffee cherry"}, resources: farmerResource }
        const farmerRes = await chai.request(server).post('/api/transfers').send(farmerTransfer)
        expect(farmerRes).to.have.status(200)

        // Cooperative: gas, pesos, truck
        cooperativeResource = [
            { type: gasId, amount: 50 },
            { type: pesosId, amount: 670000 },
            { type: truckId, amount: 1 },
        ]
        const cooperativeTransfer = { transferor: 'INIT', transferee: cooperativeId, info: {amounts: "50 L gas and 670000 pesos"}, resources: cooperativeResource }
        const cooperativeRes = await chai.request(server).post('/api/transfers').send(cooperativeTransfer)
        expect(cooperativeRes).to.have.status(200)

        // Almacafé: pesos, ccc
        almacafeResource = [
            { type: cccId, amount: 1.0 },
            { type: pesosId, amount: 2000000 },
        ]
        const almacafeTransfer = { transferor: 'INIT', transferee: almacafeId, info: {amounts: "1 CCC and 2000000 pesos"}, resources: almacafeResource }
        const almacafeRes = await chai.request(server).post('/api/transfers').send(almacafeTransfer)
        expect(almacafeRes).to.have.status(200)
    })

    it('Setup start resource location state', async () => {
        const farmTransport = { 
            agent: farmerId, 
            location_start: "INIT", 
            destination: farmerLocId,
            resources: farmerResource,
            distance: 0
        }
        const farmRes = await chai.request(server).post('/api/transports').send(farmTransport)
        expect(farmRes).to.have.status(200)

        const cooperativeTransport = { 
            agent: cooperativeId,
            location_start: "INIT", 
            destination: cooperativeLocId,
            resources: cooperativeResource,
            distance: 0
        }
        const cooperativeRes = await chai.request(server).post('/api/transports').send(cooperativeTransport)
        expect(cooperativeRes).to.have.status(200)

        const almacafeTransport = { 
            agent: almacafeId, 
            location_start: "INIT", 
            destination: almacafeLocId,
            resources: almacafeResource,
            distance: 0
        }
        const almacafeRes = await chai.request(server).post('/api/transports').send(almacafeTransport)
        expect(almacafeRes).to.have.status(200)
    })


    it('Events: Farmer', async () => {
        // Transformation: Wet milling
        const wetMilling = {
            agent: farmerId,
            location: farmerLocId,
            inputResources: [{ type: cherryId, amount: 210000 }],
            outputResources: [
                { type: wetParchmentId, amount: 170000 }, // wet parchment consists of seeds/beans
                { type: pulpId,  amount:  40000 }
            ],
            info: {}
        }
        const wetMillingRes = await chai.request(server).post('/api/transformations').send(wetMilling)
        expect(wetMillingRes).to.have.status(200)

        // Transformation: Drying and fermenting
        const dryingAndFermenting = {
            agent: farmerId,
            location: farmerLocId,
            inputResources: [{ type: wetParchmentId, amount: 170000 }],
            outputResources: [
                { type: dryParchmentId, amount: 167000 },
                { type: unaccountedId,  amount:   3000 }
            ],
            info: {}
        }
        const dryingAndFermentingRes = await chai.request(server).post('/api/transformations').send(dryingAndFermenting)
        expect(dryingAndFermentingRes).to.have.status(200)
        
        // Transport: dryParchment from Farm to Cooperative
        const farmTransport = { 
            agent: farmerId, 
            location_start: farmerLocId, 
            destination: cooperativeLocId,
            resources: [{ type: dryParchmentId, amount: 167000 }],
            distance: 4.9
        }
        const farmTransportRes = await chai.request(server).post('/api/transports').send(farmTransport)
        expect(farmTransportRes).to.have.status(200)

        // Transfer: dryParchment from Farm to Cooperative
        const farmTransfer = {
            transferor: farmerId,
            transferee: cooperativeId,
            info: {},
            resources: [{ type: dryParchmentId, amount: 167000 }],
        }
        const farmTransferRes = await chai.request(server).post('/api/transfers').send(farmTransfer)
        expect(farmTransferRes).to.have.status(200)

    })

    it('Events: Cooperative', async () => {
        // Transfer: Pay Farm for dry parchment with pesos
        const cooperativeTransfer = { 
            transferor: cooperativeId,
            transferee: farmerId,
            info: {}, 
            resources: [ { type: pesosId, amount: 550000 }] 
        }
        const cooperativeRes = await chai.request(server).post('/api/transfers').send(cooperativeTransfer)
        expect(cooperativeRes).to.have.status(200)

        // Transport: From Cooperative to Almacafé
        const cooperativeTransport = { 
            agent: cooperativeId,
            location_start: cooperativeLocId,
            destination: almacafeLocId,
            resources: [{ type: dryParchmentId, amount: 167000 }],
            distance: 20.5
        }
        const cooperativeTransportRes = await chai.request(server).post('/api/transports').send(cooperativeTransport)
        expect(cooperativeTransportRes).to.have.status(200)

        // Transfer: dry parchment from Cooperative to Almacafe
        const cooperativeToAlmacafeTransfer = {
            transferor: cooperativeId,
            transferee: almacafeId,
            info: {},
            resources: [{ type: dryParchmentId, amount: 167000 }]
        }
        const cooperativeTransferRes = await chai.request(server).post('/api/transfers').send(cooperativeToAlmacafeTransfer)
        expect(cooperativeTransferRes).to.have.status(200)
    })

    it('Events: Almacafé', async () => {
        // Transfer: Pay Cooperative for Dry parchment
        const almacafeTransfer = { 
            transferor: almacafeId,
            transferee: cooperativeId,
            info: {},
            resources: [ { type: pesosId, amount: 650000 }]
        }
        const almacafeRes = await chai.request(server).post('/api/transfers').send(almacafeTransfer)
        expect(almacafeRes).to.have.status(200)
        
        // Transformation: Dry milling
        const dryMilling = {
            agent: almacafeId,
            location: almacafeLocId,
            inputResources: [{ type: dryParchmentId, amount: 167000 }],
            outputResources: [
                { type: greenCoffeeId, amount: 157000 },
                { type: pasillaId,     amount:   8000 },
                { type: unaccountedId, amount:   2000 },
            ],
            info: {}
        }
        const dryMillingRes = await chai.request(server).post('/api/transformations').send(dryMilling)
        expect(dryMillingRes).to.have.status(200)
    })

    
    it('Model to get carbon usage for agents', async() => {
        const carbonFarmer = await modelForCarbonUsageOfAgent(farmerId, wetParchmentId, dryParchmentId)
        const carbonCooperative = await modelForCarbonUsageOfAgent(cooperativeId, wetParchmentId, dryParchmentId)
        const carbonAlmacafe = await modelForCarbonUsageOfAgent(almacafeId, wetParchmentId, dryParchmentId)
        const fullSCN = carbonFarmer + carbonCooperative + carbonAlmacafe
        console.log({fullSCN: fullSCN, carbonFarmer:carbonFarmer, carbonCooperative:carbonCooperative, carbonAlmacafe:carbonAlmacafe})
        
        let carbonCooperativeNeighbors = await immediateNeighbors(cooperativeId, wetParchmentId, dryParchmentId)
        let cooperativeAndNeighbors = carbonCooperativeNeighbors + carbonCooperative // Equal to full SCN
        console.log({carbonCooperativeNeighbors:carbonCooperativeNeighbors, cooperativeAndNeighbors:cooperativeAndNeighbors})
    })
})