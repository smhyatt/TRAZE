const { v4: uuidv4 } = require('uuid')
import { IArea } from "../interfaces/IArea";
import { uid, Period, } from "../types"

export class CarbonCreditCertificate {
    readonly id : uid
    readonly name : string
    readonly valuation : number
    readonly time_period : Period
    readonly area : IArea
    readonly evidence: any

    constructor(name : string, valuation : number, period : Period, area: IArea, evidence?: JSON, id? : uid) {
        this.name = name
        this.valuation = valuation
        this.time_period = period
        this.area = area;
        (id == undefined) ? this.id = uuidv4() : this.id = id;
        (evidence == undefined) ? this.evidence = null : this.evidence = evidence;
    }
}