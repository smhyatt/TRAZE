process.env.NODE_ENV = 'test'
import 'mocha'
import 'chai-http'
import * as chai from 'chai'
chai.use(require('chai-http'))
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
import { uid } from "../../src/Models/types"
const server = require('../../src/Controller/routes')

const printTransformationI = (ts, i) => console.log({transformation:ts[i].t, input: ts[i].in, output: ts[i].out })
const printTransformation = (ts) => ts.forEach(t => { console.log({transformation:t.t, input: t.in, output: t.out }) });

async function getTransformationsOwnedByAgent(agentId) {
    const trOwner = await chai.request(server).get(`/api/transformations/owner/${agentId}`)
    let transformations = []
    await Promise.all(trOwner.body.map(async t => { 
        const ti = await chai.request(server).get(`/api/transformation-inputs/${t.id}`)
        const to = await chai.request(server).get(`/api/transformation-outputs/${t.id}`)
        transformations.push({ t: t, in: ti.body, out: to.body})
    }))
    return transformations
}

async function getTransportsOwnedByAgent(agentId) {
    return await chai.request(server).get(`/api/transports/owner/${agentId}`)
    .then(transports => { return transports.body })
    .catch(error => { return error })
}

async function getCarbonFromCoffeeTransports(transports) : Promise<number> {
    let sum = 0
    await Promise.all(transports.map(async transport => {
        const resourceTypeId = transport.resource_type
        const resourceType = await chai.request(server).get(`/api/resourcetypes/${resourceTypeId}`)
        sum = sum + (transport.distance * (transport.amount * resourceType.body.valuation)/10000000)
    }))
    return sum
}

async function getCarbonFromCoffeeTransformation(transformations, wetParchmentId, dryParchmentId) : Promise<number> {
    let sum = 0
    await Promise.all(transformations.map(async transformation => {
         /*  input type:                                    // - output
         *      coffee cherry: amount * valuation * 0.000004
         *      wet parchment: amount * valuation * 0.000009
         *      dry parchment: amount * valuation * 0.000050 */
        const inputAmount = transformation.in[0].amount
        const resourceTypeId = transformation.in[0].type
        const resourceTypeRes = await chai.request(server).get(`/api/resourcetypes/${resourceTypeId}`)
        const resourceType = resourceTypeRes.body
        let c
        let outAmount
        if (resourceType.name == 'Coffee cherry') {
            c = 0.000004
            try {
                let o1 = transformation.out[0]
                let o2 = transformation.out[1]
                if (o1.type == wetParchmentId) { outAmount = o1.amount } else { outAmount = o2.amount }
            } catch(_) { throw Error('Must be 2 outputs (wet parchment and pulp) when transforming cherries')}
        } else if (resourceType.name == 'Wet parchment') {
            c = 0.000009
            try {
                let o1 = transformation.out[0]
                let o2 = transformation.out[1]
                if (o1.type == dryParchmentId) { outAmount = o1.amount } else { outAmount = o2.amount }
            } catch(_) { throw Error('Must be 2 outputs when transforming wet parchment')}
        } else if (resourceType.name == 'Dry parchment') {
            c = 0.000050
            outAmount = 0.1
        } else { throw Error('No resource type match in coffee transformation') }

        let carbonAmount = inputAmount * resourceType.valuation * c - (outAmount * 0.0000005)
        sum = sum + carbonAmount
    }))

    return sum
}

async function modelForCarbonUsageOfAgent(agentId, wetParchmentId, dryParchmentId) {
    const transports = await getTransportsOwnedByAgent(agentId)
    const carbonTransport = await getCarbonFromCoffeeTransports(transports)

    const transformations = await getTransformationsOwnedByAgent(agentId)
    const carbonTransformation = await getCarbonFromCoffeeTransformation(transformations, wetParchmentId, dryParchmentId)

    return carbonTransport + carbonTransformation
}

async function getTransfersAgentParticipatesIn(agentId) {
    return await chai.request(server).get(`/api/transfers/agent/${agentId}`)
    .then(res => { return res.body })
    .catch(error => { return error })
}

function getTransferors(transfers, agentId: uid) : Set<any> {
    let transferors = new Set()
    transfers.map(t => 
        t.transferor != agentId ? transferors.add(t.transferor) : transferors.add(t.transferee)
    )
    return transferors
}

async function immediateNeighbors(agentId, wetParchmentId, dryParchmentId) : Promise<number> {
    const transfers = await getTransfersAgentParticipatesIn(agentId)
    const transferors = getTransferors(transfers, agentId)

    let sum = 0
    for (let transferor of transferors) {
         const carbonOfTransferor = await modelForCarbonUsageOfAgent(transferor, wetParchmentId, dryParchmentId)
         sum = sum + carbonOfTransferor
    }
    return sum
}

export { immediateNeighbors, modelForCarbonUsageOfAgent }