const GEMINI_API_KEY = 'AQ.Ab8RN6L-1gHS6Ix7IyR3mnfr9nkHmJabNidug8XnLcC1DQn62Q ';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function removeImageBackground(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const width = canvas.width;
        const height = canvas.height;

        const visited = new Uint8Array(width * height);
        const queue = [];

        const colorDiff = (r1, g1, b1, r2, g2, b2) => {
          return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
        };

        const bgR = data[0];
        const bgG = data[1];
        const bgB = data[2];

        for (let x = 0; x < width; x++) {
          queue.push(x);
          visited[x] = 1;
          const idx = (height - 1) * width + x;
          queue.push(idx);
          visited[idx] = 1;
        }
        for (let y = 0; y < height; y++) {
          const idxL = y * width;
          if (!visited[idxL]) {
            queue.push(idxL);
            visited[idxL] = 1;
          }
          const idxR = y * width + (width - 1);
          if (!visited[idxR]) {
            queue.push(idxR);
            visited[idxR] = 1;
          }
        }

        let head = 0;
        const threshold = 40;

        while (head < queue.length) {
          const curr = queue[head++];
          const cx = curr % width;
          const cy = Math.floor(curr / width);
          const idx = curr * 4;

          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          const matchesBg = colorDiff(r, g, b, bgR, bgG, bgB) < threshold;
          const isLight = r > 200 && g > 200 && b > 200;

          if (matchesBg || isLight) {
            data[idx + 3] = 0;

            const neighbors = [
              { x: cx + 1, y: cy },
              { x: cx - 1, y: cy },
              { x: cx, y: cy + 1 },
              { x: cx, y: cy - 1 }
            ];

            for (const n of neighbors) {
              if (n.x >= 0 && n.x < width && n.y >= 0 && n.y < height) {
                const nIdx = n.y * width + n.x;
                if (!visited[nIdx]) {
                  visited[nIdx] = 1;
                  queue.push(nIdx);
                }
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const processedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + "_no_bg.png", { type: 'image/png' });
            resolve(processedFile);
          } else {
            resolve(file);
          }
        }, 'image/png');
      };
      img.onerror = () => resolve(file);
      img.src = event.target.result;
    };
    reader.onerror = () => resolve(file);
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
    const result = JSON.parse(match[0]);
    if (result.valid) {
      try {
        const processedFile = await removeImageBackground(file);
        result.file = processedFile;
        // Create a temporary preview URL for immediate UI display
        result.previewUrl = URL.createObjectURL(processedFile);
      } catch (e) {
        console.error("Error al remover el fondo: ", e);
      }
    }
    return result;
  } catch {
    throw new Error(`JSON invalido en respuesta de Gemini: ${match[0].slice(0, 200)}`);
  }
}
