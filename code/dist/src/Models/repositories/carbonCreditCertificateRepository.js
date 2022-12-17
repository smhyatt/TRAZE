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
exports.CarbonCreditCertificateRepo = void 0;
const pgp = require('pg-promise')({ capSQL: true });
const instance_1 = require("../database/instance");
const { getCarbonCreditCertificates, getCarbonCreditCertificate, createCarbonCreditCertificate, checkCCCAreasOverlap, deleteCCCById, cccExists, } = require('../database/queries');
class CarbonCreditCertificateRepo {
    buildCarbonCreditCertificateDB(ccc) {
        let polygon = "POLYGON((";
        ccc.area.area.forEach(l => {
            polygon = `${polygon}${l.longitude.toString()} ${l.latitude.toString()}, `;
        });
        const fstLoc = ccc.area.area[0];
        polygon = `${polygon.slice(0, -2)}, ${fstLoc.longitude} ${fstLoc.latitude}))`;
        return {
            id: ccc.id,
            area: polygon,
            start_time: ccc.time_period.startTime,
            end_time: ccc.time_period.endTime,
            evidence: ccc.evidence,
        };
    }
    buildAreasFromDB(cccDB) {
        let acc = [];
        cccDB.area
            .slice(9, -2)
            .split(',') //new RegExp('[,]'))
            .map(tp => {
            let t = tp.split(' ').map(Number);
            acc.push({ longitude: t[0], latitude: t[1] });
        });
        return {
            id: cccDB.id,
            id2: cccDB.id2,
            area: acc,
            equalAreas: cccDB.equal,
            endTimeEqualsStartTime: cccDB.endtimeequalsstarttime,
        };
    }
    addCarbonCreditCertificate(ccc) {
        return __awaiter(this, void 0, void 0, function* () {
            const cccDB = this.buildCarbonCreditCertificateDB(ccc);
            return yield instance_1.db.one(createCarbonCreditCertificate, cccDB).then(cccId => { return cccId; });
        });
    }
    getOverlappingArea(cid) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.any(checkCCCAreasOverlap).then(overlaps => {
                if (overlaps.length > 0 && overlaps != null) {
                    let l = overlaps.map(r => { return this.buildAreasFromDB(r); });
                    if (l[0].id2 == cid) {
                        return l[0];
                    }
                    const i = l.length - 2;
                    if (l[i].id2 == cid) {
                        return l[i];
                    }
                }
                return null;
            });
        });
    }
    deleteCarbonCreditCertificateById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.any(deleteCCCById, id).then(res => { return res; });
        });
    }
    selectCarbonCreditCertificateById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.one(getCarbonCreditCertificate, id).then(data => { return data; });
        });
    }
    selectCarbonCreditCertificates() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.any(getCarbonCreditCertificates).then(data => { return data; });
        });
    }
    cccExists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.one(cccExists, id).then(b => { return b.exists; });
        });
    }
}
exports.CarbonCreditCertificateRepo = CarbonCreditCertificateRepo;
//# sourceMappingURL=carbonCreditCertificateRepository.js.map