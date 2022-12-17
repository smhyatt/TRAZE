"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transformation = void 0;
const exactMath = require('exact-math');
const resource_1 = require("./resource");
class Transformation extends resource_1.Resources {
    constructor(M) {
        super(M);
        if (M.size != 0) {
            this.checkSumTotalIsZero(M);
        }
    }
    checkSumTotalIsZero(M) {
        // For each pair of resource type, number compute valuation*amount and sum
        const sumTotal = this.getVec(M).reduce(function (acc, [rt, r]) {
            return exactMath.add(acc, exactMath.mul(rt.valuation, r));
        }, 0);
        if (!(sumTotal === 0)) {
            throw new Error("Sum total must be zero.");
        }
    }
    getVec(e) { return Array.from(e.entries()); }
}
exports.Transformation = Transformation;
//# sourceMappingURL=transformation.js.map