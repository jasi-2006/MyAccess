const GEMINI_API_KEY = 'AIzaSyCCFivF1SKCqV61q_fHysoSHhPZwy-MIVI';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

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
  "valid": true,
  "errors": []
}
Criterios que DEBEN cumplirse para que sea valida:
1. Fondo blanco 
`;

  const response = await fetch(GEMINI_URL, {
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

  // Gemini a veces envuelve el JSON en ```json ... ```
  const clean = text.replace(/```json|```/g, '').trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Respuesta inesperada de Gemini: ${text.slice(0, 200)}`);

  try {
    return JSON.parse(match[0]);
  } catch {
    throw new Error(`JSON invalido en respuesta de Gemini: ${match[0].slice(0, 200)}`);
  }
}