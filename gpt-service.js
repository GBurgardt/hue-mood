const firstAgent = async textolibre => {
  const url = "https://api.openai.com/v1/chat/completions";

  const headers = {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json",
  };

  const messages = [
    {
      role: "user",
      content: `Como agente especializado, te voy a pedir que generes dos colores del circulo de colores. El circulo de colores es esto:
      {red: 0, orange: 30, yellow: 60, green: 120, cyan: 180, blue: 240, purple: 270, pink: 330}
      Representen la iluminación en un ambiente determinado. Antes de darte ejemplos, es importante entender cómo interpretar la lista de colores. Los colores en la lista, como 'red', 'orange', etc., representan diferentes colores en el espectro de colores. Por ejemplo, entre 'red' (0) y 'orange' (30), '0' sería un rojo puro, '10' un rojo ligeramente anaranjado, y '20' aún más anaranjado. La idea es que generes dos colores que sean realistas y representen fielmente la iluminación en el entorno descrito. Ademas para cada color debes dar su intensidad también, entre 0 y 100.\n\nAhora los ejemplos:\n\nSi digo: \"Estás en una playa soleada al mediodía.\", tu respuesta debería ser: \"61 90, 216 40\". (61 representando la luz brillante del sol (90 de intensidad) y 216 el cielo azul claro no tan intenso)\nSi digo: \"Estás acampando de noche sentado al lado de una fogata.\", tu respuesta debería ser: \"50 80, 40 5\". (50 representando el naranja cálido de la fogata y 40 con intensidad muy baja (5) representando noche negra y una oscura luna)\n\nAhora, tomando en cuenta esta descripción ambiental, por favor, genera dos colores que representen la iluminación en ese entorno con sus rerpectivas intensidades.\" Recuerda, el formato de respuesta es crucial, siempre debe ser: \"Color1 Intensidad1, Color2 Intensidad2\". \n\nInput: ${textolibre}\nOutput:`,
    },
    {
      role: "system",
      content:
        "Eres un asistente que proporciona la iluminación adecuada para ambientes determinados utilizando el circulo de colores. Tras recibir una descripción de un entorno, deberás sugerir dos colores del círculo de colores que representen la iluminación de ese entorno para dos focos distintos. Además deberás decir sus respectivas intensidades. Por favor, asegúrate de proporcionar siempre las respuestas en el formato 'color1 intensidad1, color2 intensidad2'. Comienza con la descripción del ambiente que te voy a dar.",
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
      content: `Como agente especializado en iluminación, necesito que evalúes y corrijas si es necesario la siguiente respuesta. Antes de eso, es importante entender cómo interpretar el círculo de colores. El círculo de colores es: {red: 0, orange: 30, yellow: 60, green: 120, cyan: 180, blue: 240, purple: 270, pink: 330}. Los números representan diferentes colores en el espectro. Por ejemplo, '0' es rojo puro, '30' es naranja, etc. Con este entendimiento, el prompt original es: '${inputPrompt}'. La respuesta del primer agente es: '${agent1Response}'. Basándote en el prompt y el círculo de colores, proporciona una respuesta corregida comenzando con los valores de color e intensidad en el formato 'Color1 Intensidad1, Color2 Intensidad2'. Si es necesario, añade una explicación después de los valores.\nTen en cuenta que no necesariamente la respuesta del agente 1 está mal. De hecho, es probable que esté bastante acertada. Tu trabajo es solo averiguarlo. No la descartes de primeras.\n\nEjemplo:\n\nInput: Estás en una habitación oscura con una sola vela encendida.\nRespuesta Agente 1: '61 90, 216 40'\nRespuesta Corregida: '40 5, 0 0' - 40 representa la luz tenue de la vela y 0 0 la oscuridad completa en el resto de la habitación.`,
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
