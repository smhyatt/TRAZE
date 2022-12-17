process.env.NODE_ENV = 'test'

import 'mocha'
import 'chai-http'
import * as chai from 'chai'
chai.use(require('chai-http'))
const { resetSchema, schema } = require('../../src/Models/database/queries')
import { uid } from '../../src/Models/types'
// Setup framework (database, server, testing)
import { db } from '../../src/Models/database/instance'
const server = require('../../src/Controller/routes')
const { expect } = chai
 
// Variables for testing
import { locationsInput } from '../data'
let locationsIds : Array<uid> = []

describe('Location', () => {
    before(() => db.none(resetSchema))
    before(() => db.none(schema))
    after(() => db.none(resetSchema))

    it('Add location to database', async () => {
        const location = locationsInput[0]
        const res = await chai.request(server).post('/api/locations').send(location)
        locationsIds.push(res.body.id)
        expect(res).to.have.status(200)
    })

    it('Get location from database', async () => {
        const res = await chai.request(server).get(`/api/locations/${locationsIds[0]}`)
        expect(res.body.id).to.equal(locationsIds[0])
        expect(res).to.have.status(200)
    })

    it('Get locations from database', async () => {
        // Setup
        const res = await chai.request(server).post('/api/locations').send(locationsInput[1])
        locationsIds.push(res.body.id)
        // Act
        const res2 = await chai.request(server).get('/api/locations')
        // Assert
        expect(res2.body).to.have.length(locationsIds.length)
        expect(res2.body[1].id).to.equal(locationsIds[1])
        expect(res2).to.have.status(200)
    })    
})