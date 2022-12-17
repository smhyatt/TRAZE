"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarbonCreditCertificate = void 0;
const { v4: uuidv4 } = require('uuid');
class CarbonCreditCertificate {
    constructor(name, valuation, period, area, evidence, id) {
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "valuation", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "time_period", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "area", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "evidence", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = name;
        this.valuation = valuation;
        this.time_period = period;
        this.area = area;
        (id == undefined) ? this.id = uuidv4() : this.id = id;
        (evidence == undefined) ? this.evidence = null : this.evidence = evidence;
    }
}
exports.CarbonCreditCertificate = CarbonCreditCertificate;
//# sourceMappingURL=carbonCreditCertificate.js.map