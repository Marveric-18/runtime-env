const isAlphaNumeric = (value: unknown): boolean => {
  return typeof value === "string" && /^[a-zA-Z0-9_]+$/.test(value);
};

const isAlphaNumericOrBooleanOrNumber = (value: unknown): boolean => {
  if (typeof value === "boolean" || typeof value === "number") {
    return true;
  }

  if (typeof value === "string" && /^[a-zA-Z0-9]+$/.test(value)) {
    return true;
  }

  return false;
};

const isValidInteger = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;

  if (typeof value === "number") {
    return Number.isInteger(value);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed !== "" && /^\d+$/.test(trimmed);
  }

  return false;
};

export {
  isAlphaNumeric,
  isAlphaNumericOrBooleanOrNumber,
  isValidInteger,
};
