export class MissEnvVariable extends Error {
    constructor(varName: string) {
        super(`Missing environment variable ${varName}`)
        this.name = this.constructor.name
        Error.captureStackTrace(this, this.constructor);
    }
}