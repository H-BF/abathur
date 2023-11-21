var exec = require('child_process').exec;

export class ICMP {

    async ping(ip: string) {
        return new Promise((resolve, reject) => {
            exec(`ping -c 3 ${ip}`, (err: Error, stdout: string, stderr: string) => {
                if(err){
                    reject(err)
                }
                if(stderr){
                    reject(stderr)
                }
                resolve(stdout)
            })
        })
    }

    async traceroute(ip: string) {
        return new Promise((resolve, reject) => {
            exec(`traceroute ${ip}`, (err: Error, stdout: string, stderr: string) => {
                if(err){
                    reject(err)
                }
                if(stderr){
                    reject(stderr)
                }
                resolve(stdout)
            })
        })
    }
}