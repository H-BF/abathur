import axios from 'axios';
import { networks, rules, sg } from './testData';
import { HBF_HOST, HBF_PORT, HBF_PROTOCOL } from '../../../config/hbf_conf';

class TestData {

    async generate() {

        const baseUrl = `${HBF_PROTOCOL}://${HBF_HOST}:${HBF_PORT}`

        console.log("Генерим данные")
        try {
            console.log("netwokrs")
            await axios.post(`${baseUrl}/v1/sync`, JSON.stringify(networks), {
                headers: {
                    "Content-Type": "application/json"
                }
            })
    
            console.log("sg")
            await axios.post(`${baseUrl}/v1/sync`, JSON.stringify(sg), {
                headers: {
                    "Content-Type": "application/json"
                }
            })


            console.log("rules")
            await axios.post(`${baseUrl}/v1/sync`, JSON.stringify(rules), {
                headers: {
                    "Content-Type": "application/json"
                }
            })
        } catch(err: any) {
            console.log(err.message)
            if (`${err.message}`.startsWith("getaddrinfo ENOTFOUND")) {
                process.exit(1)
            }
        }
        console.log("Нагенерили")
    }
}

const testData = new TestData()

export {
    testData
}