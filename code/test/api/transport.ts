process.env.NODE_ENV = 'test'

import 'mocha'
import 'chai-http'
import * as chai from 'chai'
chai.use(require('chai-http'))
const { expect } = chai
const exactMath = require('exact-math') // Computing with floating points accurately

import { Resource, uid } from '../../src/Models/types'
import { Agent } from '../../src/Models/classes/agent'
import { ResourceType } from '../../src/Models/classes/resourceType'
import { db } from '../../src/Models/database/instance'
const { resetSchema, schema } = require('../../src/Models/database/queries')
const server = require('../../src/Controller/routes')

// Variables
import { locationsInput, agentsInputCS, resourceTypesInput } from '../data'
const amount = 0.1
const amount1 = 0.7
const amount2 = 0.3
let agents : Array<Agent> = []
let locationsIds : Array<uid>= []
let resourceType1 : ResourceType
let resourceType2 : ResourceType

describe('Transports', () => {
    before(() => db.none(resetSchema))
    before(() => db.none(schema))
    before( async () => {
        // Setup resource types
        const resRtypes = await chai.request(server).post('/api/resourcetypes').send({rtypes: resourceTypesInput})
        resourceType1 = resRtypes.body[0]
        resourceType2 = resRtypes.body[1]

        // Add locations
        const locationRes0 = await chai.request(server).post('/api/locations').send(locationsInput[0])
        locationsIds.push(locationRes0.body.id)
        const locationRes1 = await chai.request(server).post('/api/locations').send(locationsInput[1])
        locationsIds.push(locationRes1.body.id)

        // Add agent with resources to the ownership
        const agentRes = await chai.request(server).post('/api/agents').send(agentsInputCS[0])
        expect(agentRes).to.have.status(200)
        agents.push(agentRes.body)

        const rs = [{type: resourceType1.id, amount: amount1}, {type: resourceType2.id, amount: amount2}]
        const transfer = {transferor: 'INIT', transferee: agents[0].id, info: {}, resources: rs}
        const res = await chai.request(server).post('/api/transfers').send(transfer)
        expect(res).to.have.status(200)
    })

    it('Set initial location for resources using transport', async () => {
        // Setup
        const transport = {
            agent: agents[0].id, 
            location_start: "INIT", 
            destination: locationsIds[0],
            resources: [ 
                { type: resourceType1.id, amount: amount1 },
            ],
            distance: 0
        }
        // Act
        const res = await chai.request(server).post('/api/transports').send(transport)
        // Assert
        expect(res).to.have.status(200)
        expect(res.body[0].resource_type).to.equal(resourceType1.id)
    })

    it('Transport resources from location to other location', async () => {
        const transport = { 
            agent: agents[0].id, 
            location_start: locationsIds[0], 
            destination: locationsIds[1],
            resources: [ 
                { type: resourceType1.id, amount: amount },
            ],
            distance: 10
        }
        const res = await chai.request(server).post('/api/transports').send(transport)
        expect(res).to.have.status(200)
        res.body.forEach(t => {
            expect(t).to.have.property('id')
            expect(t).to.have.property('owner')
            expect(t).to.have.property('location_start')
            expect(t).to.have.property('destination')
            expect(t).to.have.property('resource_type')
            expect(t).to.have.property('amount')
            expect(t).to.have.property('time_of_effect')
        })

        const locationStates = await chai.request(server).get('/api/location-states')
        locationStates.body.forEach(ls => {
            if (ls.location_id === locationsIds[0]) {
                expect(ls.amount).to.equal(exactMath.sub(amount1, amount))
            }
            else if (ls.location_id === locationsIds[1]) {
                expect(ls.amount).to.equal(amount)
            }
        })
        
    })

    it('Transport resources back', async () => {
        const transportBack = { 
            agent: agents[0].id, 
            location_start: locationsIds[1], 
            destination: locationsIds[0],
            resources: [
                { type: resourceType1.id, amount: amount },
            ],
            distance: 10
        }
        const tBackRes = await chai.request(server).post('/api/transports').send(transportBack)
        expect(tBackRes).to.have.status(200)
        const locationStates = await chai.request(server).get('/api/location-states')
        locationStates.body.forEach(ls => {
            if (ls.location_id === locationsIds[0]) {
                expect(ls.amount).to.equal(amount1)
            }
            else if (ls.location_id === locationsIds[1]) {
                expect(ls.amount).to.equal(0)
            }
        })
    })

    it('Transport compound resource', async () => {
        const inp = [{ name: 'okse', valuation: 1 },
                     { name: 'gris', valuation: 1 }]
        const resRtypes = await chai.request(server).post('/api/resourcetypes').send({rtypes: inp})
        let rts = resRtypes.body
        const transportI = { 
            agent: agents[0].id, 
            location_start: "INIT", 
            destination: locationsIds[0],
            resources: [ 
                { type: rts[0].id, amount: 11 },
                { type: rts[1].id, amount: 11 }
            ],
            distance: 0
        }
        const res = await chai.request(server).post('/api/transports').send(transportI)
        expect(res).to.have.status(200)

        const transport = { 
            agent: agents[0].id, 
            location_start: locationsIds[0], 
            destination: locationsIds[1],
            resources: [ 
                { type: rts[0].id, amount: 8.5 },
                { type: rts[1].id, amount: 8.5 }
            ],
            distance: 5
        }
        
        const tres = await chai.request(server).post('/api/transports').send(transport)

        expect(tres).to.have.status(200)
        tres.body.forEach(t => {
            expect(t).to.have.property('id')
            expect(t).to.have.property('owner')
            expect(t).to.have.property('location_start')
            expect(t).to.have.property('destination')
            expect(t).to.have.property('resource_type')
            expect(t).to.have.property('amount')
            expect(t).to.have.property('time_of_effect')
        })
        const locationStates = await chai.request(server).get('/api/location-states')
        locationStates.body.forEach(ls => {
            if (ls.location_id === locationsIds[0] && 
                (ls.resource_type === rts[0] || ls.resource_type === rts[1])) {
                expect(ls.amount).to.equal(exactMath.sub(11, 8.5))
            }
            else if (ls.location_id === locationsIds[1] && (ls.resource_type === rts[0] || ls.resource_type === rts[1])) {
                expect(ls.amount).to.equal(8.5)
            }

        })
    })


    it('Transport should fail when location does not exist.',async () => {
        const transport = { 
            agent: agents[0].id, 
            location_start: 'unknown location', 
            destination: locationsIds[1],
            resources: [ 
                { type: resourceType1.id, amount: amount1 },
            ],
            distance: 0
        }
        const res = await chai.request(server).post('/api/transports').send(transport)
        expect(res).to.have.status(400)
    })

    it('Transport should fail when agent does not exist.',async () => {
        const transport = { 
            agent: 'unknown agent', 
            location_start: locationsIds[0], 
            destination: locationsIds[1],
            resources: [ 
                { type: resourceType1.id, amount: amount1 },
            ],
            distance: 5
        }
        const res = await chai.request(server).post('/api/transports').send(transport)
        expect(res).to.have.status(400)
    })

    it('Transport should fail when resource type does not exist.',async () => {
        const transport = { 
            agent: agents[0].id, 
            location_start: locationsIds[0], 
            destination: locationsIds[1],
            resources: [ 
                { type: 'unknown id', amount: amount1 },
            ],
            distance: 5
        }
        const res = await chai.request(server).post('/api/transports').send(transport)
        expect(res).to.have.status(400)
    })

    after(() => db.none(resetSchema))
})
