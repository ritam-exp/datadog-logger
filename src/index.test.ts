import {vi, expect, it, describe, beforeEach} from 'vitest';
import { Logger } from './index';
import axios from 'axios';

vi.mock('axios');

describe('Test console logs', () => {
    let LOG: Logger;

    beforeEach(() => {
        const datadogUrl = 'MOCK_API_URL';
        const datadogApiKey = 'YOUR_DATADOG_API_KEY';
        const hostname = 'MOCK_HOSTNAME';
        const environment = 'MOCK';
        const sendToDatadog = false;

        LOG = new Logger(datadogUrl, datadogApiKey, hostname, environment, sendToDatadog);
    });

    it('throws error for empty message', () => {
        expect(() => LOG.info('')).toThrowError('Cannot send empty log');
    });

    it('logs correct info message', () => {
        const message = 'This is an info message';
        const consoleSpy = vi.spyOn(console, 'info');
        LOG.info(message);
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(message));
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("INFO"));
    });

    it('logs correct warn message', () => {
        const message = 'This is an warn message';
        const consoleSpy = vi.spyOn(console, 'warn');
        LOG.warn(message);
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(message));
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("WARN"));
    });

    it('logs correct error message', () => {
        const message = 'This is an error message';
        const consoleSpy = vi.spyOn(console, 'error');
        LOG.error(message);
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(message));
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("ERROR"));
    });
});

describe("Test sending logs to Datadog", () => {
    let LOG: Logger;
    const datadogUrl = 'MOCK_API_URL';
    const datadogApiKey = 'YOUR_DATADOG_API_KEY';
    const hostname = 'MOCK_HOSTNAME';
    const environment = 'MOCK';

    beforeEach(() => {
        LOG = new Logger(datadogUrl, datadogApiKey, hostname, environment, true);
    });

    it('sends single info message to datadog', async () => {
        const message = 'This is an info message with tags';
        const tags = { key1: 'value1', key2: 123 };

        LOG.info(message, tags);
        await LOG.flush();

        expect(axios.post).toHaveBeenCalled();
        expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining(datadogUrl),
            expect.objectContaining({
                message,
                ddsource: 'twilio',
                ddtags: expect.stringContaining('key1:value1,key2:123'),
                hostname: hostname,
                service: 'twilio-service',
                status: 'info',
            }),
            expect.objectContaining({ headers: { 'Content-Type': 'application/json' } })
        );
    });

    it('send one info one warn message to datadog', async () => {
        const message1 = 'This is the first info message';
        const message2 = 'This is the second warn message';
        const tags = { key: 'value' };

        LOG.info(message1, tags);
        LOG.warn(message2);

        await LOG.flush();

        expect(axios.post).toHaveBeenCalled();
        expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining(datadogUrl),
            expect.objectContaining({ message: message1, status: 'info' }),
            expect.objectContaining({ headers: { 'Content-Type': 'application/json' } })
        );
        expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining(datadogUrl),
            expect.objectContaining({ message: message2, status: 'warn' }),
            expect.objectContaining({ headers: { 'Content-Type': 'application/json' } })
        );
    });
});