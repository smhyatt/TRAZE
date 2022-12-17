process.env.NODE_ENV = 'test'

import 'mocha'
import 'chai-http'
import * as chai from 'chai'
chai.use(require('chai-http'))
const { expect } = chai
const exactMath = require('exact-math') // Computing with floating points accurately
import { TransferDB } from "../../src/Models/types"
import { ResourceType } from '../../src/Models/classes/resourceType'
import { Agent } from '../../src/Models/classes/agent'

import { db } from '../../src/Models/database/instance'
import { agentsInput, resourceTypesInput } from '../data'
const { resetSchema, schema } = require('../../src/Models/database/queries')
const server = require('../../src/Controller/routes')

const amount1 = 0.7
const amount2 = 0.3
let agents : Array<Agent> = []

let resourceType1 : ResourceType
let resourceType2 : ResourceType
let resourceType3 : ResourceType
let testTransfer : TransferDB

// * Tests * //
describe('Transfers', () => {
    before(() => db.none(resetSchema))
    before(() => db.none(schema))
    before( async () => {
        // * Setup resource types.
        const resRtypes = await chai.request(server).post('/api/resourcetypes').send({rtypes: resourceTypesInput})
        resourceType1 = resRtypes.body[0]
        resourceType2 = resRtypes.body[1]
        resourceType3 = resRtypes.body[2]

        // * Add agents with resources to the ownership.
        await Promise.all( agentsInput.map(async a => { 
            const agentRes = await chai.request(server).post('/api/agents').send(a)
            expect(agentRes).to.have.status(200)
            agents.push(agentRes.body)
        }))
        const rs = [{type: resourceType1.id, amount: amount1}, {type: resourceType2.id, amount: amount2}]
        await Promise.all(agents.map( async agent => {
            const transfer = {transferor: 'INIT', transferee: agent.id, info: {}, resources: rs}
            const res = await chai.request(server).post('/api/transfers').send(transfer)
            expect(res).to.have.status(200)
        }))
    })
    after(() => db.none(resetSchema))

    it('Should transfer resources from one agent to another.', async () => {
        const amount = 0.1
        const rs = [{type: resourceType1.id, amount: amount}, {type: resourceType2.id, amount: amount}]
        const transfer = {transferor: agents[0].id, transferee: agents[1].id, info: {}, resources: rs}
        const res = await chai.request(server).post('/api/transfers').send(transfer)
        expect(res).to.have.status(200)
        testTransfer = res.body[0]

        res.body.forEach(t => {
            expect(t).to.have.property('id')
            expect(t).to.have.property('transferor')
            expect(t).to.have.property('transferee')
            expect(t).to.have.property('type')
            expect(t).to.have.property('amount')
            expect(t).to.have.property('time_of_effect')
            expect(t).to.have.property('info')
        })

        const ownerships = await chai.request(server).get('/api/ownerships')

        ownerships.body.forEach(o => {
            // * Ensuring that agent0 has transferred the right resources. 
            if (o.agent === agents[0].id && o.type === resourceType1.id) {
                expect(o.amount).to.equal(exactMath.sub(amount1, amount))
            }

            if (o.agent === agents[0].id && o.type === resourceType2.id) {
                expect(o.amount).to.equal(exactMath.sub(amount2, amount))
            }

            // * Ensuring that agent1 has received the right resources. 
            if (o.agent === agents[1].id && o.type === resourceType1.id) {
                expect(o.amount).to.equal(exactMath.add(amount1, amount))
            }

            if (o.agent === agents[1].id && o.type === resourceType2.id) {
                expect(o.amount).to.equal(exactMath.add(amount2, amount))
            }
        })
    })

    it('GET transfer based on its id', async () => {
        const res = await chai.request(server).get(`/api/transfers/${testTransfer.id}`)
        expect(res).to.have.status(200)
        expect(res.body[0].id).to.eq(testTransfer.id)
    })

    it('Should fail when the agent does not exist.',async () => {
        const t = {transferor: 'faketransferor', transferee: 'faketransferee', info: {}, resources: [{type: resourceType1.id, amount: 1.0}]}
        const res = await chai.request(server).post('/api/transfers').send(t)
        expect(res).to.have.status(400)
    }) 

    it('Should fail when the resource type does not exist.',async () => {
        const t = {transferor: agents[0].id, transferee: agents[1].id, info: {}, resources: [{type: 'faketype', amount: 0.2}]}
        const res = await chai.request(server).post('/api/transfers').send(t)
        expect(res).to.have.status(400)
    })

    it('Should fail when transferor and transferee are the same.',async () => {
        const t = {transferor: agents[0].id, transferee: agents[0].id, info: {}, resources: [{type: resourceType1.id, amount: 0.2}]}
        const res = await chai.request(server).post('/api/transfers').send(t)
        expect(res).to.have.status(400)
    })

    it('Should fail when the agent doesnt own the resource to transfer.',async () => {
        const t = {transferor: agents[0].id, transferee: agents[1].id, info: {}, resources: [{type: resourceType3, amount: 0.2}]}
        const res = await chai.request(server).post('/api/transfers').send(t)
        expect(res).to.have.status(400)
    })

    it('Should fail when the agent doesnt own the amount of the resource to transfer.',async () => {
        const t = {transferor: agents[0].id, transferee: agents[1].id, info: {}, resources: [{type: resourceType1, amount: 0.9}]}
        const res = await chai.request(server).post('/api/transfers').send(t)
        expect(res).to.have.status(400)
    })
    
})



