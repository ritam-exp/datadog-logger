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

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Logger: () => Logger
});
module.exports = __toCommonJS(index_exports);
var import_axios = __toESM(require("axios"));
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
        await import_axios.default.post(
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Logger
});