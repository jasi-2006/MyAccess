const CLAUDE_API_KEY = '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';
const CLAUDE_URL = 'https://api.anthropic.com/v1/messages';

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

  const prompt = `Analiza esta foto para un carnet estudiantil del SENA y responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta, sin texto adicional ni markdown:\n\n{\n  "valid": boolean,\n  "errors": ["error1", "error2", ...]\n}\n\nCRITERIOS OBLIGATORIOS (todos deben cumplirse):\n1. Fondo blanco o de color claro uniforme\n2. Rostro visible, centrado y mirando a cámara\n3. Sin gafas oscuras, gorras, pañoletas o accesorios que cubran el rostro\n4. Expresión neutral (boca cerrada, sin sonreír)\n5. Iluminación uniforme (sin sombras fuertes en rostro ni fondo)`;

  const response = await fetch(CLAUDE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image', source: { type: 'base64', media_type: file.type || 'image/jpeg', data: base64 } },
        ],
      }],
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(`Claude error ${response.status}: ${errBody?.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const text = data?.content?.[0]?.text || '';

  const clean = text.replace(/```json|```/g, '').trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Respuesta inesperada de Claude: ${text.slice(0, 200)}`);

  try {
    return JSON.parse(match[0]);
  } catch {
    throw new Error(`JSON invalido en respuesta de Claude: ${match[0].slice(0, 200)}`);
  }
}