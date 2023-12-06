const { environmentToColors } = require("./gpt-service.js");
const { api: hueApi } = require("node-hue-api").v3;

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
    const state = { on: true, bri: brightness, hue };
    await hueService.setLightState(lights[i].id, state);
  }
};

const philipsHueTest = async () => {
  const hueService = new HueService(
    "GesIZHgaAc4JF1BppESBpNg7D9Kk7LFtvAUiHCGr",
    "192.168.1.2"
  );
  await hueService.connect();

  const inputPrompt = process.argv[2];
  const colors = (await environmentToColors(inputPrompt))
    .replace(/"/g, "")
    .trim()
    .split(",");

  const lights = await hueService.getAllLights();
  if (lights.length < 2) {
    console.error("Se necesitan al menos 2 focos para continuar.");
    return;
  }

  await updateLightColors(hueService, lights, colors);
};

philipsHueTest().then(() => {
  console.log("Done!");
});

// const { api: hueApi } = require("node-hue-api").v3;

// class HueService {
//   constructor(username, ipAddress) {
//     this.username = username;
//     this.ipAddress = ipAddress;
//   }

//   async connect() {
//     this.API = await hueApi.createLocal(this.ipAddress).connect(this.username);
//     this.bridgeConfig = await this.API.configuration.getConfiguration();
//   }

//   async setLightState(lightId, state) {
//     return await this.API.lights.setLightState(lightId, state);
//   }

//   async getAllLights() {
//     return await this.API.lights.getAll();
//   }
// }

// const philipsHueTest = async () => {
//   const hueService = new HueService(
//     "GesIZHgaAc4JF1BppESBpNg7D9Kk7LFtvAUiHCGr",
//     "192.168.1.2"
//   );

//   await hueService.connect();

//   const inputPrompt = process.argv[2];

//   const colorsEnvironment = await environmentToColors(inputPrompt);
//   const colorsEnvironmentWithoutQuotes = colorsEnvironment.replace(/"/g, "");
//   const colors = colorsEnvironmentWithoutQuotes.trim().split(","); // ["61 90", "216 40"] donde 61 es el color y 90 la intensidad

//   const lights = await hueService.getAllLights();

//   if (lights.length < 2) {
//     console.error("Se necesitan al menos 2 focos para continuar.");
//     return;
//   }

//   for (let i = 0; i < 2; i++) {
//     const colorIntensity = colors[i].trim().split(" ");
//     const hueValue = Math.round(
//       (Number(colorIntensity[0].trim()) / 360) * 65535
//     );
//     const brightnessValue = Math.round(
//       (Number(colorIntensity[1].trim()) / 100) * 254
//     );

//     const state = { on: true, bri: brightnessValue, hue: hueValue };
//     await hueService.setLightState(lights[i].id, state);
//   }
// };

// const environmentToColors = async textolibre => {
//   const url = "https://api.openai.com/v1/chat/completions";

//   const headers = {
//     Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//     "Content-Type": "application/json",
//   };

//   const messages = [
//     {
//       role: "user",
//       content: `Como agente especializado, te voy a pedir que generes dos colores del circulo de colores. El circulo de colores es esto:
//       {red: 0, orange: 30, yellow: 60, green: 120, cyan: 180, blue: 240, purple: 270, pink: 330}
//       Representen la iluminación en un ambiente determinado. Antes de darte ejemplos, es importante entender cómo interpretar la lista de colores. Los colores en la lista, como 'red', 'orange', etc., representan diferentes colores en el espectro de colores. Por ejemplo, entre 'red' (0) y 'orange' (30), '0' sería un rojo puro, '10' un rojo ligeramente anaranjado, y '20' aún más anaranjado. La idea es que generes dos colores que sean realistas y representen fielmente la iluminación en el entorno descrito. Ademas para cada color debes dar su intensidad también, entre 0 y 100.\n\nAhora los ejemplos:\n\nSi digo: \"Estás en una playa soleada al mediodía.\", tu respuesta debería ser: \"61 90, 216 40\". (61 representando la luz brillante del sol (90 de intensidad) y 216 el cielo azul claro no tan intenso)\nSi digo: \"Estás acampando de noche sentado al lado de una fogata.\", tu respuesta debería ser: \"50 80, 40 5\". (50 representando el naranja cálido de la fogata y 40 con intensidad muy baja (5) representando noche negra y una oscura luna)\n\nAhora, tomando en cuenta esta descripción ambiental, por favor, genera dos colores que representen la iluminación en ese entorno con sus rerpectivas intensidades.\" Recuerda, el formato de respuesta es crucial, siempre debe ser: \"Color1 Intensidad1, Color2 Intensidad2\". \n\nInput: ${textolibre}\nOutput:`,
//     },
//     {
//       role: "system",
//       content:
//         "Eres un asistente que proporciona la iluminación adecuada para ambientes determinados utilizando el circulo de colores. Tras recibir una descripción de un entorno, deberás sugerir dos colores del círculo de colores que representen la iluminación de ese entorno para dos focos distintos. Además deberás decir sus respectivas intensidades. Por favor, asegúrate de proporcionar siempre las respuestas en el formato 'color1 intensidad1, color2 intensidad2'. Comienza con la descripción del ambiente que te voy a dar.",
//     },
//   ];

//   console.log("messages", messages);

//   const body = {
//     model: "gpt-4-0613",
//     messages,
//   };

//   const response = await fetch(url, {
//     method: "POST",
//     headers: headers,
//     body: JSON.stringify(body),
//   });

//   const data = await response.json();

//   if (data.choices && data.choices.length > 0) {
//     return data.choices[0].message.content;
//   } else {
//     console.log("data", data);
//     return "error";
//   }
// };

// philipsHueTest().then(() => {
//   console.log("Done!");
// });
