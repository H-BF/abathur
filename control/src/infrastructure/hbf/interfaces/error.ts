export interface IError {
    code: number
    details: [
        {
            '@type': string
        }
    ],
    message: string
}