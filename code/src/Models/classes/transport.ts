import { Resources } from "./resource";
import { Location } from "./location";
import { Ownership } from "./ownership";
const exactMath = require('exact-math')

export class Transport extends Ownership {
    constructor(M : Map<Location, Resources>) { 
        super(M)
        if (M.size != 0) { Transport.checkSumTotalIsZero(M) }
    }

    private static checkSumTotalIsZero(M : Map<Location, Resources>) {
        let sumTotal = 
            this.getArr(M)
            .reduce((sum, e1) =>
                exactMath.add(
                    sum, 
                    this.getArr(e1).reduce((s2, e2) => exactMath.add(s2, e2), 0)
                ), 0)

        if (!(sumTotal === 0)) { throw new Error("Sum total must be zero.") }
    }

    private static getArr(e : Map<any,any>) { return Array.from(e.values()) }
}
