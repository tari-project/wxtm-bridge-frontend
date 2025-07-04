export function stringifyProperties<T extends object>(
  obj: T | null | undefined,
): Record<string, string> {
  if (!obj) {
    return {}
  }
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, String(v)]))
}
