process.env.NODE_ENV = 'test'

import 'mocha'
import 'chai-http'
import * as chai from 'chai'
chai.use(require('chai-http'))
const chaiAsPromised = require('chai-as-promised')
const { expect } = chai
chai.use(chaiAsPromised)
import { uid, Resource } from "../../src/Models/types"
const { resetSchema, schema } = require('../../src/Models/database/queries')
import { ResourceType } from '../../src/Models/classes/resourceType'
// * Setup framework (database, server, testing) * //
import { db } from '../../src/Models/database/instance'
const server = require('../../src/Controller/routes')

// * Variables for testing
import {
    agentsInput,
    agentsInputCS,
    resourceTypesInput,
} from '../data'
let agentIds : Array<uid> = []
let resourceType1 : ResourceType
let resourceType2 : ResourceType
let agentWithResourceId : uid
let resource : Resource


// * Tests of agent api * //
describe('Agent', () => {
    before(() => db.none(resetSchema)) // Drop if tables already exist
    before(() => db.none(schema)) // Create all needed tables
    before(async () => {
        const resResourceT = await chai.request(server).post('/api/resourcetypes').send({rtypes: resourceTypesInput})
        resourceType1 = resResourceT.body[0]
        resourceType2 = resResourceT.body[1]
        resource = 0.5
    })

    it('Add multiple agents to database at once without resources', async () => {
        await Promise.all( agentsInputCS.map(async a => { 
            const res = await chai.request(server).post('/api/agents').send(a)
            expect(res).to.have.status(200)
        }))
    })

    it('GET list of all agents', async () => {
        const res = await chai.request(server).get('/api/agents')

        // Adding to global agentIds var to use agent ids in other tests
        agentIds.push(res.body.map(data => data.id))
        agentIds = agentIds.flat(1)

        expect(res).to.have.status(200)
        expect(res.body).to.have.length(agentIds.length)
        expect(res.body.every(agent => expect(agent).to.have.property('id').with.lengthOf(36)))
    })

    it('GET an agent based on its id', async () => {
        const res = await chai.request(server).get(`/api/agents/${agentIds[0]}`)
        expect(res).to.have.status(200)
        expect(res.body.id).to.eq(agentIds[0])
    })


    it('Add agents with resources to database all at once', async () => {
        const agentRes = await chai.request(server).post('/api/agents').send(agentsInput[0])
        expect(agentRes).to.have.status(200)
        expect(agentRes.body).to.have.property('id')
        expect(agentRes.body).to.have.property('name')
        expect(agentRes.body).to.have.property('type')
        expect(agentRes.body).to.have.property('key')
        agentWithResourceId = agentRes.body.id // store for other test

        const amount = 0.1
        const rs = [{type: resourceType1.id, amount: amount}, {type: resourceType2.id, amount: amount}]
        const transfer = {transferor: 'INIT', transferee: agentWithResourceId, info: {}, resources: rs}
        const res = await chai.request(server).post('/api/transfers').send(transfer)
        expect(res).to.have.status(200)
        res.body.forEach(t => {
            expect(t).to.have.property('id')
            expect(t).to.have.property('transferor')
            expect(t).to.have.property('transferee')
            expect(t).to.have.property('type')
            expect(t).to.have.property('amount')
            expect(t).to.have.property('time_of_effect')
            expect(t).to.have.property('info')
        })
    }) 

    it('GET an agents resource holding based on agent id', async () => {
        const res = await chai.request(server).get(`/api/agent-holdings/${agentWithResourceId}`)
        expect(res).to.have.status(200)
        res.body.forEach(a => {
            expect(a).to.have.property('agent')
            expect(a).to.have.property('type')
            expect(a).to.have.property('amount')
        })
    })
    
    after( () => db.none(resetSchema))
})