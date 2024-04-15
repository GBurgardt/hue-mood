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
          "Eres un asistente que traduce letras de canciones a ambientes de iluminación sinestésicos utilizando el círculo de colores. Tras recibir un fragmento de letra, deberás sugerir tres colores del círculo de colores que representen las emociones y sensaciones evocadas por las palabras, para tres focos distintos. Los colores sugeridos deben estar cerca entre sí en el círculo de colores, evitando combinaciones de colores muy distintos. Además, deberás indicar sus respectivas intensidades. Por favor, asegúrate de proporcionar siempre las respuestas en el formato 'Color1 Intensidad1, Color2 Intensidad2, Color3 Intensidad3'. Comienza con el fragmento de letra que te voy a dar.",
      },
      {
        role: "user",
        content: `
    Como agente experto en sinestesia, tu tarea es traducir fragmentos de letras de canciones a una experiencia de iluminación inmersiva. Te proporcionaré bloques de texto y tu objetivo será seleccionar tres colores del círculo cromático que representen de manera precisa las emociones y sensaciones evocadas por las palabras.

    El círculo de colores consiste en: {red: 0, orange: 30, yellow: 60, green: 120, cyan: 180, blue: 240, purple: 270, pink: 330}

    Recuerda:
    - Prioriza colores que estén muy cerca entre sí en el círculo cromático para crear transiciones suaves y coherentes.
    - Utiliza variaciones de intensidad de un mismo color o colores adyacentes cuando sea posible.
    - Considera el contexto general de la frase o estrofa, no solo palabras individuales.
    - Identifica las emociones y sensaciones predominantes en cada fragmento y tradúcelas en colores que las representen fielmente.
    - Varía las intensidades de manera más pronunciada para resaltar cambios significativos en las emociones o el tono de la canción.

    Tu objetivo es seleccionar tres colores que representen de manera realista las emociones y sensaciones evocadas por las letras. Los colores seleccionados deben estar cerca entre sí en el círculo de colores, priorizando un color dominante que mejor represente el ambiente descrito. Puedes sugerir variaciones de intensidad de un mismo color o colores adyacentes en el círculo de colores. Evita combinaciones de colores muy distintos.

    Además de elegir los colores, proporcionarás la intensidad de cada uno en una escala de 0 a 100 para ajustar la iluminación de acuerdo con el impacto emocional de las palabras.

    Ejemplos:

    Ejemplo 1:

    Input: "Caminando por un sendero en un bosque frondoso, con la luz del sol filtrándose entre las hojas"
    Output: "120 80, 100 70, 80 60"
    Explicación: Se sugieren tres tonos de verde (verde brillante, verde lima, verde oliva) para representar la frescura y vitalidad del bosque. Las intensidades decrecientes reflejan la luz del sol que se filtra suavemente entre las hojas, creando un ambiente tranquilo y sereno.
    Ejemplo 2:

    Input: "Bailando bajo las luces de neón en una discoteca, con la música electrónica vibrando en el aire"
    Output: "300 100, 315 90, 330 80"
    Explicación: Se sugieren tres tonos de morado y rosa intensos (morado eléctrico, magenta vibrante, rosa neón) para capturar la energía y la emoción de bailar en una discoteca iluminada por luces de neón. Las altas intensidades reflejan la vibración y la euforia del ambiente.
    Ejemplo 3:

    Input: "Contemplando un atardecer en la montaña, con el cielo transformándose en un lienzo de colores cálidos"
    Output: "20 80, 30 90, 40 100"
    Explicación: Se sugieren tres tonos de naranja y amarillo (naranja rojizo, naranja brillante, amarillo dorado) para representar la calidez y la belleza de un atardecer en la montaña. Las intensidades crecientes reflejan la intensificación de los colores a medida que el sol se pone en el horizonte.
    Ejemplo 4:

    Input: "Sumergido en las profundidades del océano, rodeado de una tranquilidad azul y misteriosa"
    Output: "180 90, 210 100, 240 80"
    Explicación: Se sugieren tres tonos de azul (turquesa profundo, azul marino, azul oscuro) para evocar la sensación de estar sumergido en las profundidades del océano. Las intensidades variables representan la mezcla de tranquilidad y misterio que se encuentra bajo la superficie del agua.

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
