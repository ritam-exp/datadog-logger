import axios from "axios";

type LogMessage = {
    message: string | object;
    level: 'info' | 'warn' | 'error';
    tags?: object | string[];
}

export class Logger {
    private readonly logMessages: Array<LogMessage> = new Array<LogMessage>();

    constructor(
        private readonly datadogUrl: string,
        private readonly datadogApiKey: string,
        private readonly hostname: string,
        private readonly environment: string,
        private readonly sendToDatadog: boolean,
    ) {
    }

    public info(message: string | object, tags?: object | string[]): void {
        this.log(message, 'info', tags);
    }

    public warn(message: string | object, tags?: object | string[]): void {
        this.log(message, 'warn', tags);
    }

    public error(message: string | object, tags: object | string[]): void {
        this.log(message, 'error', tags);
    }

    public async flush() {
        if (!this.sendToDatadog) return;

        for (const logMessage of this.logMessages) {
            const formattedTags = this.getFormattedTags(logMessage.tags);
            const payload = {
                message: logMessage.message,
                ddsource: 'twilio',
                ddtags: `index:twilio,env:${this.environment},${formattedTags}`,
                hostname: this.hostname,
                service: 'twilio-service',
                status: logMessage.level
            }
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            try {
                await axios.post(
                    `${this.datadogUrl}?dd-api-key=${this.datadogApiKey}`,
                    payload,
                    config,
                );
            } catch (error) {
                throw new Error(`Unable to send logs to Datadog. Payload: ${JSON.stringify(payload)} Error: ${error}`);
            }
        }
    }

    private getFormattedTags(tags?: object | string[]): string {
        if (typeof tags === 'object') {
            return Object.entries(tags)
                .map(([key, value]) =>
                    typeof value === 'object'
                        ? `${key}:${JSON.stringify(value)}`
                        : `${key}:${value}`
                )
                .join(',');
        }

        return tags ?? '';
    }

    private log(message: string | object, level: 'info' | 'warn' | 'error', tags?: object | string[]): void {
        if (!this.sendToDatadog) {
            switch (level) {
                case "info":
                    console.info(message);
                    return;
                case "warn":
                    console.warn(message);
                    return;
                case "error":
                    console.error(message);
                    return;
                default:
                    return;
            }
        }

        this.logMessages.push({message, level, tags});
    }
}