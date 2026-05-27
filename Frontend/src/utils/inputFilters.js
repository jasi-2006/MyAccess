/** Deja solo caracteres numéricos (0-9). */
export function digitsOnly(value) {
  return String(value ?? '').replace(/\D/g, '');
}

export function isDigitsOnly(value) {
  return /^\d+$/.test(String(value ?? ''));
}
