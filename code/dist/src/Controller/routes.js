"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const agentRepository_1 = require("../Models/repositories/agentRepository");
const transferRepository_1 = require("../Models/repositories/transferRepository");
const locationRepository_1 = require("../Models/repositories/locationRepository");
const ownershipRepository_1 = require("../Models/repositories/ownershipRepository");
const transportRepository_1 = require("../Models/repositories/transportRepository");
const retireCCCRepository_1 = require("../Models/repositories/retireCCCRepository");
const resourceRepository_1 = require("../Models/repositories/resourceRepository");
const transformationRepository_1 = require("../Models/repositories/transformationRepository");
const carbonCreditCertificateRepository_1 = require("../Models/repositories/carbonCreditCertificateRepository");
const AgentService_1 = require("../Models/services/AgentService");
const TransferService_1 = require("../Models/services/TransferService");
const LocationService_1 = require("../Models/services/LocationService");
const OwnershipService_1 = require("../Models/services/OwnershipService");
const RetireCCCService_1 = require("../Models/services/RetireCCCService");
const TransportService_1 = require("../Models/services/TransportService");
const ResourceTypeService_1 = require("../Models/services/ResourceTypeService");
const TransformationService_1 = require("../Models/services/TransformationService");
const CarbonCreditCertificateService_1 = require("../Models/services/CarbonCreditCertificateService");
const resourceManager_1 = require("../Models/classes/resourceManager");
const express = require('express'); // For Node.js
// *  Setup node.js instance  * //
const app = express(); // Node.js instance
app.use(express.json());
// *   GET requests   * //
/* A GET request fetches data from the database and returns it to the API user */
app.get('/api/agents', (_, res) => __awaiter(void 0, void 0, void 0, function* () { return ah.selectAgents(res); }));
app.get('/api/agents/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () { return ah.selectAgent(req, res); }));
app.get('/api/agent-holdings/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () { return ah.selectAgentHolding(req, res); }));
app.get('/api/resourcetypes/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () { return rth.selectResourceTypeById(req, res); }));
app.get('/api/resourcetypes', (_, res) => __awaiter(void 0, void 0, void 0, function* () { return rth.selectResourceTypes(res); }));
app.get('/api/ownerships', (_, res) => __awaiter(void 0, void 0, void 0, function* () { return oh.selectOwnerships(res); }));
app.get('/api/ownershipstate', (_, res) => __awaiter(void 0, void 0, void 0, function* () { return oh.getOwnershipstate(res); }));
app.get('/api/transfers/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () { return tfh.selectTransfer(req, res); }));
app.get('/api/transfers/agent/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () { return tfh.selectTransferByAgentId(req, res); }));
app.get('/api/locations', (_, res) => __awaiter(void 0, void 0, void 0, function* () { return lh.selectLocations(res); }));
app.get('/api/locations/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () { return lh.selectLocation(req, res); }));
app.get('/api/location-states', (_, res) => __awaiter(void 0, void 0, void 0, function* () { return lh.selectLocationStates(res); }));
app.get('/api/transports/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () { return tph.selectTransport(req, res); }));
app.get('/api/transports', (_, res) => __awaiter(void 0, void 0, void 0, function* () { return tph.selectTransports(res); }));
app.get('/api/transports/owner/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () { return tph.selectTransportsByAgent(req, res); }));
app.get('/api/transformations', (_, res) => __awaiter(void 0, void 0, void 0, function* () { return trh.selectTransformations(res); }));
app.get('/api/transformations/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () { return trh.selectTransformation(req, res); }));
app.get('/api/transformations/owner/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () { return trh.selectTransformationByOwner(req, res); }));
app.get('/api/transformation-inputs/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () { return trh.selectTransformationInput(req, res); }));
app.get('/api/transformation-outputs/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () { return trh.selectTransformationOutput(req, res); }));
app.get('/api/carbon-credit-certificates/retire/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () { return rccch.selectRetiredCCC(req, res); }));
app.get('/api/carbon-credit-certificates/retire', (_, res) => __awaiter(void 0, void 0, void 0, function* () { return rccch.selectRetiredCCCs(res); }));
app.get('/api/carbon-credit-certificates/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () { return ccch.selectCarbonCreditCertificate(req, res); }));
app.get('/api/carbon-credit-certificates', (_, res) => __awaiter(void 0, void 0, void 0, function* () { return ccch.selectCarbonCreditCertificates(res); }));
//app.get("/", function (_, res) { res.sendFile(path.resolve('public/index.html')) }) // Upload index.html file to localhost
// *   POST requests   * //
/* A POST request updates the database with the users input */
app.post('/api/agents', (req, res) => __awaiter(void 0, void 0, void 0, function* () { return ah.insertAgent(req, res); }));
app.post('/api/resourcetypes', (req, res) => __awaiter(void 0, void 0, void 0, function* () { return rth.insertResourceTypes(req, res); }));
app.post('/api/locations', (req, res) => __awaiter(void 0, void 0, void 0, function* () { return lh.insertLocation(req, res); }));
app.post('/api/transfers', (req, res) => __awaiter(void 0, void 0, void 0, function* () { return tfh.insertTransfer(req, res); }));
app.post('/api/transports', (req, res) => __awaiter(void 0, void 0, void 0, function* () { return tph.insertTransport(req, res); }));
app.post('/api/transformations', (req, res) => __awaiter(void 0, void 0, void 0, function* () { return trh.insertTransformation(req, res); }));
app.post('/api/carbon-credit-certificates', (req, res) => __awaiter(void 0, void 0, void 0, function* () { return ccch.insertCarbonCreditCertificate(req, res); }));
app.post('/api/carbon-credit-certificates/retire', (req, res) => __awaiter(void 0, void 0, void 0, function* () { return rccch.insertRetireCCC(req, res); }));
// Resource manager with zero balance ownership state
const rm = new resourceManager_1.ResourceManager("rm");
// Repositories
const ar = new agentRepository_1.AgentRepo();
const lr = new locationRepository_1.LocationRepo();
const or = new ownershipRepository_1.OwnershipRepo();
const tfr = new transferRepository_1.TransferRepo();
const tpr = new transportRepository_1.TransportRepo();
const rtr = new resourceRepository_1.ResourceTypeRepo();
const trr = new transformationRepository_1.TransformationRepo();
const cccr = new carbonCreditCertificateRepository_1.CarbonCreditCertificateRepo();
const rcccr = new retireCCCRepository_1.RetireCCCRepo();
// Services
const oh = new OwnershipService_1.OwnershipService(or);
const ah = new AgentService_1.AgentService(rm, ar);
const lh = new LocationService_1.LocationService(rm, lr);
const tfh = new TransferService_1.TransferService(rm, tfr, ar, rtr, cccr);
const tph = new TransportService_1.TransportService(rm, ar, tpr, lr, rtr);
const rth = new ResourceTypeService_1.ResourceTypeService(rtr);
const trh = new TransformationService_1.TransformationService(rm, ar, rtr, trr, tpr, lr);
const ccch = new CarbonCreditCertificateService_1.CarbonCreditCertificateService(rtr, cccr);
const rccch = new RetireCCCService_1.RetireCCCService(rm, rcccr, ar, rtr, cccr);
// Listing
// Start Proxy. The port must be different from regular running and testing
const port = process.env.NODE_ENV === 'test' ? 3003 : 3002;
app.listen(port, function () { console.log("Server is running on localhost:3002"); });
// For testing
module.exports = app;
//# sourceMappingURL=routes.js.map