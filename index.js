#!/usr/bin/env node
require("dotenv").config();

const GroqSynesthesiaAgent = require("./src/agents/mood-song-agent.js");
const { firstAgent, secondAgent } = require("./src/agents/mood-song-agent.js");
const { HueService } = require("./src/hue-service.js");
const { logWithTimestamp, logResponse } = require("./src/logger.js");
const { processSecondAgentResponse } = require("./src/utils.js");
const chalkOriginal = import("chalk").then(m => m.default);

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

  await hueService.updateLightColors(lights, colors);
  logWithTimestamp(chalk.green("Done!"));
};

// philipsHueTest().catch(error => {
//   console.error("An error occurred:", error);
// });

//////////

const moodSongTest = async () => {
  const hueService = new HueService(
    process.env.PHILIPS_HUE_KEY,
    process.env.PHILIPS_HUE_IP
  );
  await hueService.connect();

  const inputPrompt = process.argv[2];

  const groqSynesthesiaAgent = new GroqSynesthesiaAgent();
  const agentResponse = await groqSynesthesiaAgent.processInput({
    input: inputPrompt,
  });
  await logResponse(
    "Synesthesia Agent",
    `Received color settings: ${agentResponse}`
  );

  // const colors = processAgentResponse(agentResponse);
  const colors = processSecondAgentResponse(agentResponse);
  const chalk = await chalkOriginal;
  const lights = await hueService.getAllLights();

  if (lights.length < 3) {
    logWithTimestamp(
      chalk.red("Error: Se necesitan al menos 3 focos para continuar.")
    );
    return;
  }

  await hueService.updateLightColors(lights, colors);
  logWithTimestamp(chalk.green("Done!"));
};

// const processAgentResponse = response => {
//   const colorPattern = /(\w+\s\d+)/g;
//   const matches = response.match(colorPattern);
//   return matches ? matches.map(match => match.split(" ")) : [];
// };

moodSongTest().catch(error => {
  console.error("An error occurred:", error);
});
