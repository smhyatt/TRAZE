const { v4: uuidv4 } = require('uuid') // Unique identifier generator

// This file contains types and classes matching the database schema

export type uid = string
export type Resource = number

export type Period = {
    readonly startTime: Date
    readonly endTime: Date
}

export type OwnershipDB = {
    readonly agent: uid
    readonly type: uid
    amount: number
}

export type LocationDB = {
    readonly location_id: uid
    readonly resource_type: uid
    amount: number
}

export class TransferDB {
    readonly id: uid
    readonly transferor: uid
    readonly transferee: uid
    readonly type: uid
    readonly amount: number
    readonly time_of_effect: Date | String
    readonly info

    constructor(
        id: uid,
        transferor: uid,
        transferee: uid,
        type: uid,
        amount: number,
        time: Date | String,
        info?
    ) {
        this.id = (id === 'INIT') ? uuidv4() : id;
        this.transferor = transferor
        this.transferee = transferee
        this.type = type
        this.amount = amount;
        this.time_of_effect = (time === 'INIT') ? new Date() : time;
        this.info = info
    }
}

export class TransportDB {
    readonly id: uid
    readonly owner: uid
    readonly location_start: uid
    readonly destination: uid
    readonly resource_type: uid
    readonly amount: number
    readonly time_of_effect: Date
    readonly distance: number

    constructor(
        owner: uid,
        location_start: uid,
        destination: uid,
        type: uid,
        amount: number,
        distance: number,
        id?: uid,
        time?: Date,
    ) {
        this.owner = owner
        this.location_start = location_start
        this.destination = destination
        this.resource_type = type
        this.amount = amount
        this.distance = distance;
        (id == undefined) ? this.id = uuidv4() : this.id = id;
        (time == undefined) ? this.time_of_effect = new Date() : this.time_of_effect = time;
    }
}

export class TransformationDB {
    readonly id: uid
    readonly owner: uid
    readonly time_of_effect: Date
    readonly info

    constructor(
        owner: uid,
        info?
    ) {
        this.id = uuidv4()
        this.owner = owner
        this.time_of_effect = new Date()
        this.info = info
    }
}

export type TransformationInputDB = {
    readonly transformation: uid
    readonly type: uid
    amount: number
}

export type TransformationOutputDB = {
    readonly transformation: uid
    readonly type: uid
    amount: number
}
