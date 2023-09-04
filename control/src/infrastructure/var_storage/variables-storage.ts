import propertiesReader from 'properties-reader'
import { MissEnvVariable, MissPropVariable } from "../../domain/errors"
import { requiredEnvVariablesList } from "./required-env-variables-list"
import { requiredPropVariablesList } from "./required-prop-variables-list"

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
}

export const variables = new VariableStorage()