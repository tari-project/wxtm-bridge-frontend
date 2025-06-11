/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Parses a JSON string and recursively revives all serialized Maps.
 * @param jsonString - The JSON string representing the serialized state.
 * @returns The parsed and revived state object with Maps restored.
 */
export function parseAndReviveMaps(jsonString: string): any {
  function reviveMaps(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj
    }

    if (Array.isArray(obj)) {
      // Detect if array is serialized Map: all elements are [key, value] pairs
      if (obj.every((item) => Array.isArray(item) && item.length === 2)) {
        return new Map(obj.map(([k, v]) => [k, reviveMaps(v)]))
      } else {
        return obj.map(reviveMaps)
      }
    }

    if (typeof obj === 'object') {
      const revivedObj: { [key: string]: any } = {}
      for (const key in obj) {
        if (Object.hasOwn(obj, key)) {
          revivedObj[key] = reviveMaps(obj[key])
        }
      }
      return revivedObj
    }

    return obj
  }

  const parsed = JSON.parse(jsonString)
  return reviveMaps(parsed)
}
