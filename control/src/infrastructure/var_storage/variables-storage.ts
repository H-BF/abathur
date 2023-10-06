import propertiesReader from 'properties-reader'
import { MissEnvVariable, MissPropVariable } from "../../domain/errors"
import { requiredEnvVariablesList } from "./required-env-variables-list"
import { requiredPropVariablesList } from "./required-prop-variables-list"
import { resolveHostName } from '../../domain/helpers'
import { logger } from '../../domain/logger/logger.service'

class VariableStorage {
    
    private variables: Record<string, string> = {}

    constructor() {
        this.readEnvVar(requiredEnvVariablesList)
        this.readProrVar(requiredPropVariablesList)
    }

    private readEnvVar(list: string[]) {
        let errors: string[] =[]
        list.forEach(variable => {
            if (!process.env[variable]) {
                errors.push(variable)
                return
            }
            this.variables[variable] = process.env[variable]!
        })
        if(errors.length > 0)
            throw new MissEnvVariable(errors.join(", "))
    }

    private readProrVar(list: string[]) {
        let errors: string[] = []
        const path = '/usr/src/control/props/config.properties'
        const properties = propertiesReader(path)
        list.forEach(variable => {
            if (properties.getRaw(variable) === null) {
                errors.push(variable)
                return
            }
            this.variables[variable] = properties.getRaw(variable)!
        })
        if (errors.length > 0) {
            throw new MissPropVariable(errors.join(", "))
        }
    }

    get(name: string): string {
        if (!(name in this.variables))
            throw new Error(`Переменная ${name} отсутствует в хранилище`)

        return this.variables[name]
    }

    
    async resolveReporterHosts() {
        const msg = "Не удалось одназначно разрезолвить"
        const apiName = variables.get("API_REPORTER_HOST")
        const hbfName = variables.get("HBF_REPORTER_HOST")

        const apiIps = await resolveHostName(apiName)
        const hbfIps = await resolveHostName(hbfName)

        if (apiIps.length > 1 || apiIps.length === 0)
            throw new Error(`${msg} ${apiName}`)
        if (hbfIps.length > 1 || hbfIps.length === 0)
            throw new Error(`${msg} ${hbfName}`)

        this.variables["API_REPORTER_IP"] = apiIps[0]
        this.variables["HBF_REPORTER_IP"] = hbfIps[0]
    }
}

function initVariableStorage() {
    try {
        return new VariableStorage()
    } catch(err) {
        logger.error(err)
        process.exit(1)
    }
}

export const variables = initVariableStorage()