export function formatCarnetNameLines(fullName, nombres, apellidos) {
  const cleanNombres = String(nombres || '').trim();
  const cleanApellidos = String(apellidos || '').trim();

  if (cleanNombres || cleanApellidos) {
    return {
      firstLine: cleanNombres || 'Sin nombre',
      secondLine: cleanApellidos,
    };
  }

  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { firstLine: parts[0] || 'Sin nombre', secondLine: '' };
  }
  if (parts.length === 2) {
    return { firstLine: parts[0], secondLine: parts[1] };
  }
  if (parts.length === 3) {
    return { firstLine: parts[0], secondLine: parts.slice(1).join(' ') };
  }
  // For 4 or more words, put the first two words (nombres) on the first line
  // and the remaining words (apellidos) on the second line.
  return {
    firstLine: parts.slice(0, 2).join(' '),
    secondLine: parts.slice(2).join(' '),
  };
}

export function formatCarnetNameHtml(fullName, nombres, apellidos) {
  const { firstLine, secondLine } = formatCarnetNameLines(fullName, nombres, apellidos);
  return secondLine ? `${firstLine}<br/>${secondLine}` : firstLine;
}

export function formatDocTypeForCarnet(type) {
  return String(type || 'C.C').replace(/\./g, ',');
}

export function formatDocNumberForCarnet(document) {
  const raw = String(document || '').trim();
  if (!raw) return '0.000.000.000';
  if (raw.includes('.')) return raw;
  const digits = raw.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatBloodForCarnet(bloodType) {
  const blood = String(bloodType || 'O+').trim();
  return /^rh\b/i.test(blood) ? blood : `RH ${blood}`;
}

export function formatRegionalForCarnet(regional) {
  const value = String(regional || 'Quindio').trim();
  return /^regional\b/i.test(value) ? value : `Regional ${value}`;
}

export function formatCarnetIdentityLine(learner) {
  const docType = formatDocTypeForCarnet(learner?.typeDocument);
  const docNum = formatDocNumberForCarnet(learner?.document);
  const blood = formatBloodForCarnet(learner?.bloodType);
  return `${docType} ${docNum} ${blood}`;
}
