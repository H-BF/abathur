import { networkInterfaces } from 'os'

export function getMyIp(): string {
    return networkInterfaces().eth0!![0].address
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