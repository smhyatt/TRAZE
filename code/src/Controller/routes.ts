import { AgentRepo } from '../Models/repositories/agentRepository'
import { TransferRepo } from '../Models/repositories/transferRepository'
import { LocationRepo } from '../Models/repositories/locationRepository'
import { OwnershipRepo } from '../Models/repositories/ownershipRepository'
import { TransportRepo } from '../Models/repositories/transportRepository'
import { RetireCCCRepo } from '../Models/repositories/retireCCCRepository'
import { ResourceTypeRepo } from '../Models/repositories/resourceRepository'
import { TransformationRepo } from '../Models/repositories/transformationRepository'
import { CarbonCreditCertificateRepo } from '../Models/repositories/carbonCreditCertificateRepository'

import { AgentService } from '../Models/services/AgentService'
import { TransferService } from '../Models/services/TransferService'
import { LocationService } from '../Models/services/LocationService'
import { OwnershipService } from '../Models/services/OwnershipService'
import { RetireCCCService } from '../Models/services/RetireCCCService'
import { TransportService } from '../Models/services/TransportService'
import { ResourceTypeService } from '../Models/services/ResourceTypeService'
import { TransformationService } from '../Models/services/TransformationService'
import { CarbonCreditCertificateService } from '../Models/services/CarbonCreditCertificateService'

import { ResourceManager } from '../Models/classes/resourceManager'
const express = require('express') // For Node.js

// *  Setup node.js instance  * //
const app = express() // Node.js instance
app.use(express.json())


// *   GET requests   * //
/* A GET request fetches data from the database and returns it to the API user */
app.get('/api/agents', async (_, res) => ah.selectAgents(res))
app.get('/api/agents/:id', async (req, res) => ah.selectAgent(req, res))
app.get('/api/agent-holdings/:id', async (req, res) => ah.selectAgentHolding(req, res))
app.get('/api/resourcetypes/:id', async (req, res) => rth.selectResourceTypeById(req, res))
app.get('/api/resourcetypes', async (_, res) => rth.selectResourceTypes(res))
app.get('/api/ownerships', async (_, res) => oh.selectOwnerships(res))
app.get('/api/ownershipstate', async (_, res) => oh.getOwnershipstate(res))
app.get('/api/transfers/:id', async (req, res) => tfh.selectTransfer(req, res))
app.get('/api/transfers/agent/:id', async (req, res) => tfh.selectTransferByAgentId(req,res))
app.get('/api/locations', async (_, res) => lh.selectLocations(res))
app.get('/api/locations/:id', async (req, res) => lh.selectLocation(req, res))
app.get('/api/location-states', async (_, res) => lh.selectLocationStates(res))
app.get('/api/transports/:id', async (req, res) => tph.selectTransport(req, res))
app.get('/api/transports', async(_,res) => tph.selectTransports(res))
app.get('/api/transports/owner/:id', async(req, res) => tph.selectTransportsByAgent(req, res))
app.get('/api/transformations', async(_,res) => trh.selectTransformations(res))
app.get('/api/transformations/:id', async (req, res) => trh.selectTransformation(req, res))
app.get('/api/transformations/owner/:id', async (req, res) =>  trh.selectTransformationByOwner(req, res))
app.get('/api/transformation-inputs/:id', async (req, res) => trh.selectTransformationInput(req, res))
app.get('/api/transformation-outputs/:id', async (req, res) => trh.selectTransformationOutput(req, res))
app.get('/api/carbon-credit-certificates/retire/:id', async(req, res) => rccch.selectRetiredCCC(req, res))
app.get('/api/carbon-credit-certificates/retire', async(_, res) => rccch.selectRetiredCCCs(res))
app.get('/api/carbon-credit-certificates/:id', async(req, res) => ccch.selectCarbonCreditCertificate(req, res))
app.get('/api/carbon-credit-certificates', async(_,res) => ccch.selectCarbonCreditCertificates(res))
//app.get("/", function (_, res) { res.sendFile(path.resolve('public/index.html')) }) // Upload index.html file to localhost

// *   POST requests   * //
/* A POST request updates the database with the users input */
app.post('/api/agents', async (req, res) => ah.insertAgent(req, res))
app.post('/api/resourcetypes', async (req, res) => rth.insertResourceTypes(req, res))
app.post('/api/locations', async (req, res) => lh.insertLocation(req, res))
app.post('/api/transfers', async (req, res) => tfh.insertTransfer(req, res))
app.post('/api/transports', async (req, res) => tph.insertTransport(req, res))
app.post('/api/transformations', async (req, res) => trh.insertTransformation(req, res))
app.post('/api/carbon-credit-certificates', async(req, res) => ccch.insertCarbonCreditCertificate(req, res))
app.post('/api/carbon-credit-certificates/retire', async(req, res) => rccch.insertRetireCCC(req,res))


// Resource manager with zero balance ownership state
const rm = new ResourceManager("rm")

// Repositories
const ar = new AgentRepo()
const lr = new LocationRepo()
const or = new OwnershipRepo()
const tfr = new TransferRepo()
const tpr = new TransportRepo()
const rtr = new ResourceTypeRepo()
const trr = new TransformationRepo()
const cccr = new CarbonCreditCertificateRepo()
const rcccr = new RetireCCCRepo()

// Services
const oh = new OwnershipService(or)
const ah = new AgentService(rm, ar)
const lh = new LocationService(rm, lr)
const tfh = new TransferService(rm, tfr, ar, rtr, cccr)
const tph = new TransportService(rm, ar, tpr, lr, rtr)
const rth = new ResourceTypeService(rtr)
const trh = new TransformationService(rm, ar, rtr, trr, tpr, lr)
const ccch = new CarbonCreditCertificateService(rtr, cccr)
const rccch = new RetireCCCService(rm, rcccr, ar, rtr, cccr)


// Listing
// Start Proxy. The port must be different from regular running and testing
const port = process.env.NODE_ENV === 'test' ? 3003 : 3002
app.listen(port, function () { console.log("Server is running on localhost:3002") })


// For testing
module.exports = app
export {}
