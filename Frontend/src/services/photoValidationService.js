const GEMINI_API_KEY = 'AQ.Ab8RN6LF64kr4xRR27iUBuK_UhtVQ0IqS61zpNqJqJHdILfsGA';
const DEFAULT_MODEL = 'gemini-1.5-flash'; // Change to 'gemini-1.5-flash' if 2.5 not available
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${GEMINI_API_KEY}`; // v1beta endpoint (required for gemini-1.5-flash)

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

  const prompt = `Analiza esta foto para un carnet estudiantil del SENA y responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta, sin texto adicional ni markdown:

{
  "valid": boolean,
  "errors": ["error1", "error2", ...]
}

CRITERIOS OBLIGATORIOS (todos deben cumplirse):
1. Fondo blanco o de color claro uniforme
2. Rostro visible, centrado y mirando a cámara
3. Sin gafas oscuras, gorras, pañoletas o accesorios que cubran el rostro
4. Expresión neutral (boca cerrada, sin sonreír)
5. Iluminación uniforme (sin sombras fuertes en rostro ni fondo)
6. Imagen nítida, sin desenfoque ni ruido excesivo
7. Solo una persona visible en la foto

REGLAS:
- Si TODOS los criterios se cumplen: "valid": true, "errors": []
- Si ALGÚN criterio NO se cumple: "valid": false, lista los errores específicos encontrados
- No incluyas explicaciones, solo el JSON`;

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

  const clean = text.replace(/```json|```/g, '').trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Respuesta inesperada de Gemini: ${text.slice(0, 200)}`);

  try {
    return JSON.parse(match[0]);
  } catch {
    throw new Error(`JSON invalido en respuesta de Gemini: ${match[0].slice(0, 200)}`);
  }
}