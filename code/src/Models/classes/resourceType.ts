const { v4: uuidv4 } = require('uuid')
import { IActor } from "../interfaces/IActor"
import { uid } from "../types"

export class ResourceType implements IActor {
    readonly id : uid
    readonly name : string
    readonly valuation : number

    constructor(name: string, valuation: number, id?: uid) {
        this.name = name
        this.valuation = valuation;
        (id == undefined) ? this.id = uuidv4() : this.id = id;
    }
}