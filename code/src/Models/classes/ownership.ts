import { Agent } from "./agent";
import { Vector } from "./vector";
import { Resources } from "./resource";
import { IActor } from "../interfaces/IActor";

export class Ownership extends Vector<IActor, Resources> {

    constructor(M : Map<IActor, Resources>) { super(M) }

    Zero(): Ownership { return Ownership.zero() }
    Add(x: Ownership, y: Ownership): Ownership { return Ownership.add(x, y) }
    Mult(k: number, y: Ownership): Ownership { return Ownership.mult(k, y) }

    static zero() : Ownership { return new Ownership(new Map()) }

    static add(o1 : Ownership, o2: Ownership) : Ownership {
        let vecSum = new Map(o1)
        for (let [agent2, resources2] of o2.entries()) {
            if (o1.has(agent2)) {
                const agent1 = o1.getKey(agent2)
                const resources1 = o1.get(agent1)
                const sumResources = Resources.add(resources1, resources2)
                vecSum.set(agent1, sumResources)
            }
            else { vecSum.set(agent2, resources2) }
        }
        return new Ownership(vecSum)
    }
  
    static mult(k: number, o: Ownership) : Ownership { 
        let multResult = new Map()
        o.forEach( (resources: Resources, agent: Agent) => {
            const scaled = Resources.mult(k, resources)
            multResult.set(agent, scaled)
        })
        return new Ownership(multResult)
    }

    toString() : string {
        if (this.size == 0) { return "{}" }
        let s : string = "{ "
        this.forEach((resources, agent) => { s = `${s}\n${agent.name}:${agent.id} -> ${resources.toString()},\n  ` })
       // this.forEach((resources, agent) => { s = `${s}${agent.name} -> ${resources.toString()},\n  ` })
        return `${s.slice(0,-4)} \n}`
    }

    print() : void { console.log(this.toString()) }
}
