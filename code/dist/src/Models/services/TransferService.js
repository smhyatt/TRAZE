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
exports.TransferService = void 0;
const transfer_1 = require("../classes/transfer");
const resource_1 = require("../classes/resource");
const types_1 = require("../types");
class TransferService {
    constructor(rm, tr, ar, rtr, cccr) {
        Object.defineProperty(this, "agentRepo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "transferRepo", {
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
        Object.defineProperty(this, "resourceManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "designatedAgent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.resourceManager = rm;
        this.transferRepo = tr;
        this.agentRepo = ar;
        this.resourceTypeRepo = rtr;
        this.carbonCreditCertificateRepo = cccr;
    }
    selectTransfer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            this.handleSendWithReturn(res, this.transferRepo.selectTransferById, id, "Transfer not found.");
        });
    }
    selectTransferByAgentId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            this.handleSendWithReturn(res, this.transferRepo.selectTransferByAgentId, id, "Error getting transfers by transferee");
        });
    }
    insertTransfer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { transferor, transferee, info, resources } = req.body;
            // * Ensure that the sender and recipient are not the same
            if (transferor === transferee) {
                return res.status(400).send({ error: 'Transferor and transferee must be different.' });
            }
            // * Fetch the agent objects of the transferor if there is any, otherwise use the resource manager
            let transferorObj;
            if (transferor === "INIT") {
                this.insertDesignatedAgent();
                transferor = this.resourceManager.id;
                transferorObj = this.resourceManager;
            }
            else {
                transferorObj = yield this.agentRepo.selectAgentById(transferor)
                    .catch(err => { return res.status(400).send({ error: `The agent with id: ${transferor} does not exist`, msg: err }); });
            }
            // * Fetch the agent objects of the transferee
            const transfereeObj = yield this.agentRepo.selectAgentById(transferee)
                .catch(err => { return res.status(400).send({ error: `The agent with id: ${transferee} does not exist`, msg: err }); });
            let resourcesM = new Map();
            let transferDB = [];
            let transferId;
            let time;
            yield Promise.all(resources.map((r) => __awaiter(this, void 0, void 0, function* () {
                let amount = Number(r.amount);
                // Extract the resource type object from the database (TODO: change to RM)
                let resourceType = yield this.resourceTypeRepo.selectResourceTypeById(r.type)
                    .catch(err => { return res.status(400).send({ error: `The resource type with id: ${r.type} does not exist`, msg: err }); });
                const resourceTypeIsCCC = yield this.carbonCreditCertificateRepo.cccExists(r.type);
                if (resourceTypeIsCCC) {
                    if (amount > 1) {
                        return res.status(400).send({ error: `There can maximum exist a whole CCC (1.0).` });
                    }
                    let alreadyOwned = 0;
                    for (let [agent, rs] of this.resourceManager.ownership.entries()) {
                        if (agent.id != this.resourceManager.id) {
                            alreadyOwned = alreadyOwned + rs.get(resourceType);
                        }
                    }
                    if (!(1 >= amount + alreadyOwned)) {
                        return res.status(400).send({ error: `There can maximum exist a whole CCC (1.0).` });
                    }
                }
                resourcesM.set(resourceType, amount);
                if (transferDB.length === 0) {
                    // * Only need to update transferId and time once, the first time data is put in transferDB
                    transferDB.push(new types_1.TransferDB('INIT', transferor, transferee, r.type, amount, 'INIT', info));
                    transferId = transferDB[0].id;
                    time = transferDB[0].time_of_effect;
                }
                else {
                    transferDB.push(new types_1.TransferDB(transferId, transferor, transferee, r.type, amount, time, info));
                }
            })));
            const resources_ = new resource_1.Resources(resourcesM);
            const transfer = new transfer_1.Transfer(new Map([
                [transferorObj, resource_1.Resources.mult(-1, resources_)],
                [transfereeObj, resources_]
            ]));
            // * Ensure the transfer is valid
            const valid = this.resourceManager.applyTransfer(transfer);
            if (valid) {
                const ownershipDB = this.getOwnershipsFromTransfer(transferDB);
                this.handleSendWithReturn(res, this.transferRepo.addTransfer, { transferDB, ownershipDB }, "Error storing transfers.");
            }
            else {
                return res.status(400).send({ error: `Transfer ${transferId} was not valid (service).` });
            }
        });
    }
    getOwnershipsFromTransfer(transfer) {
        const res = [];
        transfer.forEach(t => {
            const transferorAmount = this.resourceManager.getAmountOfTypeFromState(t.transferor, t.type, this.resourceManager.ownership);
            const transfereeAmount = this.resourceManager.getAmountOfTypeFromState(t.transferee, t.type, this.resourceManager.ownership);
            // ! OBS. it currently stores ownerships even if the amount is 0 
            // * Note that we do not need to add or subtract the transferring amount, because the transfer is already stored in 
            // * the resource manager and its ownershipstate, so we are merely extracting the amount after the transfer.
            res.push({ agent: t.transferor, type: t.type, amount: Number(transferorAmount) });
            res.push({ agent: t.transferee, type: t.type, amount: Number(transfereeAmount) });
        });
        return res;
    }
    insertDesignatedAgent() {
        return __awaiter(this, void 0, void 0, function* () {
            this.designatedAgent = this.resourceManager.getRMAgent;
            yield this.agentRepo.addDesignatedAgent(this.designatedAgent)
                .catch(err => { throw Error(`Could not insert designated agent in db. Error message: ${err}`); });
        });
    }
    handleSendWithReturn(res, fun, params, errMsg) {
        return __awaiter(this, void 0, void 0, function* () {
            yield fun(params)
                .then(data => { return res.send(data); })
                .catch(error => { return res.status(400).send({ error: errMsg, msg: error }); });
        });
    }
}
exports.TransferService = TransferService;
//# sourceMappingURL=TransferService.js.map