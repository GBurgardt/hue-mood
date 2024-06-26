#!/usr/bin/env node
require("dotenv").config();

const GroqSynesthesiaAgent = require("./src/agents/mood-song-agent.js");
const {
  firstAgent,
  secondAgent,
  reactAgent,
  emotionalAgent,
} = require("./src/agents/ambient-agent.js");
const { HueService } = require("./src/hue-service.js");
const { logWithTimestamp, logResponse } = require("./src/logger.js");
const { processAgentResponse } = require("./src/utils.js");
const chalkOriginal = import("chalk").then(m => m.default);

const philipsHueTest = async () => {
  const hueService = new HueService(
    process.env.PHILIPS_HUE_KEY,
    process.env.PHILIPS_HUE_IP
  );
  await hueService.connect();

  const inputPrompt = process.argv[2];

  const reactAgentResponse = await reactAgent(inputPrompt);
  // const reactAgentResponse = await emotionalAgent(inputPrompt);

  await logResponse("React Agent", `${reactAgentResponse}`);

  const colors = processAgentResponse(reactAgentResponse);
  const chalk = await chalkOriginal;

  await hueService.updateLightColors(colors);
  logWithTimestamp(chalk.green("Done!"));
};

philipsHueTest().catch(error => {
  console.error("An error occurred:", error);
});
// const philipsHueTest = async () => {
//   const hueService = new HueService(
//     process.env.PHILIPS_HUE_KEY,
//     process.env.PHILIPS_HUE_IP
//   );
//   await hueService.connect();

//   const inputPrompt = process.argv[2];
//   const firstAgentResponse = await firstAgent(inputPrompt);
//   await logResponse(
//     "First Agent",
//     `Received color settings: ${firstAgentResponse}`
//   );

//   const secondAgentResponse = await secondAgent(
//     inputPrompt,
//     firstAgentResponse
//   );
//   await logResponse(
//     "Second Agent",
//     `Adjusted color settings based on input: ${secondAgentResponse}`
//   );

//   const colors = processSecondAgentResponse(secondAgentResponse);
//   const chalk = await chalkOriginal;

//   await hueService.updateLightColors(colors);
//   logWithTimestamp(chalk.green("Done!"));
// };

// const moodSongTest = async () => {
//   const hueService = new HueService(
//     process.env.PHILIPS_HUE_KEY,
//     process.env.PHILIPS_HUE_IP
//   );
//   await hueService.connect();

//   const inputPrompt = process.argv[2];

//   const groqSynesthesiaAgent = new GroqSynesthesiaAgent();
//   const agentResponse = await groqSynesthesiaAgent.processInput({
//     input: inputPrompt,
//   });
//   await logResponse(
//     "Synesthesia Agent",
//     `Received color settings: ${agentResponse}`
//   );

//   // const colors = processAgentResponse(agentResponse);
//   const colors = processSecondAgentResponse(agentResponse);
//   const chalk = await chalkOriginal;
//   const lights = await hueService.getAllLights();

//   if (lights.length < 3) {
//     logWithTimestamp(
//       chalk.red("Error: Se necesitan al menos 3 focos para continuar.")
//     );
//     return;
//   }

//   await hueService.updateLightColors(lights, colors);
//   logWithTimestamp(chalk.green("Done!"));
// };

// moodSongTest().catch(error => {
//   console.error("An error occurred:", error);
// });
