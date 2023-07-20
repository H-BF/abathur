import { exec } from 'child_process';

export class LinuxCommand {


    async getLocalSocetStatus(port: string, protocol: string): Promise<string> {
        let attr = ""
        switch (protocol) {
            case 'TCP': 
                attr = '-ant'
                break
            case 'UDP':
                attr = '-anu'
                break
        }
        return await this.exec(`grep --version`)
        // return await this.exec(`netstat ${attr} | awk '{print $4, $6}' | grep :${port} | awk '{print $2}'`)
    }

    async netstat(attr: string) {
        return await this.exec(`netstat ${attr}`)
    }

    private async exec(line: string): Promise<string> {
        return new Promise((resolve, reject) => {
            exec(line, (err, stdout) => {
                if(err) {
                    reject(err)
                }
                resolve(stdout)
            })
        })
    }
}