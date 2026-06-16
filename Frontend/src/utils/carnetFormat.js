export function formatCarnetNameLines(fullName) {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { firstLine: parts[0] || 'Sin nombre', secondLine: '' };
  }
  return { firstLine: parts[0], secondLine: parts.slice(1).join(' ') };
}

export function formatCarnetNameHtml(fullName) {
  const { firstLine, secondLine } = formatCarnetNameLines(fullName);
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
