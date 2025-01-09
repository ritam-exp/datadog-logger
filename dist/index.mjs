// src/index.ts
import axios from "axios";
var Logger = class {
  constructor(datadogUrl, datadogApiKey, hostname, sendToDatadog) {
    this.datadogUrl = datadogUrl;
    this.datadogApiKey = datadogApiKey;
    this.hostname = hostname;
    this.sendToDatadog = sendToDatadog;
  }
  logMessages = new Array();
  log(message, tags) {
    if (!this.sendToDatadog) {
      console.log(message);
      return;
    }
    this.logMessages.push({ message, tags });
  }
  async flush() {
    if (!this.sendToDatadog) return;
    for (const logMessage of this.logMessages) {
      const payload = {
        message: logMessage.message,
        ddsource: "twilio",
        ddtags: `index:twilio,env:development,service:twilio-serverless,baseUrl:${logMessage.tags}`,
        hostname: this.hostname,
        service: "twilio-service"
      };
      const config = {
        headers: {
          "Content-Type": "application/json"
        }
      };
      try {
        await axios.post(
          `${this.datadogUrl}?dd-api-key=${this.datadogApiKey}`,
          payload,
          config
        );
      } catch (error) {
        throw new Error(`Unable to send logs to Datadog. Payload: ${JSON.stringify(payload)} Error: ${error}`);
      }
    }
  }
};
export {
  Logger
};
