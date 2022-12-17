const exactMath = require('exact-math')
import { Ownership } from "./ownership"
import { Resources } from "./resource"
import { Agent } from "./agent"

// Transfer is a subspace of Ownership where sum total is 0
export class Transfer extends Ownership {
    constructor(M : Map<Agent, Resources>) { 
        super(M)
        if (M.size != 0) { Transfer.checkSumTotalIsZero(M) }
    }

    private static checkSumTotalIsZero(M : Map<Agent, Resources>) {
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
