"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value  ));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Logger: () => Logger
});
module.exports = __toCommonJS(index_exports);
var import_axios = __toESM(require("axios"));
var Logger = class {
  constructor(datadogUrl, datadogApiKey, hostname, environment, sendToDatadog) {
    this.datadogUrl = datadogUrl;
    this.datadogApiKey = datadogApiKey;
    this.hostname = hostname;
    this.environment = environment;
    this.sendToDatadog = sendToDatadog;
    this.logMessages = new Array();
  }
  info(message, tags) {
    this.log(message, "info", tags);
  }
  warn(message, tags) {
    this.log(message, "warn", tags);
  }
  error(message, tags) {
    this.log(message, "error", tags);
  }
  flush() {
    return __async(this, null, function* () {
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
        const promise = import_axios.default.post(
          `${this.datadogUrl}?dd-api-key=${this.datadogApiKey}`,
          payload,
          config
        );
        promises.push(promise);
      }
      const responses = yield Promise.allSettled(promises);
      for (const response of responses) {
        this.logMessages.shift();
      }
    });
  }
  getFormattedTags(tags) {
    if (typeof tags === "object") {
      return Object.entries(tags).map(
        ([key, value]) => typeof value === "object" ? `${key}:${JSON.stringify(value)}` : `${key}:${value}`
      ).join(",");
    }
    return tags != null ? tags : "";
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Logger
});
