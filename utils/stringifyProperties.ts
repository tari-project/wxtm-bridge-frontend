export function stringifyProperties<T extends object>(
  obj: T,
): Record<string, string> {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, String(v)]))
}
