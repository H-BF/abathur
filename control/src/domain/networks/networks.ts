import ip from 'ip';

export class Networks {

    private firstAddress: string;
    private numberOfAddresses: number;

    constructor(network: string) {
        const ipRange = ip.cidrSubnet(network)
        this.firstAddress = ipRange.networkAddress
        this.numberOfAddresses = ipRange.length
    }

    getAddressesList(): string[] {
        const addresses: string[] = []
        for (let i = 0; i < this.numberOfAddresses; i++) {
            const address = ip.fromLong(ip.toLong(this.firstAddress) + i)
            addresses.push(`${address}`)
          }
        return addresses
    }
}