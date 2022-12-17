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
exports.RetireCCCService = void 0;
const transfer_1 = require("../classes/transfer");
const resource_1 = require("../classes/resource");
const { v4: uuidv4 } = require('uuid');
class RetireCCCService {
    constructor(rm, rcccr, ar, rtr, cccr) {
        Object.defineProperty(this, "retireCCCRepo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "agentRepo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "resourceTypeRepo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "carbonCreditCertificateRepo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "atmosphere", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "resourceManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.resourceManager = rm;
        this.retireCCCRepo = rcccr;
        this.agentRepo = ar;
        this.resourceTypeRepo = rtr;
        this.carbonCreditCertificateRepo = cccr;
    }
    selectRetiredCCC(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            yield this.retireCCCRepo.selectRetiredById(id)
                .then(data => { return res.send(data); })
                .catch(err => { return res.status(400).send({ error: "Error getting transport", msg: err }); });
        });
    }
    selectRetiredCCCs(res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.retireCCCRepo.selectAllRetired()
                .then(data => { return res.send(data); })
                .catch(err => { return res.status(400).send({ error: "Error getting retire transfers", msg: err }); });
        });
    }
    insertAtmosphere() {
        return __awaiter(this, void 0, void 0, function* () {
            this.atmosphere = this.resourceManager.Atmosphere;
            yield this.agentRepo.addDesignatedAgent(this.atmosphere)
                .catch(err => { throw Error(`Could not insert atmosphere agent in db. Error message: ${err}`); });
        });
    }
    insertRetireCCC(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { transferor, carbon_credit_certificate, amount } = req.body;
            yield this.insertAtmosphere();
            const agent = yield this.agentRepo.selectAgentById(transferor)
                .catch(err => { return res.status(400).send({ error: `The agent with id: ${transferor} does not exist`, msg: err }); });
            const ccc = yield this.carbonCreditCertificateRepo.selectCarbonCreditCertificateById(carbon_credit_certificate)
                .catch(err => { return res.status(400).send({ error: "Error getting carbon credit certificate", msg: err }); });
            let resourceType = yield this.resourceTypeRepo.selectResourceTypeById(carbon_credit_certificate)
                .catch(err => { return res.status(400).send({ error: `The resource type with id: ${carbon_credit_certificate} does not exist`, msg: err }); });
            const resource = new resource_1.Resources(new Map([[resourceType, amount]]));
            const transfer = new transfer_1.Transfer(new Map([
                [this.atmosphere, resource],
                [agent, resource_1.Resources.mult(-1, resource)]
            ]));
            const validTransfer = this.resourceManager.applyTransfer(transfer);
            if (validTransfer) {
                let ownershipRows = [
                    { agent: transferor, type: carbon_credit_certificate, amount: Number(this.resourceManager.ownership.get(agent).get(ccc)) },
                    { agent: this.atmosphere.id, type: carbon_credit_certificate, amount: Number(this.resourceManager.ownership.get(this.atmosphere).get(ccc)) }
                ];
                let retireRow = [{ id: uuidv4(), transferor: transferor, type: carbon_credit_certificate, amount: Number(amount), time_of_effect: new Date() }];
                yield this.retireCCCRepo.addRetireTransfer(retireRow, ownershipRows)
                    .then(data => { return res.send(data); })
                    .catch(err => { return res.status(400).send({ error: "Error storing retire transfer in db", msg: err }); });
            }
            else {
                return res.status(400).send({ error: "The retirement of the carbon credit certificate by transfer to the atmosphere is not valid (service)." });
            }
        });
    }
}
exports.RetireCCCService = RetireCCCService;
//# sourceMappingURL=RetireCCCService.js.map