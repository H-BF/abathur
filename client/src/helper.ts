import { networkInterfaces } from 'os'

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

// function evalutePorts(ports: string[]): string[] {
//     let result: string[] = []
//     ports.forEach(port => {
//         if(port.includes("-")) {
//             let elems: string[] = port.split("-")
//             for (let i = Number(elems[0]); i <= Number(elems[1]); i++) {
//                 result.push(i.toString())
//             }
//         } else {
//             result.push(port)
//         }
//     })
//     return result
// }