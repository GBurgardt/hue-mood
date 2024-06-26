const { api: hueApi } = require("node-hue-api").v3;
const { parseColorIntensity } = require("./utils.js");

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

  async updateLightColors(colors) {
    const lights = await this.API.lights.getAll();

    if (lights.length < 3) {
      logWithTimestamp(
        chalk.red("Error: Se necesitan al menos 3 focos para continuar.")
      );
      return;
    }
    const updatePromises = lights
      .slice(0, colors.length)
      .map((light, index) => {
        const { hue, brightness } = parseColorIntensity(colors[index]);
        const state = { on: brightness > 0, bri: brightness, hue };
        return this.setLightState(light.id, state);
      });
    await Promise.all(updatePromises);
  }
}

module.exports = { HueService };
