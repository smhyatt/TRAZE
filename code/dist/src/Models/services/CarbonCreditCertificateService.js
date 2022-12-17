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
exports.CarbonCreditCertificateService = void 0;
const area_1 = require("../classes/area");
const resourceType_1 = require("../classes/resourceType");
const carbonCreditCertificate_1 = require("../classes/carbonCreditCertificate");
class CarbonCreditCertificateService {
    constructor(rtr, cccr) {
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
        this.resourceTypeRepo = rtr;
        this.carbonCreditCertificateRepo = cccr;
    }
    /* Input format:
    * { name: string,
    *   valuation: number, // CO2-eq
    *   time_period: {
    *       startTime: date,
    *       endTime: date
    *   },
    *   area: [ { longiitude: number, latitude: number} ],
    *   evidence: json } */
    insertCarbonCreditCertificate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, valuation, time_period, area, evidence } = req.body;
            const area_ = new area_1.Area(area);
            const resourceType = new resourceType_1.ResourceType(name, Number(valuation));
            const cccId = resourceType.id;
            const ccc = new carbonCreditCertificate_1.CarbonCreditCertificate(name, Number(valuation), time_period, area_, evidence, cccId);
            yield this.resourceTypeRepo.addResourceType([resourceType])
                .catch(err => { return res.status(400).send({ error: "Error storing carbon credit certificate in db (rt)", msg: err }); });
            const resCCCid = yield this.carbonCreditCertificateRepo.addCarbonCreditCertificate(ccc)
                .catch(err => { return res.status(400).send({ error: "Error storing carbon credit certificate in db (ccc)", msg: err }); });
            const overlapping = yield this.carbonCreditCertificateRepo.getOverlappingArea(cccId)
                .catch(err => { return res.status(400).send({ error: "Error getting info about overlapping areas of carbon credit certificates", msg: err }); });
            if (overlapping != null) { // Overlapping areas
                // If is exact same area as in other CCC, and time periods are in sequence all is fine
                if (overlapping.equalAreas && overlapping.endTimeEqualsStartTime) {
                    return res.send(resCCCid);
                }
                else {
                    yield this.carbonCreditCertificateRepo.deleteCarbonCreditCertificateById(cccId);
                    yield this.resourceTypeRepo.deleteResourceTypeById(cccId);
                    return res.status(400).send({ error: "The carbon credit certificates area overlaps with another area, and/or start time is not in sequence with end time" });
                }
            }
            else { // No overlapping areas
                return res.send(resCCCid);
            }
        });
    }
    selectCarbonCreditCertificate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            let rt = yield this.resourceTypeRepo.selectResourceTypeById(id)
                .catch(err => { return res.status(400).send({ error: "Error getting carbon credit certificate", msg: err }); });
            let ccc = yield this.carbonCreditCertificateRepo.selectCarbonCreditCertificateById(id)
                .catch(err => { return res.status(400).send({ error: "Error getting carbon credit certificate", msg: err }); });
            return res.send({ rt, ccc });
        });
    }
    selectCarbonCreditCertificates(res) {
        return __awaiter(this, void 0, void 0, function* () {
            let rt = yield this.resourceTypeRepo.selectResourceTypes()
                .catch(err => { return res.status(400).send({ error: "Error getting carbon credit certificate", msg: err }); });
            let ccc = yield this.carbonCreditCertificateRepo.selectCarbonCreditCertificates()
                .catch(err => res.status(400).send({ error: "Error getting carbon credit certificates", msg: err }));
            return res.send({ rt, ccc });
        });
    }
}
exports.CarbonCreditCertificateService = CarbonCreditCertificateService;
//# sourceMappingURL=CarbonCreditCertificateService.js.map