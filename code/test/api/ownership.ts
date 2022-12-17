process.env.NODE_ENV = 'test'

import 'mocha'
import 'chai-http'
import * as chai from 'chai'
chai.use(require('chai-http'))
const { resetSchema, schema } = require('../../src/Models/database/queries')
import { ResourceType } from '../../src/Models/classes/resourceType'

// * Setup framework (database, server, testing) * //
import { db } from '../../src/Models/database/instance'
const server = require('../../src/Controller/routes')
const { expect } = chai

// * Variables for testing * //
import { agentsInput, resourceTypesInput } from '../data'

let resourceType1 : ResourceType
let resourceType2 : ResourceType
let agents = []

// * Tests * //
describe('Ownership', () => {
    before(() => db.none(resetSchema))
    before(() => db.none(schema))
    before(async () => {
        // * Setup resource types.
        const resRtypes = await chai.request(server).post('/api/resourcetypes').send({rtypes: resourceTypesInput})
        resourceType1 = resRtypes.body[0]
        resourceType2 = resRtypes.body[1]

        await Promise.all( agentsInput.map(async a => { 
            const agentRes = await chai.request(server).post('/api/agents').send(a)
            expect(agentRes).to.have.status(200)
            agents.push(agentRes.body[0])
        }))
    })
    after( () => db.none(resetSchema))

    it('Ensure that ownerships are created for multiple agents and resources.', async () => {
        const rs = [{type: resourceType1.id, amount: 0.3}, {type: resourceType2.id, amount: 0.8}]
        agents.forEach(async agent => {
            const transfer = {transferor: 'INIT', transferee: agent.id, info: {}, resources: rs}
            const res = await chai.request(server).post('/api/transfers').send(transfer)
            expect(res).to.have.status(200)
        })

        const ownerships = await chai.request(server).get('/api/ownerships')
        ownerships.body.forEach(o => {
            expect(o).to.have.property('agent')
            expect(o).to.have.property('type')
            expect(o).to.have.property('amount')
        })
    })
})

