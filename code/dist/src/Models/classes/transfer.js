"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transfer = void 0;
const exactMath = require('exact-math');
const ownership_1 = require("./ownership");
// Transfer is a subspace of Ownership where sum total is 0
class Transfer extends ownership_1.Ownership {
    constructor(M) {
        super(M);
        if (M.size != 0) {
            Transfer.checkSumTotalIsZero(M);
        }
    }
    static checkSumTotalIsZero(M) {
        let sumTotal = this.getArr(M)
            .reduce((sum, e1) => exactMath.add(sum, this.getArr(e1).reduce((s2, e2) => exactMath.add(s2, e2), 0)), 0);
        if (!(sumTotal === 0)) {
            throw new Error("Sum total must be zero.");
        }
    }
    static getArr(e) { return Array.from(e.values()); }
}
exports.Transfer = Transfer;
//# sourceMappingURL=transfer.js.map