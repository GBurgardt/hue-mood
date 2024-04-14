#!/usr/bin/env node

require("dotenv").config();
const { firstAgent, secondAgent } = require("./gpt-service.js");
const { api: hueApi } = require("node-hue-api").v3;
const chalkOriginal = import("chalk").then(m => m.default);

class HueService {
  constructor(username, ipAddress) {
    this.username = username;
    this.ipAddress = ipAddress;
    this.API = null;
  }

  async connect() {
    this.API = await hueApi.createLocal(this.ipAddress).connect(this.username);
  }

  async setLightState(lightId, state) {
    if (!this.API) {
      throw new Error("HueService not connected. Call connect() first.");
    }
    return await this.API.lights.setLightState(lightId, state);
  }

  async getAllLights() {
    if (!this.API) {
      throw new Error("HueService not connected. Call connect() first.");
    }
    return await this.API.lights.getAll();
  }
}

const logWithTimestamp = message => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${message}`);
};

const logResponse = async (agent, response) => {
  const chalk = await chalkOriginal;
  logWithTimestamp(chalk.blue(`${agent} Response: `) + chalk.green(response));
};

const parseColorIntensity = colorIntensity => {
  const [color, intensity] = colorIntensity.trim().split(" ").map(Number);
  return {
    hue: Math.round((color / 360) * 65535),
    brightness: Math.round((intensity / 100) * 254),
  };
};

const updateLightColors = async (hueService, lights, colors) => {
  for (let i = 0; i < lights.length && i < colors.length; i++) {
    const { hue, brightness } = parseColorIntensity(colors[i]);
    const state = { on: brightness > 0, bri: brightness, hue };
    await hueService.setLightState(lights[i].id, state);
  }
};

const processSecondAgentResponse = response => {
  const colorPattern =
    /\b(\d{1,3} \d{1,3}, \d{1,3} \d{1,3}, \d{1,3} \d{1,3})\b/;
  const match = response.match(colorPattern);
  return match ? match[0].replace(/"/g, "").trim().split(",") : [];
};

const philipsHueTest = async () => {
  const hueService = new HueService(
    process.env.PHILIPS_HUE_KEY,
    process.env.PHILIPS_HUE_IP
  );
  await hueService.connect();

  const inputPrompt = process.argv[2];
  const firstAgentResponse = await firstAgent(inputPrompt);
  await logResponse(
    "First Agent",
    `Received color settings: ${firstAgentResponse}`
  );

  const secondAgentResponse = await secondAgent(
    inputPrompt,
    firstAgentResponse
  );
  await logResponse(
    "Second Agent",
    `Adjusted color settings based on input: ${secondAgentResponse}`
  );

  const colors = processSecondAgentResponse(secondAgentResponse);
  const chalk = await chalkOriginal;
  const lights = await hueService.getAllLights();

  if (lights.length < 3) {
    logWithTimestamp(
      chalk.red("Error: Se necesitan al menos 3 focos para continuar.")
    );
    return;
  }

  await updateLightColors(hueService, lights, colors);
  logWithTimestamp(chalk.green("Done!"));
};

philipsHueTest().catch(error => {
  console.error("An error occurred:", error);
});
