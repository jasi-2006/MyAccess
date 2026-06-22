const REMOVE_BG_API_KEY = process.env.EXPO_PUBLIC_REMOVE_BG_API_KEY;
const REMOVE_BG_ENDPOINT = 'https://api.remove.bg/v1.0/removebg';

function getSourceName(photo) {
  return photo?.file?.name || photo?.fileName || 'profile.jpg';
}

function getBaseName(fileName) {
  const cleanName = String(fileName || 'profile.jpg');
  const dotIndex = cleanName.lastIndexOf('.');
  return dotIndex > 0 ? cleanName.slice(0, dotIndex) : cleanName;
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function toBlob(photo) {
  if (photo?.file && typeof photo.file === 'object') {
    return photo.file;
  }

  if (!photo?.uri) {
    throw new Error('La foto no tiene una URI valida.');
  }

  const response = await fetch(photo.uri);
  if (!response.ok) {
    throw new Error('No fue posible leer la foto seleccionada.');
  }

  return response.blob();
}

export async function removePhotoBackground(photo) {
  if (!photo?.uri) return photo;
  if (!REMOVE_BG_API_KEY) return photo;

  try {
    const inputBlob = await toBlob(photo);
    const formData = new FormData();
    formData.append('size', 'auto');
    formData.append('image_file', inputBlob, getSourceName(photo));

    const response = await fetch(REMOVE_BG_ENDPOINT, {
      method: 'POST',
      headers: {
        'X-Api-Key': REMOVE_BG_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const rawError = await response.text();
      throw new Error(`remove.bg responded ${response.status}: ${rawError.slice(0, 180)}`);
    }

    const outputBlob = await response.blob();
    const dataUrl = await blobToDataUrl(outputBlob);
    const fileName = `${getBaseName(getSourceName(photo))}-no-bg.png`;
    const processedFile = typeof File !== 'undefined'
      ? new File([outputBlob], fileName, { type: 'image/png' })
      : outputBlob;

    return {
      ...photo,
      uri: dataUrl,
      file: processedFile,
      fileName,
      name: fileName,
      type: 'image/png',
    };
  } catch (error) {
    console.warn('No se pudo quitar el fondo de la foto:', error?.message || error);
    return photo;
  }
}
