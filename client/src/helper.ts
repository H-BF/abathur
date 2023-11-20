import { networkInterfaces } from 'os'
import * as dns from 'dns';
import { IIcmpResult, IIcmpTestData, ITcpUdpResult, ITcpUdpTestData, TResult, TestDataType } from './domain/interfaces';

export async function delay(time: number) {
    return new Promise(resolve => setTimeout(resolve, time));
}

export function evalutePorts(ports: string[]): string[] {
    return ports.flatMap((port) => {
        if (port.includes("-")) {
        const [start, end] = port.split("-");
        return Array.from({ length: Number(end) - Number(start) + 1 }, (_, i) =>
            (Number(start) + i).toString()
        );
        } else {
            return [port];
        }
    });
}

export function getMyIp(): string {
    return networkInterfaces().eth0!![0].address
}

export async function resolveHostName(hostName: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        dns.resolve(hostName, (err, addresses) => {
            if (err) reject(err)
            resolve(addresses)
        })
    })
}

export async function getIpByDNSName(name: string): Promise<string> {
    const msg = "Не удалось одназначно разрезолвить"
    const ips = await resolveHostName(name)

    if (ips.length > 1 || ips.length === 0)
        throw new Error(`${msg} ${name}`)
    return ips[0]
}


export function isTcpTestData(data: TestDataType[]): data is ITcpUdpTestData[] {
    return data.every(d => 'ports' in d)
}

export function isIcmpTestData(data: TestDataType[]): data is IIcmpTestData[] {
    return data.every(d => 'types' in d)
}

export function isIcmpResult(data: TResult[]): data is IIcmpResult[] {
    return data.every( d => 'icmpCommand' in d)
}

export function isTcpUdpResult(data: TResult[]): data is ITcpUdpResult[] {
    return data.every(d => 'srcPort' in d)
}