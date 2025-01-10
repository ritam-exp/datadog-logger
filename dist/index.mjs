// src/index.ts
import axios from "axios";
var Logger = class {
  constructor(datadogUrl, datadogApiKey, hostname, environment, sendToDatadog) {
    this.datadogUrl = datadogUrl;
    this.datadogApiKey = datadogApiKey;
    this.hostname = hostname;
    this.environment = environment;
    this.sendToDatadog = sendToDatadog;
  }
  logMessages = new Array();
  info(message, tags) {
    this.log(message, "info", tags);
  }
  warn(message, tags) {
    this.log(message, "warn", tags);
  }
  error(message, tags) {
    this.log(message, "error", tags);
  }
  async flush() {
    if (!this.sendToDatadog) return;
    const logsToSend = [...this.logMessages];
    const promises = [];
    for (const logMessage of logsToSend) {
      const formattedTags = this.getFormattedTags(logMessage.tags);
      const payload = {
        message: logMessage.message,
        ddsource: "twilio",
        ddtags: `index:twilio,env:${this.environment},${formattedTags}`,
        hostname: this.hostname,
        service: "twilio-service",
        status: logMessage.level
      };
      const config = {
        headers: {
          "Content-Type": "application/json"
        }
      };
      const promise = axios.post(
        `${this.datadogUrl}?dd-api-key=${this.datadogApiKey}`,
        payload,
        config
      );
      promises.push(promise);
    }
    const responses = await Promise.allSettled(promises);
    for (const response of responses) {
      this.logMessages.shift();
    }
  }
  getFormattedTags(tags) {
    if (typeof tags === "object") {
      return Object.entries(tags).map(
        ([key, value]) => typeof value === "object" ? `${key}:${JSON.stringify(value)}` : `${key}:${value}`
      ).join(",");
    }
    return tags ?? "";
  }
  log(message, level, tags) {
    if (!message || typeof message === "string" && message.length === 0) {
      throw new Error("Cannot send empty log");
    }
    if (this.sendToDatadog) {
      this.logMessages.push({ message, level, tags });
      return;
    }
    const formattedLogMessage = this.getFormattedLogMessage(message, level);
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
  getFormattedLogMessage(message, level) {
    const options = {
      weekday: "long",
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
    const formattedDate = dateTimeFormatter.format(/* @__PURE__ */ new Date());
    const formatedMessage = typeof message === "object" ? JSON.stringify(message) : message;
    return `${formattedDate} :: ${level.toUpperCase().padStart(5, " ")} :: ${formatedMessage}`;
  }
};
export {
  Logger
};
