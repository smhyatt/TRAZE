import { Area } from "../classes/area"
import { ResourceType } from "../classes/resourceType"
import { CarbonCreditCertificate } from "../classes/carbonCreditCertificate"

import { CarbonCreditCertificateRepo } from "../repositories/carbonCreditCertificateRepository"
import { ResourceTypeRepo } from "../repositories/resourceRepository"

export class CarbonCreditCertificateService {
    resourceTypeRepo : ResourceTypeRepo
    carbonCreditCertificateRepo : CarbonCreditCertificateRepo

    constructor(rtr : ResourceTypeRepo, cccr : CarbonCreditCertificateRepo) { 
        this.resourceTypeRepo = rtr
        this.carbonCreditCertificateRepo = cccr
    }

    /* Input format:
    * { name: string,
    *   valuation: number, // CO2-eq
    *   time_period: {
    *       startTime: date,
    *       endTime: date
    *   },
    *   area: [ { longiitude: number, latitude: number} ],
    *   evidence: json } */
    async insertCarbonCreditCertificate(req, res) {
        const { name, valuation, time_period, area, evidence } = req.body
        const area_ = new Area(area);
        const resourceType = new ResourceType(name, Number(valuation))
        const cccId = resourceType.id
        const ccc = new CarbonCreditCertificate(name, Number(valuation), time_period, area_, evidence, cccId)

        await this.resourceTypeRepo.addResourceType([resourceType])
            .catch(err => { return res.status(400).send({ error: "Error storing carbon credit certificate in db (rt)", msg: err }) })
            
        const resCCCid = await this.carbonCreditCertificateRepo.addCarbonCreditCertificate(ccc)
            .catch(err => { return res.status(400).send({ error: "Error storing carbon credit certificate in db (ccc)", msg: err }) })
    
        const overlapping = await this.carbonCreditCertificateRepo.getOverlappingArea(cccId)
            .catch(err => { return res.status(400).send({ error: "Error getting info about overlapping areas of carbon credit certificates", msg: err }) })
        
        if (overlapping != null) { // Overlapping areas
                // If is exact same area as in other CCC, and time periods are in sequence all is fine
            if (overlapping.equalAreas && overlapping.endTimeEqualsStartTime) {
                return res.send(resCCCid)
            } else {
                await this.carbonCreditCertificateRepo.deleteCarbonCreditCertificateById(cccId)
                await this.resourceTypeRepo.deleteResourceTypeById(cccId)
                return res.status(400).send({ error: "The carbon credit certificates area overlaps with another area, and/or start time is not in sequence with end time"})
            }
        } else { // No overlapping areas
            return res.send(resCCCid)
        }
    }
    
    async selectCarbonCreditCertificate(req, res) {
        const { id } = req.params
        let rt = await this.resourceTypeRepo.selectResourceTypeById(id)
            .catch(err => { return res.status(400).send({error: "Error getting carbon credit certificate", msg: err}) })
        let ccc = await this.carbonCreditCertificateRepo.selectCarbonCreditCertificateById(id)
            .catch(err => { return res.status(400).send({error: "Error getting carbon credit certificate", msg: err}) })
        return res.send({rt, ccc})
    }

    async selectCarbonCreditCertificates(res) {
        let rt = await this.resourceTypeRepo.selectResourceTypes()
            .catch(err => { return res.status(400).send({error: "Error getting carbon credit certificate", msg: err}) })
        let ccc = await this.carbonCreditCertificateRepo.selectCarbonCreditCertificates()
            .catch(err => res.status(400).send({error: "Error getting carbon credit certificates", msg: err}) )
        return res.send({rt, ccc})
    }
}