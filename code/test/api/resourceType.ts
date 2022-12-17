process.env.NODE_ENV = 'test'

import 'mocha'
import 'chai-http'
import * as chai from 'chai'
chai.use(require('chai-http'))
const { resetSchema, schema } = require('../../src/Models/database/queries')
import { resourceTypesInput } from '../data'

// * Setup framework (database, server, testing)
import { db } from '../../src/Models/database/instance'
const server = require('../../src/Controller/routes')
const { expect } = chai


// * Tests * //
describe('Resource Type', () => {
    before(() => db.none(resetSchema)) // Drop if tables already exist
    before(() => db.none(schema)) // Create all needed tables
    after( () => db.none(resetSchema))

    // * Testing Resource Type
    it('Add resource types to the database', async () => {
        const res = await chai.request(server).post('/api/resourcetypes').send({rtypes: resourceTypesInput})
        expect(res).to.have.status(200)
    })

    it('GET list of all resource types', async () => {
        const res = await chai.request(server).get('/api/resourcetypes')
        expect(res).to.have.status(200)
        expect(res.body).to.have.length(resourceTypesInput.length)
    })
})