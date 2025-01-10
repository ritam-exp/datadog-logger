declare class Logger {
    private readonly datadogUrl;
    private readonly datadogApiKey;
    private readonly hostname;
    private readonly environment;
    private readonly sendToDatadog;
    private readonly logMessages;
    constructor(datadogUrl: string, datadogApiKey: string, hostname: string, environment: string, sendToDatadog: boolean);
    info(message: string | object, tags?: object | string[]): void;
    warn(message: string | object, tags?: object | string[]): void;
    error(message: string | object, tags?: object | string[]): void;
    flush(): Promise<void>;
    private getFormattedTags;
    private log;
    private getFormattedLogMessage;
}

export { Logger };
