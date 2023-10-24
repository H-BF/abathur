import { IStreamHandler } from "./interfaces/stream.handler.interface";

export abstract class StreamHeandler implements IStreamHandler {

    stream(_call: any) {}

    /**
     * В gRPC значение enum передаются в виде значения-индекса. При этом нет встроенного механизма
     * получения строчного значения, что не удобно.
     * Метод получает по индекс-значению ключ для gRPC enum объекта.
     * @param value 
     * @param enumObject 
     * @returns key
     */
    protected getKeyByValue(value: number, enumObject: any): string {
        const key = Object.keys(enumObject)
            .find(key => enumObject[key] === value);
        
        if (!key)
            throw new Error(`The value ${value} is missing in the object`)

        return key
    }
}