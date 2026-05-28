const GEMINI_API_KEY = String(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '').trim();
const GEMINI_MODEL = String(process.env.EXPO_PUBLIC_GEMINI_MODEL || 'gemini-2.5-flash').trim();

function getGeminiUrl() {
  if (!GEMINI_API_KEY) {
    throw new Error(
      'Falta EXPO_PUBLIC_GEMINI_API_KEY. Agrégala en Frontend/.env o en Vercel → Environment Variables.',
    );
  }
  return `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}

export async function validateCarnetPhoto(file) {
  const base64 = await fileToBase64(file);

  const prompt = `Analiza esta foto para un carnet estudiantil del SENA y responde SOLO con un JSON con esta estructura exacta:
  
{
  "valid": boolean,
  "errors": ["error1", "error2", ...]
}
Criterios que DEBEN cumplirse para que sea valida:
1. Fondo blanco 
`;

  const response = await fetch(getGeminiUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: file.type || 'image/jpeg', data: base64 } },
        ],
      }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 256 },
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(`Gemini error ${response.status}: ${errBody?.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  const clean = text.replace(/```json|```/g, '').trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Respuesta inesperada de Gemini: ${text.slice(0, 200)}`);

  try {
    return JSON.parse(match[0]);
  } catch {
    throw new Error(`JSON invalido en respuesta de Gemini: ${match[0].slice(0, 200)}`);
  }
}
