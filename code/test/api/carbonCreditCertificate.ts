process.env.NODE_ENV = 'test'

import 'mocha'
import 'chai-http'
import * as chai from 'chai'
chai.use(require('chai-http'))
const { resetSchema, schema } = require('../../src/Models/database/queries')
import { uid } from '../../src/Models/types'
import { db } from '../../src/Models/database/instance'
const server = require('../../src/Controller/routes')
const { expect } = chai
 
// Variables for testing
let cccIds : uid[] = []
let cccId : uid

describe('Carbon credit certificates', () => {
    before(() => db.none(resetSchema))
    before(() => db.none(schema))

    it('Add carbon credit certificate (CCC)', async () => {
        // Setup
        const ccc = {
            name: "The best CCC",
            valuation: 24000, // CO2-eq
            time_period: {
                startTime: new Date(),
                endTime: new Date(),
            },
            area: [
                { longitude: 0, latitude: 0 },
                { longitude: 0, latitude: 5 },
                { longitude: 5, latitude: 5 },
                { longitude: 5, latitude: 0 },
            ],
            evidence: {}
        }
        // Act
        const res = await chai.request(server).post('/api/carbon-credit-certificates').send(ccc)
        // Assert
        expect(res).to.have.status(200)
        cccIds.push(res.body.id)
        cccId = res.body.id
    })
    
    it('Add carbon credit certificates not overlapping', async () => {
        // Setup
        const ccc = {
            name: "The next best CCC",
            valuation: 11000, // CO2-eq
            time_period: {
                startTime: new Date(),
                endTime: new Date(),
            },
            area: [
                { longitude: 12, latitude: 12 },
                { longitude: 12, latitude: 13 },
                { longitude: 13, latitude: 13 },
                { longitude: 13, latitude: 12 },
            ],
            evidence: {}
        }
        const ccc2 = {
            name: "The third best CCC",
            valuation: 50000, // CO2-eq
            time_period: {
                startTime: new Date(),
                endTime: new Date(),
            },
            area: [
                { longitude: 14, latitude: 14 },
                { longitude: 14, latitude: 20 },
                { longitude: 20, latitude: 20 },
                { longitude: 20, latitude: 14 },
            ],
            evidence: {}
        }
        // Act
        const res = await chai.request(server).post('/api/carbon-credit-certificates').send(ccc)
        const res2 = await chai.request(server).post('/api/carbon-credit-certificates').send(ccc2)
        cccIds.push(res.body.id)
        cccIds.push(res2.body.id)
        // Assert
        expect(res).to.have.status(200)
        expect(res2).to.have.status(200)
    })
    
    it('Do not add carbon credit certificate when area overlap with area of other CCC', async () => {
        // Setup
        const ccc = {
            name: "The best overlapping CCC",
            valuation: 11000, // CO2-eq
            time_period: {
                startTime: new Date(),
                endTime: new Date(),
            },
            area: [
                { longitude: 4.5, latitude: 4.5 },
                { longitude: 4.5, latitude: 6 },
                { longitude: 6,   latitude: 6 },
                { longitude: 6,   latitude: 4.5 },
            ],
            evidence: {}
        }
        // Act
        const res = await chai.request(server).post('/api/carbon-credit-certificates').send(ccc)
        // Assert
        expect(res).to.have.status(400)
    })

    it('Add CCC2 if area is exactly the same as area of some CCC1, and CCC2 start time is in sequence with end time of CCC1', async () => {
        // Setup
        const ccc = {
            name: "The first best CCC",
            valuation: 1000000, // CO2-eq
            time_period: {
                startTime: new Date('2018-01-01'),
                endTime: new Date('2019-01-01'),
            },
            area: [
                { longitude: 7, latitude: 7 },
                { longitude: 7, latitude: 9 },
                { longitude: 9, latitude: 7 },
            ],
            evidence: {}
        }
        const ccc2 = {
            name: "The second, in sequence, best CCC",
            valuation: 50000, // CO2-eq
            time_period: {
                startTime: new Date('2019-01-01'),
                endTime: new Date('2019-12-01'),
            },
            area: [
                { longitude: 7, latitude: 9 },
                { longitude: 9, latitude: 7 },
                { longitude: 7, latitude: 7 },
            ],
            evidence: {}
        }
        // Act
        const res = await chai.request(server).post('/api/carbon-credit-certificates').send(ccc)
        const res2 = await chai.request(server).post('/api/carbon-credit-certificates').send(ccc2)
        cccIds.push(res.body.id)
        cccIds.push(res2.body.id)
        // Assert
        expect(res).to.have.status(200)
        expect(res2).to.have.status(200)
    })

    it('Do not add CCC2 if area is exactly the same as area of some CCC1, and CCC2 time period overlaps with CC1 time period', async () => {
        // Setup
        const ccc = {
            name: "The first best CCC",
            valuation: 1000000, // CO2-eq
            time_period: {
                startTime: new Date('2021-01-16'),
                endTime: new Date('2022-02-20'),
            },
            area: [
                { longitude: 10, latitude: 10 },
                { longitude: 10, latitude: 11 },
                { longitude: 11, latitude: 10 },
            ],
            evidence: {}
        }
        const ccc2 = {
            name: "The second, in sequence, best CCC",
            valuation: 50000, // CO2-eq
            time_period: {
                startTime: new Date('2022-01-22'),
                endTime: new Date('2022-03-07'),
            },
            area: [
                { longitude: 10, latitude: 11 },
                { longitude: 11, latitude: 10 },
                { longitude: 10, latitude: 10 },
            ],
            evidence: {}
        }
        // Act
        const res = await chai.request(server).post('/api/carbon-credit-certificates').send(ccc)
        const res2 = await chai.request(server).post('/api/carbon-credit-certificates').send(ccc2)
        cccIds.push(res.body.id)
        // Assert
        expect(res).to.have.status(200)
        expect(res2).to.have.status(400)
    })

    it('Get carbon credit certificate', async () => {
        // Act
        const res = await chai.request(server).get(`/api/carbon-credit-certificates/${cccId}`)
        // Assert
        expect(res.body.ccc.id).to.equal(cccId)
        expect(res).to.have.status(200)
    })

    it('Get carbon credit certificates', async () => {
        // Act
        const res = await chai.request(server).get('/api/carbon-credit-certificates')
        // Assert
        expect(res.body.ccc).to.have.length(cccIds.length)
        expect(res.body.ccc[1].id).to.equal(cccIds[1])
        expect(res).to.have.status(200)
    })

   after(() => db.none(resetSchema))
})