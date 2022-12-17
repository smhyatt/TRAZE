"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SumTotal = void 0;
const ownership_1 = require("./ownership");
const exactMath = require('exact-math'); // Computing with floating points accurately
class SumTotal extends ownership_1.Ownership {
    checkSumTotalIsZero(M) {
        let sumTotal = this.getArr(M)
            .reduce((sum, e1) => exactMath.add(sum, this.getArr(e1).reduce((s2, e2) => exactMath.add(s2, e2), 0)), 0);
        if (!(sumTotal === 0)) {
            throw new Error("Sum total must be zero.");
        }
    }
    getArr(e) { return Array.from(e.values()); }
}
exports.SumTotal = SumTotal;
//# sourceMappingURL=sumTotal.js.map