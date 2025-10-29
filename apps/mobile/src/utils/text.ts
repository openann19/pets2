export const toText = (value: unknown): string => {
  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (typeof value === 'string') {
    return value;
  }

  if (value === undefined || value === null) {
    return '';
  }

  return String(value);
};
