const { firstAgent, secondAgent } = require("./gpt-service.js");
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
    "GesIZHgaAc4JF1BppESBpNg7D9Kk7LFtvAUiHCGr",
    "192.168.1.2"
  );
  await hueService.connect();

  const inputPrompt = process.argv[2];
  const firstAgentResponse = await firstAgent(inputPrompt);

  const secondAgentResponse = await secondAgent(
    inputPrompt,
    firstAgentResponse
  );

  const finalColors = processSecondAgentResponse(secondAgentResponse);

  const colors = finalColors.replace(/"/g, "").trim().split(",");

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

const getXYPointFromRGB = ({ redI, greenI, blueI }) => {
  // Normalización de los valores RGB
  let red = redI / 255.0;
  let green = greenI / 255.0;
  let blue = blueI / 255.0;

  // Corrección gamma
  red =
    red > 0.04045 ? Math.pow((red + 0.055) / (1.0 + 0.055), 2.4) : red / 12.92;
  green =
    green > 0.04045
      ? Math.pow((green + 0.055) / (1.0 + 0.055), 2.4)
      : green / 12.92;
  blue =
    blue > 0.04045
      ? Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4)
      : blue / 12.92;

  // Conversión a espacio de color XYZ
  let X = red * 0.664511 + green * 0.154324 + blue * 0.162028;
  let Y = red * 0.283881 + green * 0.668433 + blue * 0.047685;
  let Z = red * 0.000088 + green * 0.07231 + blue * 0.986039;

  // Conversión a coordenadas CIE 1931 xy
  let cx = X / (X + Y + Z);
  let cy = Y / (X + Y + Z);

  // Representación del punto XY
  let xyPoint = { x: cx, y: cy };

  // Aquí se deberían agregar las verificaciones y correcciones, si es necesario
  // Por ejemplo, checkPointInLampsReach y getClosestPointToPoint en la versión Python.
  // Estas funciones deberían ser implementadas de acuerdo a las especificaciones del dispositivo.

  // return xyPoint;
  // return como string tipo "
};
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
