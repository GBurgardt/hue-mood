const chalkOriginal = import("chalk").then(m => m.default);

const logWithTimestamp = message => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${message}`);
};

const logResponse = async (agent, response) => {
  const chalk = await chalkOriginal;
  logWithTimestamp(chalk.blue(`${agent} Response: `) + chalk.green(response));
};

module.exports = { logWithTimestamp, logResponse };
