const pgp = require('pg-promise')({ capSQL: true })
import { db } from '../database/instance'
import { uid } from '../types'
import { CarbonCreditCertificate } from '../classes/carbonCreditCertificate'
import { ILocation } from '../interfaces/ILocation'
const {
    getCarbonCreditCertificates,
    getCarbonCreditCertificate,
    createCarbonCreditCertificate,
    checkCCCAreasOverlap,
    deleteCCCById,
    cccExists,
} = require('../database/queries')

export class CarbonCreditCertificateRepo {
    private buildCarbonCreditCertificateDB(ccc : CarbonCreditCertificate) {
        let polygon = "POLYGON(("
        ccc.area.area.forEach(l => {
             polygon = `${polygon}${l.longitude.toString()} ${l.latitude.toString()}, `
        })
        const fstLoc = ccc.area.area[0]
        polygon = `${polygon.slice(0,-2)}, ${fstLoc.longitude} ${fstLoc.latitude}))`
        return {
            id: ccc.id,
            area: polygon,
            start_time: ccc.time_period.startTime,
            end_time: ccc.time_period.endTime,
            evidence: ccc.evidence,
        } 
    }

    private buildAreasFromDB(cccDB) {
        let acc : ILocation[] = []
        cccDB.area
        .slice(9, -2)
        .split(',') //new RegExp('[,]'))
        .map(tp => {
            let t = tp.split(' ').map(Number)
            acc.push({ longitude: t[0], latitude: t[1]})
        })
        return { 
            id: cccDB.id,
            id2: cccDB.id2,
            area: acc, 
            equalAreas: cccDB.equal, 
            endTimeEqualsStartTime: cccDB.endtimeequalsstarttime,
        }
    }

    async addCarbonCreditCertificate(ccc : CarbonCreditCertificate) : Promise<any> {
        const cccDB = this.buildCarbonCreditCertificateDB(ccc)
        return await db.one(createCarbonCreditCertificate, cccDB).then(cccId => { return cccId })
    }

    async getOverlappingArea(cid) : Promise<any> {
        return await db.any(checkCCCAreasOverlap).then(overlaps => {
            if (overlaps.length > 0 && overlaps != null) {
                let l = overlaps.map(r => { return this.buildAreasFromDB(r) })
                if (l[0].id2 == cid) { return l[0]}
                const i = l.length-2
                if (l[i].id2 == cid) { return l[i]}
            } 
            return null
        })
    }

    async deleteCarbonCreditCertificateById(id : uid) : Promise<any> {
        return await db.any(deleteCCCById, id).then(res => { return res })
    }

    async selectCarbonCreditCertificateById(id : uid) : Promise<CarbonCreditCertificate> {
        return await db.one(getCarbonCreditCertificate, id).then(data => { return data })
    }

    async selectCarbonCreditCertificates() : Promise<CarbonCreditCertificate[]> {
        return await db.any(getCarbonCreditCertificates).then(data => { return data })
    }

    async cccExists(id : uid) : Promise<boolean> {
        return await db.one(cccExists, id).then(b => { return b.exists })
    }
}