"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ownership = void 0;
const vector_1 = require("./vector");
const resource_1 = require("./resource");
class Ownership extends vector_1.Vector {
    constructor(M) { super(M); }
    Zero() { return Ownership.zero(); }
    Add(x, y) { return Ownership.add(x, y); }
    Mult(k, y) { return Ownership.mult(k, y); }
    static zero() { return new Ownership(new Map()); }
    static add(o1, o2) {
        let vecSum = new Map(o1);
        for (let [agent2, resources2] of o2.entries()) {
            if (o1.has(agent2)) {
                const agent1 = o1.getKey(agent2);
                const resources1 = o1.get(agent1);
                const sumResources = resource_1.Resources.add(resources1, resources2);
                vecSum.set(agent1, sumResources);
            }
            else {
                vecSum.set(agent2, resources2);
            }
        }
        return new Ownership(vecSum);
    }
    static mult(k, o) {
        let multResult = new Map();
        o.forEach((resources, agent) => {
            const scaled = resource_1.Resources.mult(k, resources);
            multResult.set(agent, scaled);
        });
        return new Ownership(multResult);
    }
    toString() {
        if (this.size == 0) {
            return "{}";
        }
        let s = "{ ";
        this.forEach((resources, agent) => { s = `${s}\n${agent.name}:${agent.id} -> ${resources.toString()},\n  `; });
        // this.forEach((resources, agent) => { s = `${s}${agent.name} -> ${resources.toString()},\n  ` })
        return `${s.slice(0, -4)} \n}`;
    }
    print() { console.log(this.toString()); }
}
exports.Ownership = Ownership;
//# sourceMappingURL=ownership.js.map