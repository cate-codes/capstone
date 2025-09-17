export function assertPositiveInt(value, fieldName = "id") {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    const err = new Error(`${fieldName} must be a positive integer.`);
    err.status = 400;
    throw err;
  }
  return n;
}

export function assertOptionalStringMax(value, fieldName, max = 2000) {
  if (value == null) return null;
  if (typeof value !== "string") {
    const err = new Error(`${fieldName} must be a string.`);
    err.status = 400;
    throw err;
  }
  if (value.length > max) {
    const err = new Error(`${fieldName} must be <= ${max} characters.`);
    err.status = 400;
    throw err;
  }
  return value;
}
