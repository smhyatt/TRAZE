import { uid } from "../types"
import { IActor } from "../interfaces/IActor"

// Unique identifier generators
const short = require('short-uuid')
const { v4: uuidv4 } = require('uuid')

export class Agent implements IActor {
    readonly id : uid
    readonly name : string
    readonly type : string
    readonly key : string

    constructor(name: string, type: string, id? : uid, key? : any) {
        this.name = name
        this.type = type;
        (id == undefined) ? this.id = uuidv4() : this.id = id;
        (key == undefined) ? this.key = short.generate() : this.key = key
    }
}