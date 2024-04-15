const Groq = require("groq-sdk");

class GroqSynesthesiaAgent {
  groq;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env["GROQ_API_KEY"],
    });
  }

  async processInput({ input }) {
    console.log("#### GROQ API KEY: ", process.env["GROQ_API_KEY"]);
    console.log(">>>>> Synesthesia Groq Agent <<<<<");
    console.log("- input: ", input);

    const messages = [
      {
        role: "system",
        content:
          "Eres un asistente que traduce letras de canciones a ambientes de iluminación sinestésicos utilizando el círculo de colores. Tras recibir un fragmento de letra, deberás sugerir tres colores del círculo de colores que representen las emociones y sensaciones evocadas por las palabras, para tres focos distintos. Además, deberás indicar sus respectivas intensidades. Por favor, asegúrate de proporcionar siempre las respuestas en el formato 'Color1 Intensidad1, Color2 Intensidad2, Color3 Intensidad3'. Comienza con el fragmento de letra que te voy a dar.",
      },
      {
        role: "user",
        content: `
Como agente experto en sinestesia, tu tarea es traducir frases o palabras de una canción a colores. Te iré pasando bloques de texto, y tú deberás indicar los colores (e intensidades) que evocan arquetípicamente las palabras.
El círculo de colores consiste en: {red: 0, orange: 30, yellow: 60, green: 120, cyan: 180, blue: 240, purple: 270, pink: 330}
Tu objetivo es seleccionar tres colores que representen de manera realista las emociones y sensaciones evocadas por las letras. Además de elegir los colores, proporcionarás la intensidad de cada uno en una escala de 0 a 100 para ajustar la iluminación de acuerdo con el impacto emocional de las palabras.
Ejemplos
<<<
Ejemplo 1:

- Input: "una playa soleada al mediodía"
- Output: "61 90, 216 40, 120 30"

Ejemplo 2:

- Input: "Acampando de noche junto a una fogata"
- Output: "50 80, 40 5, 120 10"
>>>

Explicaciones de los ejemplos (esto slo te lo explico yo a vos para q entiendas la lógica y los patrones. no debes darme explicaciones tu a mi, nunca)
<<<
- Ejemplo 1: 61 es un amarillo brillante para el sol (intensidad 90), 216 un azul claro para el cielo (intensidad 40), y 120 un verde suave para reflejar el entorno natural (intensidad 30).
- Ejemplo 2: 50 es un naranja cálido para la fogata (intensidad 80), ...etc.
>>>

La mejora en la selección de colores implica considerar no solo los elementos principales del ambiente (como el sol o la fogata) sino también incorporar un tercer elemento que complemente y enriquezca la ambientación, como el cielo, la vegetación, o elementos urbanos, dependiendo del contexto.

Recuerda, el formato de tu respuesta es crucial y debe seguir la estructura: "Color1 Intensidad1, Color2 Intensidad2, Color3 Intensidad3".
Input: ${input}
Output:`,
      },
    ];

    const completion = await this.groq.chat.completions.create({
      messages,
      model: "mixtral-8x7b-32768",
      // model: "gemma-7b-it",
    });

    console.log("###### GROQ ORIGINAL MSG: ", completion);
    console.log(completion.choices[0]?.message?.content);

    return completion.choices[0]?.message?.content || "";
  }
}

module.exports = GroqSynesthesiaAgent;
