"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resources = void 0;
const exactMath = require('exact-math'); // Computing with floating points accurately
const vector_1 = require("./vector");
class Resources extends vector_1.Vector {
    constructor(M) {
        super(M);
    }
    Zero() { return Resources.zero(); }
    Add(x, y) { return Resources.add(x, y); }
    Mult(k, y) { return Resources.mult(k, y); }
    static zero() { return new Resources(new Map()); }
    static add(x, y) {
        let vecSum = new Map(x);
        for (let [yResType, yRes] of y.entries()) {
            if (x.has(yResType)) {
                const newAmount = exactMath.add(x.get(yResType), yRes);
                vecSum.set(x.getKey(yResType), newAmount);
            }
            else {
                vecSum.set(yResType, yRes);
            }
        }
        return new Resources(vecSum);
    }
    static mult(k, y) {
        let multResult = new Map();
        y.forEach((r, rt) => {
            multResult.set(rt, exactMath.mul(k, r));
        });
        return new Resources(multResult);
    }
    toString() {
        if (this.size == 0) {
            return "{}";
        }
        let s = "{\n ";
        //this.forEach((resource,type) => { s = `${s}${type.name} -> ${resource}, ` })
        this.forEach((resource, type) => { s = `${s}${type.name}:${type.id} -> ${resource},\n `; });
        return `${s.slice(0, -2)} \n}`;
    }
    print() { console.log(this.toString()); }
}
exports.Resources = Resources;
//# sourceMappingURL=resource.js.map