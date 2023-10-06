import { Logger, ILogObj, ISettingsParam } from 'tslog';

class LoggerService {

    logger: Logger<ILogObj>
    private logLvl: Record<string, number> = {
        'SILLY': 0,
        'TRACE': 1,
        'DEBUG': 2,
        'INFO': 3,
        'WARN': 4,
        'ERROR': 5,
        'FATAL': 6
    }

    constructor() {
        const logType = process.env["LOG_TYPE"]
        const logLvl = process.env["LOG_LVL"]

        const settings: ISettingsParam<ILogObj> = {
            type: logType ? this.validateType(logType) : "json",
            prettyLogTimeZone: 'local',
            minLevel: logLvl ? this.logLvl[logLvl] : this.logLvl["INFO"],
            prettyLogTemplate: '{{dd}}.{{mm}}.{{yyyy}} {{hh}}:{{MM}}:{{ss}}.{{ms}} [{{filePathWithLine}}] {{logLevelName}}: '
        }

        this.logger = new Logger<ILogObj>(settings)
    }

    private validateType(type: string): "json" | "pretty" | "hidden" | undefined {
        const types = ["json", "pretty", "hidden"]
        if (!types.includes(type))
            throw new Error(`He корректный тип логирования ${type}. Тип должен принадлежать ${types.join(", ")}`)
        return type as "json" | "pretty" | "hidden" 
    }
}

export const logger = new LoggerService().logger