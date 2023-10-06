import http, { Server, IncomingMessage } from 'http';
import httpProxy from 'http-proxy'
import { variables } from '../../infrastructure/var_storage/variables-storage';
import { logger } from '../logger/logger.service';

class ReporterProxyServer {

    private server: Server

    constructor() {
        const proxy = httpProxy.createProxyServer({});
        this.server = http.createServer((req, res) => {

            if (!req.headers['x-type'])
                throw new Error("Отсутствует обязательный заголовок X-Type")

            if (typeof req.headers['x-type'] !== 'string')
                throw new Error("Не корректное значение X-Type. Должно быть string")

            const type = req.headers['x-type']

            let target = this.selectTarget(type)
            req.headers.host = this.setHeaderHost(type)
            proxy.web(req, res, { target: target })
        })
    }

    start() {
        const proxyPort = variables.get("ABA_PROXY_PORT")
        this.server.listen(proxyPort, () => {
            logger.info(`Proxy server start successfully on port ${proxyPort}`)
        })
    }

    stop() {
        this.server.close(() => {
            logger.info("Proxy server stopped")
        })
    }

    private setHeaderHost(type: string): string {
        let host = ''
        let port = ''
        switch(type.toLowerCase()) {
            case 'api':
                host = variables.get("API_REPORTER_HOST")
                port = variables.get("API_REPORTER_PORT")
                break;
            case 'func':
                host = variables.get("HBF_REPORTER_HOST")
                port = variables.get("HBF_REPORTER_PORT")
                break;
            default:
                throw new Error(`не известный тип тестов: ${type}`)
        }
        return `${host}:${port}`
    }

    private selectTarget(type: string): string {
        let target: string
        switch(type.toLowerCase()) {
            case 'api':
                const apiReportHost = variables.get("API_REPORTER_HOST")
                const apiReportPort = variables.get("API_REPORTER_PORT")
                const apiReportProtocol = variables.get("API_REPORTER_PROTOCOL")
                target = `${apiReportProtocol}://${apiReportHost}:${apiReportPort}`
                break;
            case 'func':
                const funcReportHost = variables.get("HBF_REPORTER_HOST")
                const funcReportPort = variables.get("HBF_REPORTER_PORT")
                const funcReportProtocol = variables.get("HBF_REPORTER_PROTOCOL")
                target = `${funcReportProtocol}://${funcReportHost}:${funcReportPort}`
                break;
            default:
                throw new Error(`не известный тип тестов: ${type}`)
        }
        return target
    }
}

export const proxy = new ReporterProxyServer()