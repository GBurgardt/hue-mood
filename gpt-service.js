const firstAgent = async textolibre => {
  const url = "https://api.openai.com/v1/chat/completions";

  const headers = {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json",
  };

  const messages = [
    {
      role: "user",
      content: `
Como agente especializado, ahora te pediré que generes tres colores del círculo de colores, ampliando nuestra capacidad de representación ambiental. El círculo de colores consiste en:
{red: 0, orange: 30, yellow: 60, green: 120, cyan: 180, blue: 240, purple: 270, pink: 330}
Tu objetivo es seleccionar tres colores que representen de manera realista la iluminación de un ambiente específico. Además de elegir los colores, proporcionarás la intensidad de cada uno en una escala de 0 a 100 para ajustar la iluminación de acuerdo con el entorno descrito.

Ejemplos:
- En una playa soleada al mediodía, podrías elegir "61 90, 216 40, 120 30", donde 61 es un amarillo brillante para el sol (intensidad 90), 216 un azul claro para el cielo (intensidad 40), y 120 un verde suave para reflejar el entorno natural (intensidad 30).
- Acampando de noche junto a una fogata, podrías seleccionar "50 80, 40 5, 120 10", donde 50 es un naranja cálido para la fogata (intensidad 80), 40 un negro profundo para la noche (intensidad 5), y 120 un verde oscuro para los árboles o la naturaleza circundante (intensidad 10).

La mejora en la selección de colores implica considerar no solo los elementos principales del ambiente (como el sol o la fogata) sino también incorporar un tercer elemento que complemente y enriquezca la ambientación, como el cielo, la vegetación, o elementos urbanos, dependiendo del contexto.

Recuerda, el formato de tu respuesta es crucial y debe seguir la estructura: "Color1 Intensidad1, Color2 Intensidad2, Color3 Intensidad3".

Input: ${textolibre}
Output:`,
      // content: `Como agente especializado, te voy a pedir que generes dos colores del circulo de colores. El circulo de colores es esto:
      // {red: 0, orange: 30, yellow: 60, green: 120, cyan: 180, blue: 240, purple: 270, pink: 330}
      // Representen la iluminación en un ambiente determinado. Antes de darte ejemplos, es importante entender cómo interpretar la lista de colores. Los colores en la lista, como 'red', 'orange', etc., representan diferentes colores en el espectro de colores. Por ejemplo, entre 'red' (0) y 'orange' (30), '0' sería un rojo puro, '10' un rojo ligeramente anaranjado, y '20' aún más anaranjado. La idea es que generes dos colores que sean realistas y representen fielmente la iluminación en el entorno descrito. Ademas para cada color debes dar su intensidad también, entre 0 y 100.\n\nAhora los ejemplos:\n\nSi digo: \"Estás en una playa soleada al mediodía.\", tu respuesta debería ser: \"61 90, 216 40\". (61 representando la luz brillante del sol (90 de intensidad) y 216 el cielo azul claro no tan intenso)\nSi digo: \"Estás acampando de noche sentado al lado de una fogata.\", tu respuesta debería ser: \"50 80, 40 5\". (50 representando el naranja cálido de la fogata y 40 con intensidad muy baja (5) representando noche negra y una oscura luna)\n\nAhora, tomando en cuenta esta descripción ambiental, por favor, genera dos colores que representen la iluminación en ese entorno con sus rerpectivas intensidades.\" Recuerda, el formato de respuesta es crucial, siempre debe ser: \"Color1 Intensidad1, Color2 Intensidad2\". \n\nInput: ${textolibre}\nOutput:`,
    },
    {
      role: "system",
      content:
        "Eres un asistente que proporciona la iluminación adecuada para ambientes determinados utilizando el circulo de colores. Tras recibir una descripción de un entorno, deberás sugerir tres colores del círculo de colores que representen la iluminación de ese entorno para tres focos distintos. Además deberás decir sus respectivas intensidades. Por favor, asegúrate de proporcionar siempre las respuestas en el formato 'color1 intensidad1, color2 intensidad2, color3 intensidad3'. Comienza con la descripción del ambiente que te voy a dar.",
    },
  ];

  // console.log("messages", messages);

  const body = {
    model: "gpt-4-0613",
    messages,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (data.choices && data.choices.length > 0) {
    return data.choices[0].message.content;
  } else {
    console.log("data", data);
    return "error";
  }
};

const secondAgent = async (inputPrompt, agent1Response) => {
  const url = "https://api.openai.com/v1/chat/completions";

  const headers = {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json",
  };

  const messages = [
    {
      role: "user",
      // content: `Como agente especializado en iluminación, necesito que evalúes y corrijas si es necesario la siguiente respuesta. Antes de eso, es importante entender cómo interpretar el círculo de colores. El círculo de colores es: {red: 0, orange: 30, yellow: 60, green: 120, cyan: 180, blue: 240, purple: 270, pink: 330}. Los números representan diferentes colores en el espectro. Por ejemplo, '0' es rojo puro, '30' es naranja, etc. Con este entendimiento, el prompt original es: '${inputPrompt}'. La respuesta del primer agente es: '${agent1Response}'. Basándote en el prompt y el círculo de colores, proporciona una respuesta corregida comenzando con los valores de color e intensidad en el formato 'Color1 Intensidad1, Color2 Intensidad2'. Si es necesario, añade una explicación después de los valores.\nTen en cuenta que no necesariamente la respuesta del agente 1 está mal. De hecho, es probable que esté bastante acertada. Tu trabajo es solo averiguarlo. No la descartes de primeras.\n\nEjemplo:\n\nInput: Estás en una habitación oscura con una sola vela encendida.\nRespuesta Agente 1: '61 90, 216 40'\nRespuesta Corregida: '40 5, 0 0' - 40 representa la luz tenue de la vela y 0 0 la oscuridad completa en el resto de la habitación.`,
      content: `
Como agente especializado en iluminación y perfeccionamiento, tu nueva tarea es evaluar y, si es necesario, corregir respuestas que ahora incluyen la selección de tres colores del círculo de colores para una representación ambiental más completa. El círculo de colores es: {red: 0, orange: 30, yellow: 60, green: 120, cyan: 180, blue: 240, purple: 270, pink: 330}. Recuerda, los números representan diferentes colores en el espectro, y tu corrección debe reflejar de manera precisa el ambiente descrito en el 'inputPrompt', considerando ahora tres colores e intensidades.

El prompt original del primer agente es: '${inputPrompt}'. La respuesta inicial es: '${agent1Response}'. Basándote en el prompt, el círculo de colores y la necesidad de adaptarnos a tres focos de iluminación, proporciona una respuesta corregida comenzando con 'Color1 Intensidad1, Color2 Intensidad2, Color3 Intensidad3'. Si crees necesario realizar ajustes, añade una explicación después de los valores para detallar el razonamiento detrás de tu corrección.

Ejemplo:
Input: Estás en una habitación oscura con una sola vela encendida.
Respuesta Agente 1: '50 80, 40 5, 120 10'
Respuesta Corregida: '40 5, 0 0, 0 0' - 40 representa la luz tenue de la vela, los dos '0 0' representan la completa oscuridad en el resto de la habitación, ajustando al formato de tres colores.

Tu trabajo es perfeccionar estas respuestas, asegurándote de que los tres colores seleccionados ofrezcan una representación detallada y atmosférica del entorno descrito, utilizando el círculo de colores como referencia. Ten en cuenta que la respuesta original no necesariamente está equivocada; tu tarea es evaluarla críticamente y ajustarla si es necesario para adaptarnos al nuevo esquema de tres focos.      
      `,
    },
    {
      role: "system",
      content:
        "Eres un asistente que evalúa y corrige respuestas sobre configuraciones de iluminación basadas en descripciones de ambientes. Tu principal tarea es asegurar que las respuestas sigan un formato estandarizado 'color1 intensidad1, color2 intensidad2' para facilitar su procesamiento posterior. Después de los valores, puedes añadir explicaciones si son necesarias.",
    },
  ];

  const body = {
    model: "gpt-4-0613",
    messages,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (data.choices && data.choices.length > 0) {
    return data.choices[0].message.content;
  } else {
    console.log("data", data);
    return "error";
  }
};

module.exports = {
  firstAgent,
  secondAgent,
};
