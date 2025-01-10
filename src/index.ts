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

    public error(message: string | object, tags?: object | string[]): void {
        this.log(message, 'error', tags);
    }

    public async flush() {
        if (!this.sendToDatadog) return;
        const logsToSend = [...this.logMessages];
        const promises = [];

        for (const logMessage of logsToSend) {
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
            const promise = axios.post(
                `${this.datadogUrl}?dd-api-key=${this.datadogApiKey}`,
                payload,
                config,
            );
            promises.push(promise);
        }

        const responses = await Promise.allSettled(promises);

        for (const response of responses) {
            this.logMessages.shift();
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
        if (!message || (typeof message === 'string' && message.length === 0)) {
            throw new Error("Cannot send empty log");
        }

        if (this.sendToDatadog) {
            this.logMessages.push({message, level, tags});
            return;
        }

        const formattedLogMessage: string = this.getFormattedLogMessage(message, level);

        switch (level) {
            case "info":
                console.info(formattedLogMessage);
                return;
            case "warn":
                console.warn(formattedLogMessage);
                return;
            case "error":
                console.error(formattedLogMessage);
                return;
            default:
                return;
        }
    }

    private getFormattedLogMessage(message: string | object, level: 'info' | 'warn' | 'error'): string {
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: false,
            timeZoneName: "short"
        };
        const dateTimeFormatter = new Intl.DateTimeFormat("en-CA", options);
        const formattedDate = dateTimeFormatter.format(new Date());
        const formatedMessage: string = typeof message === 'object' ? JSON.stringify(message) : message;
        return `${formattedDate} :: ${level.toUpperCase().padStart(5, " ")} :: ${formatedMessage}`;
    }
}