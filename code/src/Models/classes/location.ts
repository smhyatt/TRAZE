const { v4: uuidv4 } = require('uuid')
import { ILocation } from "../interfaces/ILocation";
import { IActor } from "../interfaces/IActor"
import { uid } from "../types"

export class Location implements ILocation, IActor {   
    readonly id : uid
    readonly name : string
    readonly longitude : number
    readonly latitude : number

    constructor(name : string, coordinates : ILocation, id? : uid) {
        this.name = name
        this.longitude = coordinates.longitude
        this.latitude = coordinates.latitude;
        (id == undefined) ? this.id = uuidv4() : this.id = id
    }
}