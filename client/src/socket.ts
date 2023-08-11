import net from 'net';

export class SocketClient {
    private socket: net.Socket

    constructor() {
        this.socket = new net.Socket();
    }

    async check(
        srcPort: number,
        dstIp: string,
        dstPort: number
    ): Promise<string> {
        
        const request = `GET /check HTTP/2.0\r\nHost: localhost\r\n\r\n`;

        return new Promise((resolve, reject) => {
            this.socket.connect({
                host: dstIp,
                port: dstPort,
                localPort: srcPort
            })

            this.socket.setTimeout(2000)

            this.socket.write(request)
            
            this.socket.on('data', (data) => {
                this.socket.destroy()
                resolve(data.toString())
            })

            this.socket.on('error', (error) => {
                this.socket.destroy()
                reject(error)
            })

            this.socket.on('timeout', () => {
                console.log('Connection timed out!')
                this.socket.destroy();
                reject(new Error('Connection timed out'));
            })
        })
    }
}