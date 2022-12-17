const exactMath = require('exact-math') // Computing with floating points accurately
import { ResourceType } from "./resourceType"
import { Vector } from "./vector"

export class Resources extends Vector<ResourceType, number> {
    constructor(M : Map<ResourceType, number>) { 
        super(M)
    }
  
    Zero() : Resources { return Resources.zero() }
    Add(x: Resources, y: Resources) : Resources { return Resources.add(x, y) }
    Mult(k: number, y: Resources) : Resources { return Resources.mult(k, y) }

    static zero() : Resources { return new Resources(new Map()) }

    static add(x: Resources, y: Resources) : Resources  {
        let vecSum = new Map(x);
        for (let [yResType, yRes] of y.entries()) {
            if (x.has(yResType)) {
                const newAmount = exactMath.add(x.get(yResType), yRes)
                vecSum.set(x.getKey(yResType), newAmount)
            }
            else { vecSum.set(yResType, yRes)}
        }
        return new Resources(vecSum)
    }

    static mult(k: number, y: Resources) : Resources  {
        let multResult = new Map()
        y.forEach( (r, rt) => {
            multResult.set(rt, exactMath.mul(k, r))
        })
        return new Resources(multResult)
    }

    toString() : string {
        if (this.size == 0) { return "{}" }
        let s : string = "{\n "
        //this.forEach((resource,type) => { s = `${s}${type.name} -> ${resource}, ` })
        this.forEach((resource,type) => { s = `${s}${type.name}:${type.id} -> ${resource},\n ` })
        return `${s.slice(0,-2)} \n}`
    }

    print() : void { console.log(this.toString()) }
}
