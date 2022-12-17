import { ILocation } from "../interfaces/ILocation";
import { IArea } from "../interfaces/IArea";

export class Area implements IArea {
    readonly area : ILocation[]

    constructor(area : ILocation[]) { this.area = area }

    toString() : string {
        let s = "area: { "
        this.area.forEach(l => s = `${s}(${l.longitude}, ${l.latitude}), `)
        return `${s.slice(0,-2)} }`
    }
    
    print() : void { console.log(this.toString()) }
}