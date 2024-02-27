#!/usr/bin/env node

require("dotenv").config();

const { firstAgent, secondAgent } = require("./gpt-service.js");
const { api: hueApi } = require("node-hue-api").v3;
const chalkOriginal = import("chalk").then(m => m.default);

class HueService {
  constructor(username, ipAddress) {
    this.username = username;
    this.ipAddress = ipAddress;
  }

  async connect() {
    this.API = await hueApi.createLocal(this.ipAddress).connect(this.username);
  }

  async setLightState(lightId, state) {
    return await this.API.lights.setLightState(lightId, state);
  }

  async getAllLights() {
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

    if (brightness === 0) {
      await turnOffLights(hueService, lights);
      return;
    }

    const state = { on: true, bri: brightness, hue };

    await hueService.setLightState(lights[i].id, state);
  }
};

const setMinimumBrightness = async (hueService, lights) => {
  const state = { on: true, bri: 1 };
  await hueService.setLightState(lights[0].id, state);
};

const turnOffLights = async (hueService, lights) => {
  const state = { on: false };
  await hueService.setLightState(lights[0].id, state);
};

const toggleBrightness = async (hueService, lights) => {
  let brightness = 1;
  let increasing = true;

  const interval = setInterval(async () => {
    const state = { on: true, bri: brightness };
    await hueService.setLightState(lights[0].id, state);

    if (increasing) {
      brightness += 5;
      if (brightness >= 254) {
        // Asegurarse de no exceder el máximo
        brightness = 254;
        increasing = false;
      }
    } else {
      brightness -= 5;
      if (brightness <= 1) {
        // Asegurarse de no caer por debajo del mínimo
        brightness = 1;
        increasing = true;
      }
    }
  }, 1000); // Cambia el brillo cada segundo
};

function processSecondAgentResponse(respuestaAgente) {
  const patron = /\b(\d{1,3} \d{1,3}, \d{1,3} \d{1,3})\b/;
  const coincidencia = respuestaAgente.match(patron);

  return coincidencia ? coincidencia[0] : null;
}

const philipsHueTest = async () => {
  const hueService = new HueService(
    // "GesIZHgaAc4JF1BppESBpNg7D9Kk7LFtvAUiHCGr",
    // "192.168.1.2"
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

  const finalColors = processSecondAgentResponse(secondAgentResponse);

  const colors = finalColors.replace(/"/g, "").trim().split(",");

  const chalk = await chalkOriginal;

  const lights = await hueService.getAllLights();
  if (lights.length < 2) {
    logWithTimestamp(
      chalk.red("Error: Se necesitan al menos 2 focos para continuar.")
    );
    return;
  }

  await updateLightColors(hueService, lights, colors);
  logWithTimestamp(chalk.green("Done!"));
};

philipsHueTest().then(() => {});
