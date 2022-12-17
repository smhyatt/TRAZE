process.env.NODE_ENV = 'test'

import 'mocha'
import 'chai-http'
import * as chai from 'chai'
chai.use(require('chai-http'))
const { expect } = chai
import { ResourceType } from '../../src/Models/classes/resourceType'
import { Agent } from '../../src/Models/classes/agent'

import { db } from '../../src/Models/database/instance'
import { sleep } from '../utilities'
import { TransformationOutputDB, uid } from '../../src/Models/types'
const { resetSchema, schema } = require('../../src/Models/database/queries')
const server = require('../../src/Controller/routes')

// * Variables
import { locationsInput, agentsInputCS, resourceTypesTransformation } from '../data'
let locationsIds : Array<uid>= []
let agent : Agent
let agentRs
const amount1 = 20.0
const amount2 = 6.0
const amount3 = 4.0
let resourceTypeScrews : ResourceType
let resourceTypeWoodenPlank : ResourceType
let resourceTypeTableLeg : ResourceType
let resourceTypeTable : ResourceType
let resourceTypeFail1 : ResourceType
let resourceTypeFail2 : ResourceType
let testTransformation : TransformationOutputDB

// * Tests * //
describe('Transformation with locations', () => {
    before(() => db.none(resetSchema))
    before(() => db.none(schema))
    before( async () => {
        // * Setup resource types
        const resRtypes = await chai.request(server).post('/api/resourcetypes').send({rtypes: resourceTypesTransformation})
        resourceTypeScrews = resRtypes.body[0]
        resourceTypeWoodenPlank = resRtypes.body[1]
        resourceTypeTableLeg = resRtypes.body[2]
        resourceTypeTable = resRtypes.body[3]
        resourceTypeFail1 = resRtypes.body[4]
        resourceTypeFail2 = resRtypes.body[5]

        // * Add agent with resources to the ownership
        const agentRes = await chai.request(server).post('/api/agents').send(agentsInputCS[0])
        expect(agentRes).to.have.status(200)
        agent = agentRes.body
        sleep(3000)

        agentRs = [{type: resourceTypeScrews.id, amount: amount1}
                  ,{type: resourceTypeWoodenPlank.id, amount: amount2}
                  ,{type: resourceTypeTableLeg.id, amount: amount3}
                  ,{type: resourceTypeFail1.id, amount: 1.0}]

        const transfer = {transferor: 'INIT', transferee: agent.id, info: {}, resources: agentRs}
        const transferRes = await chai.request(server).post('/api/transfers').send(transfer)
        expect(transferRes).to.have.status(200)

        // * Create location
        const locationRes = await chai.request(server).post('/api/locations').send(locationsInput[0])
        locationsIds.push(locationRes.body.id)
        
        // * Create location for resource type
        const transport = { agent: agent.id, location_start: "INIT", destination: locationsIds[0], resources: agentRs, distance: 0 }
        const transportRes = await chai.request(server).post('/api/transports').send(transport)
        expect(transportRes).to.have.status(200)
    })
    after(() => db.none(resetSchema))

    it('Should transform screws, woodenpland and tablelegs into a table.', async () => {
        const outputRs = [{type: resourceTypeTable.id, amount: 1.0}]
        const transformation = {agent: agent.id, inputResources: agentRs.slice(0, -1), outputResources: outputRs, info: {}}
        const res = await chai.request(server).post('/api/transformations').send(transformation)
        expect(res).to.have.status(200)
        // * res.body contains data from Transformation_Output
        testTransformation = res.body[0]
        expect(res.body[0]).to.have.property('transformation')
        expect(res.body[0]).to.have.property('type')
        expect(res.body[0]).to.have.property('amount')
        expect(res.body[0].type).to.equal(resourceTypeTable.id)

        // * Doublecheck that the ownership is accurate. 
        const ownerships = await chai.request(server).get('/api/ownerships')
        ownerships.body.forEach(o => {
            // * Ensuring that the agent now owns the right resources. 
            if (o.agent === agent.id && o.type === resourceTypeTable.id) {
                expect(o.amount).to.equal(1.0)
            }

            if (o.agent === agent.id && o.type === resourceTypeScrews.id) {
                expect(o.amount).to.equal(0)
            }

            if (o.agent === agent.id && o.type === resourceTypeWoodenPlank.id) {
                expect(o.amount).to.equal(0)
            }

            if (o.agent === agent.id && o.type === resourceTypeTableLeg.id) {
                expect(o.amount).to.equal(0)
            }
        })
    })

    it('GET a transformation based on its id', async () => {
        const res = await chai.request(server).get(`/api/transformations/${testTransformation.transformation}`)
        expect(res).to.have.status(200)
        expect(res.body[0].id).to.eq(testTransformation.transformation)
    })

    it('GET transformation inputs based on a transformation id', async () => {
        const res = await chai.request(server).get(`/api/transformation-inputs/${testTransformation.transformation}`)
        expect(res).to.have.status(200)
        expect(res.body).to.have.length(3)
    })

    it('GET transformation outputs based on a transformation id', async () => {
        const res = await chai.request(server).get(`/api/transformation-outputs/${testTransformation.transformation}`)
        expect(res).to.have.status(200)
        expect(res.body).to.have.length(1)
    })

    it('Should fail when the agent doesnt own one resource to transform.',async () => {
        const outputRs = [{type: resourceTypeTable.id, amount: 1.0}]
        const inputRs = [{type: resourceTypeFail2.id, amount: 0.2}, {type: resourceTypeFail1.id, amount: 0.2}]
        const transformation = {agent: agent.id, inputResources: inputRs, outputResources: outputRs, info: {}}
        const res = await chai.request(server).post('/api/transformations').send(transformation)
        expect(res).to.have.status(400)
    })

    it('Should fail when the agent doesnt own all resources to transform.',async () => {
        const outputRs = [{type: resourceTypeTable.id, amount: 1.0}]
        const inputRs = [{type: resourceTypeFail2.id, amount: 0.2}]
        const transformation = {agent: agent.id, inputResources: inputRs, outputResources: outputRs, info: {}}
        const res = await chai.request(server).post('/api/transformations').send(transformation)
        expect(res).to.have.status(400)
    })

    it('Should fail when the agent doesnt own the amount of one resource to transform.',async () => {
        const outputRs = [{type: resourceTypeScrews.id, amount: 2.5}]
        const inputRs = [{type: resourceTypeFail1.id, amount: 1.2}, {type: resourceTypeTable.id, amount: 0.1}]
        const transformation = {agent: agent.id, inputResources: inputRs, outputResources: outputRs, info: {}}
        const res = await chai.request(server).post('/api/transformations').send(transformation)
        expect(res).to.have.status(400)
    })

    it('Should fail when the agent doesnt own the amount of all resources to transform.',async () => {
        const outputRs = [{type: resourceTypeScrews.id, amount: 2.5}]
        const inputRs = [{type: resourceTypeFail1.id, amount: 1.2}, {type: resourceTypeTable.id, amount: 1.1}]
        const transformation = {agent: agent.id, inputResources: inputRs, outputResources: outputRs, info: {}}
        const res = await chai.request(server).post('/api/transformations').send(transformation)
        expect(res).to.have.status(400)
    })

    it('Should fail because the output resource type does not exist.',async () => {
        const outputRs = [{type: 'fake-id', amount: 2.5}]
        const inputRs = [{type: resourceTypeFail1.id, amount: 0.2}]
        const transformation = {agent: agent.id, inputResources: inputRs, outputResources: outputRs, info: {}}
        const res = await chai.request(server).post('/api/transformations').send(transformation)
        expect(res).to.have.status(400)
    })

    it('Should fail because the input resource type does not exist.',async () => {
        const outputRs = [{type: resourceTypeScrews.id, amount: 2.5}]
        const inputRs = [{type: 'fake-id', amount: 1.2}]
        const transformation = {agent: agent.id, inputResources: inputRs, outputResources: outputRs, info: {}}
        const res = await chai.request(server).post('/api/transformations').send(transformation)
        expect(res).to.have.status(400)
    })

})

describe('Transformation without locations', () => {
    before(() => db.none(resetSchema))
    before(() => db.none(schema))
    before( async () => {
        // * Setup resource types.
        const resRtypes = await chai.request(server).post('/api/resourcetypes').send({rtypes: resourceTypesTransformation})
        resourceTypeScrews = resRtypes.body[0]
        resourceTypeWoodenPlank = resRtypes.body[1]
        resourceTypeTableLeg = resRtypes.body[2]
        resourceTypeTable = resRtypes.body[3]
        resourceTypeFail1 = resRtypes.body[4]
        resourceTypeFail2 = resRtypes.body[5]

        // * Add agent with resources to the ownership.
        const agentRes = await chai.request(server).post('/api/agents').send(agentsInputCS[0])
        expect(agentRes).to.have.status(200)
        agent = agentRes.body
        sleep(3000)

        agentRs = [{type: resourceTypeScrews.id, amount: amount1}
                  ,{type: resourceTypeWoodenPlank.id, amount: amount2}
                  ,{type: resourceTypeTableLeg.id, amount: amount3}
                  ,{type: resourceTypeFail1.id, amount: 1.0}]

        const transfer = {transferor: 'INIT', transferee: agent.id, info: {}, resources: agentRs}
        const transferRes = await chai.request(server).post('/api/transfers').send(transfer)
        expect(transferRes).to.have.status(200)
    })

    it('Should transform screws, woodenpland and table legs into a table.', async () => {
        const outputRs = [{type: resourceTypeTable.id, amount: 1.0}]
        const transformation = {agent: agent.id, inputResources: agentRs.slice(0, -1), outputResources: outputRs, info: {}}
        const res = await chai.request(server).post('/api/transformations').send(transformation)
        expect(res).to.have.status(200)
        // * res.body contains data from Transformation_Output
        testTransformation = res.body[0]
        expect(res.body[0]).to.have.property('transformation')
        expect(res.body[0]).to.have.property('type')
        expect(res.body[0]).to.have.property('amount')
        expect(res.body[0].type).to.equal(resourceTypeTable.id)

        // * Doublecheck that the ownership is accurate. 
        const ownerships = await chai.request(server).get('/api/ownerships')
        ownerships.body.forEach(o => {
            // * Ensuring that the agent now owns the right resources. 
            if (o.agent === agent.id && o.type === resourceTypeTable.id) {
                expect(o.amount).to.equal(1.0)
            }

            if (o.agent === agent.id && o.type === resourceTypeScrews.id) {
                expect(o.amount).to.equal(0)
            }

            if (o.agent === agent.id && o.type === resourceTypeWoodenPlank.id) {
                expect(o.amount).to.equal(0)
            }

            if (o.agent === agent.id && o.type === resourceTypeTableLeg.id) {
                expect(o.amount).to.equal(0)
            }
        })
    })

    it('GET a transformation based on its id', async () => {
        const res = await chai.request(server).get(`/api/transformations/${testTransformation.transformation}`)
        expect(res).to.have.status(200)
        expect(res.body[0].id).to.eq(testTransformation.transformation)
    })

    it('GET transformation inputs based on a transformation id', async () => {
        const res = await chai.request(server).get(`/api/transformation-inputs/${testTransformation.transformation}`)
        expect(res).to.have.status(200)
        expect(res.body).to.have.length(3)
    })

    it('GET transformation outputs based on a transformation id', async () => {
        const res = await chai.request(server).get(`/api/transformation-outputs/${testTransformation.transformation}`)
        expect(res).to.have.status(200)
        expect(res.body).to.have.length(1)
    })

    it('Should fail when the agent doesnt own one resource to transform.',async () => {
        const outputRs = [{type: resourceTypeTable.id, amount: 1.0}]
        const inputRs = [{type: resourceTypeFail2.id, amount: 0.2}, {type: resourceTypeFail1.id, amount: 0.2}]
        const transformation = {agent: agent.id, inputResources: inputRs, outputResources: outputRs, info: {}}
        const res = await chai.request(server).post('/api/transformations').send(transformation)
        expect(res).to.have.status(400)
    })

    it('Should fail when the agent doesnt own all resources to transform.',async () => {
        const outputRs = [{type: resourceTypeTable.id, amount: 1.0}]
        const inputRs = [{type: resourceTypeFail2.id, amount: 0.2}]
        const transformation = {agent: agent.id, inputResources: inputRs, outputResources: outputRs, info: {}}
        const res = await chai.request(server).post('/api/transformations').send(transformation)
        expect(res).to.have.status(400)
    })

    it('Should fail when the agent doesnt own the amount of one resource to transform.',async () => {
        const outputRs = [{type: resourceTypeScrews.id, amount: 2.5}]
        const inputRs = [{type: resourceTypeFail1.id, amount: 1.2}, {type: resourceTypeTable.id, amount: 0.1}]
        const transformation = {agent: agent.id, inputResources: inputRs, outputResources: outputRs, info: {}}
        const res = await chai.request(server).post('/api/transformations').send(transformation)
        expect(res).to.have.status(400)
    })

    it('Should fail when the agent doesnt own the amount of all resources to transform.',async () => {
        const outputRs = [{type: resourceTypeScrews.id, amount: 2.5}]
        const inputRs = [{type: resourceTypeFail1.id, amount: 1.2}, {type: resourceTypeTable.id, amount: 1.1}]
        const transformation = {agent: agent.id, inputResources: inputRs, outputResources: outputRs, info: {}}
        const res = await chai.request(server).post('/api/transformations').send(transformation)
        expect(res).to.have.status(400)
    })

    it('Should fail because the output resource type does not exist.',async () => {
        const outputRs = [{type: 'fake-id', amount: 2.5}]
        const inputRs = [{type: resourceTypeFail1.id, amount: 0.2}]
        const transformation = {agent: agent.id, inputResources: inputRs, outputResources: outputRs, info: {}}
        const res = await chai.request(server).post('/api/transformations').send(transformation)
        expect(res).to.have.status(400)
    })

    it('Should fail because the input resource type does not exist.',async () => {
        const outputRs = [{type: resourceTypeScrews.id, amount: 2.5}]
        const inputRs = [{type: 'fake-id', amount: 1.2}]
        const transformation = {agent: agent.id, inputResources: inputRs, outputResources: outputRs, info: {}}
        const res = await chai.request(server).post('/api/transformations').send(transformation)
        expect(res).to.have.status(400)
    })

    after(() => db.none(resetSchema))
})



