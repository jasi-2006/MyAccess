const GEMINI_API_KEY = 'AQ.Ab8RN6LF64kr4xRR27iUBuK_UhtVQ0IqS61zpNqJqJHdILfsGA';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options, retries = 3, backoff = 1000) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(url, options);
    if (response.ok) return response;
    if (response.status === 429 && attempt < retries) {
      const wait = backoff * Math.pow(2, attempt);
      await sleep(wait);
      continue;
    }
    const errBody = await response.json().catch(() => ({}));
    throw new Error(`Gemini error ${response.status}: ${errBody?.error?.message || response.statusText}`);
  }
}

/**
 * Removes background from an image using a flood‑fill algorithm.
 * Returns a new File (PNG) with the background removed, or the original file on failure.
 */
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

        const colorDiff = (r1, g1, b1, r2, g2, b2) =>
          Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);

        const bgR = data[0];
        const bgG = data[1];
        const bgB = data[2];

        // Seed the queue with the border pixels
        for (let x = 0; x < width; x++) {
          queue.push(x);
          visited[x] = 1;
          const idxBottom = (height - 1) * width + x;
          queue.push(idxBottom);
          visited[idxBottom] = 1;
        }
        for (let y = 0; y < height; y++) {
          const idxLeft = y * width;
          if (!visited[idxLeft]) {
            queue.push(idxLeft);
            visited[idxLeft] = 1;
          }
          const idxRight = y * width + (width - 1);
          if (!visited[idxRight]) {
            queue.push(idxRight);
            visited[idxRight] = 1;
          }
        }

        const threshold = 40;
        let head = 0;
        while (head < queue.length) {
          const curr = queue[head++];
          const cx = curr % width;
          const cy = Math.floor(curr / width);
          const i = curr * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const matchesBg = colorDiff(r, g, b, bgR, bgG, bgB) < threshold;
          const isLight = r > 200 && g > 200 && b > 200;
          if (matchesBg || isLight) {
            data[i + 3] = 0; // make pixel transparent
            const neighbors = [
              { x: cx + 1, y: cy },
              { x: cx - 1, y: cy },
              { x: cx, y: cy + 1 },
              { x: cx, y: cy - 1 },
            ];
            for (const n of neighbors) {
              if (
                n.x >= 0 && n.x < width &&
                n.y >= 0 && n.y < height
              ) {
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
            const processedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '') + '_no_bg.png', { type: 'image/png' });
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

/**
 * Simple validation that only sends the image to Gemini.
 * Returns the raw Gemini response JSON.
 */
export async function validatePhoto(file) {
  const base64 = await fileToBase64(file);
  const response = await fetchWithRetry(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        role: 'user',
        parts: [{ inlineData: { mimeType: file.type || 'image/jpeg', data: base64 } }],
      }],
    }),
  });
  if (!response.ok) {
    throw new Error('Gemini API error: ' + response.statusText);
  }
  return response.json();
}

/**
 * Validates a carnet photo against specific criteria.
 * Returns an object `{ valid, errors, file?, previewUrl? }`.
 * If the photo is valid, the background is removed and a preview URL is added.
 */
export async function validateCarnetPhoto(file) {
  const base64 = await fileToBase64(file);
  const prompt = `Analiza esta foto para un carnet estudiantil del SENA y responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta, sin texto adicional ni markdown:\n\n{\n  "valid": boolean,\n  "errors": ["error1", "error2", ...]\n}\n\nCRITERIOS OBLIGATORIOS (todos deben cumplirse):\n1. Fondo blanco o de color claro uniforme\n2. Rostro visible, centrado y mirando a cámara\n3. Sin gafas oscuras, gorras, pañoletas o accesorios que cubran el rostro\n4. Expresión neutral (boca cerrada, sin sonreír)\n5. Iluminación uniforme (sin sombras fuertes en rostro ni fondo)`;

  const response = await fetchWithRetry(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          { inlineData: { mimeType: file.type || 'image/jpeg', data: base64 } },
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
  if (!match) {
    throw new Error(`Respuesta inesperada de Gemini: ${text.slice(0, 200)}`);
  }

  const result = JSON.parse(match[0]);
  if (result.valid) {
    try {
      const processedFile = await removeImageBackground(file);
      result.file = processedFile;
      result.previewUrl = URL.createObjectURL(processedFile);
    } catch (e) {
      console.error('Error al remover el fondo:', e);
    }
  }
  return result;
}
