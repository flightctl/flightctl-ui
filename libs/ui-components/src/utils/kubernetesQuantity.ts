// Validation aligned with k8s.io/apimachinery/pkg/api/resource quantity parsing.

const DECIMAL_SI_SUFFIXES = new Set(['', 'n', 'u', 'm', 'k', 'M', 'G', 'T', 'P', 'E']);
const BINARY_SI_SUFFIXES = new Set(['Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei']);
const SUFFIX_LETTER_CHARS = 'eEinumkKMGTP';

const isDigit = (char: string): boolean => char >= '0' && char <= '9';

const isValidQuantitySuffix = (suffix: string): boolean => {
  if (BINARY_SI_SUFFIXES.has(suffix) || DECIMAL_SI_SUFFIXES.has(suffix)) {
    return true;
  }

  if (suffix.length > 1 && (suffix[0] === 'e' || suffix[0] === 'E')) {
    return /^[+-]?\d+$/.test(suffix.slice(1));
  }

  return false;
};

const parseQuantityString = (str: string): { positive: boolean; suffix: string } | null => {
  let positive = true;
  let pos = 0;
  const end = str.length;

  if (pos < end) {
    if (str[pos] === '-') {
      positive = false;
      pos++;
    } else if (str[pos] === '+') {
      pos++;
    }
  }

  while (pos < end && str[pos] === '0') {
    pos++;
  }

  if (pos >= end) {
    return { positive, suffix: '' };
  }

  const numStart = pos;
  while (pos < end && isDigit(str[pos])) {
    pos++;
  }

  if (pos < end && str[pos] === '.') {
    pos++;
    while (pos < end && isDigit(str[pos])) {
      pos++;
    }
  } else if (pos === numStart) {
    return null;
  }

  const suffixStart = pos;
  while (pos < end && SUFFIX_LETTER_CHARS.includes(str[pos])) {
    pos++;
  }

  if (pos < end && (str[pos] === '-' || str[pos] === '+')) {
    pos++;
  }

  while (pos < end && isDigit(str[pos])) {
    pos++;
  }

  if (pos < end) {
    return null;
  }

  return { positive, suffix: str.slice(suffixStart) };
};

export const isValidKubernetesQuantity = (value: string): boolean => {
  if (!value) {
    return false;
  }

  if (value === '0') {
    return true;
  }

  const parsed = parseQuantityString(value);
  if (!parsed) {
    return false;
  }

  return parsed && isValidQuantitySuffix(parsed.suffix);
};
