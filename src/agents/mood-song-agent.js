const Groq = require("groq-sdk");

class GroqSynesthesiaAgent {
  groq;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env["GROQ_API_KEY"],
    });
  }

  async firstAgent(textolibre) {
    console.log(">>>>> First Groq Agent <<<<<");
    console.log("- input: ", textolibre);

    const messages = [
      {
        role: "user",
        content: `
  Como agente experto en sinestesia, tu tarea es traducir frases o palabras de una canción a colores. Te iré pasando bloques de texto, y tú deberás indicar los colores (e intensidades) que evocan arquetípicamente las palabras.
  El círculo de colores consiste en: {red: 0, orange: 30, yellow: 60, green: 120, cyan: 180, blue: 240, purple: 270, pink: 330}
  Tu objetivo es seleccionar tres colores que representen de manera realista las emociones y sensaciones evocadas por las letras. Además de elegir los colores, proporcionarás la intensidad de cada uno en una escala de 0 a 100 para ajustar la iluminación de acuerdo con el impacto emocional de las palabras.
  Ejemplos:
  - Para la frase "Mi corazón arde de pasión por ti", podrías elegir "0 90, 30 70, 330 40", donde 0 es un rojo intenso para la pasión (intensidad 90), 30 un naranja cálido para el ardor (intensidad 70), y 330 un rosa suave para el amor (intensidad 40).
  - Para "Perdido en un océano de tristeza", podrías seleccionar "240 80, 180 30, 270 20", donde 240 es un azul profundo para la tristeza (intensidad 80), 180 un cyan oscuro para el océano (intensidad 30), y 270 un púrpura melancólico (intensidad 20).
  Recuerda, el formato de tu respuesta es crucial y debe seguir la estructura: "Color1 Intensidad1, Color2 Intensidad2, Color3 Intensidad3".
  Input: ${textolibre}
  Output:`,
      },
      {
        role: "system",
        content:
          "Eres un asistente que traduce letras de canciones a ambientes de iluminación sinestésicos utilizando el círculo de colores. Tras recibir un fragmento de letra, deberás sugerir tres colores del círculo de colores que representen las emociones y sensaciones evocadas por las palabras, para tres focos distintos. Además, deberás indicar sus respectivas intensidades. Por favor, asegúrate de proporcionar siempre las respuestas en el formato 'color1 intensidad1, color2 intensidad2, color3 intensidad3'. Comienza con el fragmento de letra que te voy a dar.",
      },
    ];

    const completion = await this.groq.chat.completions.create({
      messages,
      model: "gemma-7b-it",
    });

    console.log("###### GROQ ORIGINAL MSG: ", completion);
    console.log(completion.choices[0]?.message?.content);

    return completion.choices[0]?.message?.content || "";
  }

  async secondAgent(inputPrompt, agent1Response) {
    console.log(">>>>> Second Groq Agent <<<<<");
    console.log("- inputPrompt: ", inputPrompt);
    console.log("- agent1Response: ", agent1Response);

    const messages = [
      {
        role: "user",
        content: `
  Como agente especializado en iluminación y perfeccionamiento, tu tarea es evaluar y, si es necesario, corregir respuestas que ahora incluyen la selección de tres colores del círculo de colores para una representación sinestésica más completa de las letras de canciones. El círculo de colores es: {red: 0, orange: 30, yellow: 60, green: 120, cyan: 180, blue: 240, purple: 270, pink: 330}. Recuerda, los números representan diferentes colores en el espectro, y tu corrección debe reflejar de manera precisa las emociones y sensaciones evocadas por las palabras en el 'inputPrompt', considerando ahora tres colores e intensidades.
  El prompt original del primer agente es: '${inputPrompt}'. La respuesta inicial es: '${agent1Response}'. Basándote en el prompt, el círculo de colores y la necesidad de adaptarnos a tres focos de iluminación, proporciona una respuesta corregida comenzando con 'Color1 Intensidad1, Color2 Intensidad2, Color3 Intensidad3'. Si crees necesario realizar ajustes, añade una explicación después de los valores para detallar el razonamiento detrás de tu corrección.
  Ejemplo:
  Input: "En la oscuridad de la noche, mi alma llora de soledad"
  Respuesta Agente 1: '240 80, 270 60, 0 20'
  Respuesta Corregida: '240 90, 270 70, 0 10' - Aumenté la intensidad del azul y el púrpura para enfatizar la profundidad de la oscuridad y la soledad, y reduje la intensidad del rojo para que sea un acento sutil de angustia emocional.
  Tu trabajo es perfeccionar estas respuestas, asegurándote de que los tres colores seleccionados ofrezcan una representación detallada y atmosférica de las emociones y sensaciones evocadas por las letras, utilizando el círculo de colores como referencia. Ten en cuenta que la respuesta original no necesariamente está equivocada; tu tarea es evaluarla críticamente y ajustarla si es necesario para adaptarnos al nuevo esquema de tres focos.
        `,
      },
      {
        role: "system",
        content:
          "Eres un asistente que evalúa y corrige respuestas sobre configuraciones de iluminación basadas en descripciones de ambientes. Tu principal tarea es asegurar que las respuestas sigan un formato estandarizado 'color1 intensidad1, color2 intensidad2' para facilitar su procesamiento posterior. Después de los valores, puedes añadir explicaciones si son necesarias.",
      },
    ];

    console.log("###### GROQ ORIGINAL MSG: ", completion);
    console.log(completion.choices[0]?.message?.content);

    return completion.choices[0]?.message?.content || "";
  }
}

const firstAgent = async textolibre => {
  const agent = new GroqSynesthesiaAgent();
  return agent.firstAgent(textolibre);
};

const secondAgent = async (inputPrompt, agent1Response) => {
  const agent = new GroqSynesthesiaAgent();
  return agent.secondAgent(inputPrompt, agent1Response);
};

module.exports = {
  firstAgent,
  secondAgent,
};

// const firstAgent = async textolibre => {
//   const url = "https://api.openai.com/v1/chat/completions";
//   const headers = {
//     Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//     "Content-Type": "application/json",
//   };
//   const messages = [
//     {
//       role: "user",
//       content: `
// Como agente experto en sinestesia, tu tarea es traducir frases o palabras de una canción a colores. Te iré pasando bloques de texto, y tú deberás indicar los colores (e intensidades) que evocan arquetípicamente las palabras.
// El círculo de colores consiste en: {red: 0, orange: 30, yellow: 60, green: 120, cyan: 180, blue: 240, purple: 270, pink: 330}
// Tu objetivo es seleccionar tres colores que representen de manera realista las emociones y sensaciones evocadas por las letras. Además de elegir los colores, proporcionarás la intensidad de cada uno en una escala de 0 a 100 para ajustar la iluminación de acuerdo con el impacto emocional de las palabras.
// Ejemplos:
// - Para la frase "Mi corazón arde de pasión por ti", podrías elegir "0 90, 30 70, 330 40", donde 0 es un rojo intenso para la pasión (intensidad 90), 30 un naranja cálido para el ardor (intensidad 70), y 330 un rosa suave para el amor (intensidad 40).
// - Para "Perdido en un océano de tristeza", podrías seleccionar "240 80, 180 30, 270 20", donde 240 es un azul profundo para la tristeza (intensidad 80), 180 un cyan oscuro para el océano (intensidad 30), y 270 un púrpura melancólico (intensidad 20).
// Recuerda, el formato de tu respuesta es crucial y debe seguir la estructura: "Color1 Intensidad1, Color2 Intensidad2, Color3 Intensidad3".
// Input: ${textolibre}
// Output:`,
//     },
//     {
//       role: "system",
//       content:
//         "Eres un asistente que traduce letras de canciones a ambientes de iluminación sinestésicos utilizando el círculo de colores. Tras recibir un fragmento de letra, deberás sugerir tres colores del círculo de colores que representen las emociones y sensaciones evocadas por las palabras, para tres focos distintos. Además, deberás indicar sus respectivas intensidades. Por favor, asegúrate de proporcionar siempre las respuestas en el formato 'color1 intensidad1, color2 intensidad2, color3 intensidad3'. Comienza con el fragmento de letra que te voy a dar.",
//     },
//   ];
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

// const secondAgent = async (inputPrompt, agent1Response) => {
//   const url = "https://api.openai.com/v1/chat/completions";

//   const headers = {
//     Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//     "Content-Type": "application/json",
//   };

//   const messages = [
//     {
//       role: "user",
//       content: `
// Como agente especializado en iluminación y perfeccionamiento, tu tarea es evaluar y, si es necesario, corregir respuestas que ahora incluyen la selección de tres colores del círculo de colores para una representación sinestésica más completa de las letras de canciones. El círculo de colores es: {red: 0, orange: 30, yellow: 60, green: 120, cyan: 180, blue: 240, purple: 270, pink: 330}. Recuerda, los números representan diferentes colores en el espectro, y tu corrección debe reflejar de manera precisa las emociones y sensaciones evocadas por las palabras en el 'inputPrompt', considerando ahora tres colores e intensidades.
// El prompt original del primer agente es: '${inputPrompt}'. La respuesta inicial es: '${agent1Response}'. Basándote en el prompt, el círculo de colores y la necesidad de adaptarnos a tres focos de iluminación, proporciona una respuesta corregida comenzando con 'Color1 Intensidad1, Color2 Intensidad2, Color3 Intensidad3'. Si crees necesario realizar ajustes, añade una explicación después de los valores para detallar el razonamiento detrás de tu corrección.
// Ejemplo:
// Input: "En la oscuridad de la noche, mi alma llora de soledad"
// Respuesta Agente 1: '240 80, 270 60, 0 20'
// Respuesta Corregida: '240 90, 270 70, 0 10' - Aumenté la intensidad del azul y el púrpura para enfatizar la profundidad de la oscuridad y la soledad, y reduje la intensidad del rojo para que sea un acento sutil de angustia emocional.
// Tu trabajo es perfeccionar estas respuestas, asegurándote de que los tres colores seleccionados ofrezcan una representación detallada y atmosférica de las emociones y sensaciones evocadas por las letras, utilizando el círculo de colores como referencia. Ten en cuenta que la respuesta original no necesariamente está equivocada; tu tarea es evaluarla críticamente y ajustarla si es necesario para adaptarnos al nuevo esquema de tres focos.
//       `,
//     },
//     {
//       role: "system",
//       content:
//         "Eres un asistente que evalúa y corrige respuestas sobre configuraciones de iluminación basadas en descripciones de ambientes. Tu principal tarea es asegurar que las respuestas sigan un formato estandarizado 'color1 intensidad1, color2 intensidad2' para facilitar su procesamiento posterior. Después de los valores, puedes añadir explicaciones si son necesarias.",
//     },
//   ];

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

// module.exports = {
//   firstAgent,
//   secondAgent,
// };
