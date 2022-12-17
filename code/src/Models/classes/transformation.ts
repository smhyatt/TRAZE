const exactMath = require('exact-math')
import { ResourceType } from "./resourceType"
import { Resources } from "./resource"

export class Transformation extends Resources {
    constructor(M : Map<ResourceType, number>) { 
        super(M) 
        if (M.size != 0) { this.checkSumTotalIsZero(M) }
    }

    private checkSumTotalIsZero(M : Map<ResourceType, number>) {
        // For each pair of resource type, number compute valuation*amount and sum
        const sumTotal = this.getVec(M).reduce(function (acc, [rt, r]) {
            return exactMath.add(acc, exactMath.mul(rt.valuation, r))
        }, 0)

        if (!(sumTotal === 0)) { throw new Error("Sum total must be zero.") }
    }

    private getVec(e : Map<any,any>) { return Array.from(e.entries()) }
}
