const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function validateCarnetPhoto(file) {
  if (!GROQ_API_KEY) {
    console.warn('EXPO_PUBLIC_GROQ_API_KEY no estÃ¡ configurada en Frontend/.env');
  }
  

  const base64 = await fileToBase64(file);

  const prompt = `Analiza esta foto para un carnet estudiantil del SENA y responde con un objeto JSON valilido con esta estructura exacta, sin texto adicional ni markdown:\n\n{\n  "valid": boolean,\n  "errors": ["error1", "error2", ...]\n}\n\nCRITERIOS OBLIGATORIOS (todos deben cumplirse):\n1. Fondo blanco, claro o transparente, sin objetos distractores\n2. Rostro visible, centrado y mirando a cÃ¡mara\n3. Sin gafas oscuras, gorras, pañoletas o accesorios que cubran el rostro\n4. Expresion neutral (boca cerrada, sin sonreir)\n5. Iluminacion uniforme (sin sombras fuertes en rostro ni fondo)`;

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_VISION_MODEL,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:${file.type || 'image/jpeg'};base64,${base64}` } },
        ],
      }],
      max_completion_tokens: 512,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const rawError = await response.text();
    let errMessage = response.statusText;

    try {
      const errBody = JSON.parse(rawError);
      errMessage = errBody?.error?.message || errMessage;
    } catch {
      if (rawError) {
        errMessage = rawError.slice(0, 300);
      }
    }

    throw new Error(`Groq error ${response.status}: ${errMessage}`);
  }

  

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || '';

  const clean = text.replace(/```json|```/g, '').trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Respuesta inesperada de Groq: ${text.slice(0, 200)}`);

  try {
    return JSON.parse(match[0]);
  } catch {
    throw new Error(`JSON invalido en respuesta de Groq: ${match[0].slice(0, 200)}`);
  }
}

