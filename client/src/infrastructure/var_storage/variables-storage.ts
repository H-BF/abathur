import { MissEnvVariable } from "../../errors"
import { requiredVariablesList } from "./required-variables-list"

class VariableStorage {
    
    private variables: Record<string, string> = {}

    constructor(list: string[]) {
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

    get(name: string): string {
        if (!(name in this.variables))
            throw new Error(`Переменная ${name} отсутствует в хранилище`)

        return this.variables[name]
    }

    set(name: string, value: string) {
        if (name in this.variables) 
            throw new Error(`Переменная ${name} занята. Выберите другое название`)
        this.variables[name] = value 
    }
}

export const variables = new VariableStorage(requiredVariablesList)