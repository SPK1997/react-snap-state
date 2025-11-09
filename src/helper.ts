export function isObjectLiteral(value: any) {
  if (
    typeof value !== "object" ||
    Array.isArray(value) ||
    value === null ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    return false;
  }

  return true;
}
