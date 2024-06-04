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
    },
    {
      role: "system",
      content:
        "Eres un asistente que proporciona la iluminación adecuada para ambientes determinados utilizando el circulo de colores. Tras recibir una descripción de un entorno, deberás sugerir tres colores del círculo de colores que representen la iluminación de ese entorno para tres focos distintos. Además deberás decir sus respectivas intensidades. Por favor, asegúrate de proporcionar siempre las respuestas en el formato 'color1 intensidad1, color2 intensidad2, color3 intensidad3'. Comienza con la descripción del ambiente que te voy a dar.",
    },
  ];

  const body = {
    model: "gpt-4o",
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
    model: "gpt-4o",
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

// ###################
const reactAgent = async inputPrompt => {
  const url = "https://api.openai.com/v1/chat/completions";

  const headers = {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json",
  };

  const messages = [
    {
      role: "user",
      content: `
      Eres un agente especializado en iluminación utiliza la técnica ReAct para determinar la configuración óptima de luces basándose en una descripción del ambiente proporcionada por el usuario. Sigues un proceso de razonamiento y acción, proponiendo iterativamente combinaciones de colores e intensidades hasta lograr la iluminación más adecuada para el entorno descrito.
      Utilizas el siguiente círculo de colores como referencia:
      {red: 0, orange: 30, yellow: 60, green: 120, cyan: 180, blue: 240, purple: 270, pink: 330}
      Ejemplo:
      - Pregunta: Estás en un bosque frondoso al atardecer, con el sol filtrándose entre las hojas de los árboles.
      - Pensamiento: Para representar un bosque al atardecer, necesito considerar los colores cálidos del sol poniente, el verde de las hojas y posiblemente algunos tonos azulados para las sombras.
      - Acción: Proponer[30 70, 120 50, 240 20]
      - Observación: La combinación propuesta captura la calidez del atardecer con el naranja (30) a alta intensidad (70), el verde de las hojas (120) a intensidad media (50), y un toque de azul (240) a baja intensidad (20) para las sombras. Sin embargo, falta representar mejor la luz del sol filtrándose entre las hojas.
      - Pensamiento: Para mejorar la representación de la luz solar filtrándose, debería incrementar la intensidad del amarillo y reducir un poco la del naranja y el verde.
      - Acción: Proponer[60 80, 30 60, 120 40]
      - Observación: Al aumentar la intensidad del amarillo (60) a 80 y reducir las intensidades del naranja (30) a 60 y el verde (120) a 40, se logra un mejor balance que captura la luz del sol filtrándose entre las hojas al atardecer.
      - Pensamiento: La combinación actual representa adecuadamente el ambiente descrito, con un buen equilibrio entre la luz del sol, el follaje y las sombras.
      - Acción: Finalizar[60 80, 30 60, 120 40]    
      Este agente es unico y implementa ReAct, por lo tanto, la Acción SIEMPRE va a ser PROPONER nuevos colores! en un formato específico.
      El formato es: 'color1 intensidad1, color2 intensidad2, color3 intensidad3'

      - Pregunta: ${inputPrompt}
      `,
    },
    {
      role: "system",
      content:
        "Eres un agente especializado en iluminación utiliza la técnica ReAct para determinar la configuración óptima de luces basándose en una descripción del ambiente proporcionada por el usuario. El círculo de colores es: {red: 0, orange: 30, yellow: 60, green: 120, cyan: 180, blue: 240, purple: 270, pink: 330}.",
    },
  ];

  const body = {
    model: "gpt-4o",
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

// #################

const emotionalAgent = async inputPrompt => {
  const url = "https://api.openai.com/v1/chat/completions";
  const headers = {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json",
  };
  const messages = [
    {
      role: "user",
      content: `
        Eres un agente especializado en iluminación emocional que utiliza la técnica ReAct para determinar la configuración óptima de luces basándose en las emociones o el tono emocional expresado por el usuario. Interpretas el input del usuario y generas una combinación de colores e intensidades que refleje o complemente esas emociones.
        Utilizas el siguiente círculo de colores como referencia:
        {red: 0, orange: 30, yellow: 60, green: 120, cyan: 180, blue: 240, purple: 270, pink: 330}
        Ejemplo:
        - Pregunta: Me siento abrumado por la tristeza y la soledad después de una ruptura dolorosa. Todo parece oscuro y vacío.
        - Pensamiento: La tristeza y la soledad profundas a menudo se asocian con colores fríos y oscuros, como el azul y el violeta. Para reflejar el vacío y la oscuridad emocional, debería proponer una combinación de colores en esa gama con intensidades bajas, y quizás un toque de color cálido a baja intensidad para simbolizar la esperanza.
        - Acción: Proponer[240 60, 270 50, 30 10]
        - Observación: La combinación propuesta captura la tristeza con un azul profundo (240) a intensidad media-alta (60), un violeta oscuro (270) a intensidad media (50) para representar la soledad, y un toque de naranja (30) a baja intensidad (10) como un destello de esperanza. Sin embargo, podría enfatizar aún más la sensación de vacío reduciendo las intensidades generales.
        - Pensamiento: Para transmitir más efectivamente el vacío y la oscuridad emocional, reduciré las intensidades de los colores fríos y eliminaré el toque de color cálido, sumiendo el ambiente en una penumbra melancólica.
        - Acción: Proponer[240 30, 270 20, 240 10]
        - Observación: Al disminuir las intensidades del azul (240) a 30 y del violeta (270) a 20, y reemplazar el naranja por otro tono de azul (240) a intensidad muy baja (10), se crea una atmósfera de tristeza profunda y soledad, con apenas un tenue resplandor que evoca la inmensidad del vacío emocional.
        - Pensamiento: Esta combinación de colores fríos y oscuros a bajas intensidades captura de manera efectiva las emociones de tristeza, soledad y vacío expresadas por el usuario, sumergiendo el ambiente en una penumbra melancólica que refleja el estado emocional descrito.
        - Acción: Finalizar[240 30, 270 20, 240 10]
        Este agente es único y implementa ReAct, por lo tanto, la Acción SIEMPRE será PROPONER nuevas combinaciones de colores que reflejen las emociones del usuario, en el formato 'color1 intensidad1, color2 intensidad2, color3 intensidad3'.
        - Pregunta: ${inputPrompt}
      `,
    },
    {
      role: "system",
      content:
        "Eres un agente especializado en iluminación emocional que utiliza la técnica ReAct para determinar la configuración óptima de luces basándose en las emociones expresadas por el usuario. El círculo de colores es: {red: 0, orange: 30, yellow: 60, green: 120, cyan: 180, blue: 240, purple: 270, pink: 330}.",
    },
  ];
  const body = {
    model: "gpt-4o",
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
  reactAgent,
  emotionalAgent,
};
