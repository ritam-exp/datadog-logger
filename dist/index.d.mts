declare class Logger {
    private readonly datadogUrl;
    private readonly datadogApiKey;
    private readonly hostname;
    private readonly sendToDatadog;
    private readonly logMessages;
    constructor(datadogUrl: string, datadogApiKey: string, hostname: string, sendToDatadog: boolean);
    log(message: string, tags: string): void;
    flush(): Promise<void>;
}

export { Logger };
