process.env.NODE_ENV = 'test'
import 'mocha'
import 'chai-http'
import * as chai from 'chai'
chai.use(require('chai-http'))
const { resetSchema, schema } = require('../../src/Models/database/queries')
import { db } from '../../src/Models/database/instance'

import { ResourceType } from '../../src/Models/classes/resourceType'
import { Resources } from '../../src/Models/classes/resource'
import { Transfer } from '../../src/Models/classes/transfer'
import { Agent } from '../../src/Models/classes/agent'

const agent = new Agent("Alice", "Farmer grl")
const rtype = new ResourceType("USD", 1)
const resources = new Resources(new Map([[rtype, 500]]))

describe('Transfer class tests', () => {
    before(() => db.none(resetSchema))
    before(() => db.none(schema))

    it('Cannot initialize transfer if sum total is different from 0', async () => {
        try { new Transfer(new Map([[agent, resources]])) }
        catch { err => err.must.be.error }
    })
})