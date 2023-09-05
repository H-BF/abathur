export class MissEnvVariable extends Error {
    constructor(varName: string) {
        super(`Missing environment variable ${varName}`)
        this.name = this.constructor.name
        Error.captureStackTrace(this, this.constructor);
    }
}

export class MissPropVariable extends Error {
    constructor(varName: string) {
        super(`Missing properties variable ${varName}`)
        this.name = this.constructor.name
        Error.captureStackTrace(this, this.constructor);
    }
}