import { State } from 'wagmi'

/* eslint-disable @typescript-eslint/no-explicit-any */
export function parseAndReviveState(parentConfig: string | State): State {
  const parsedState: State =
    typeof parentConfig === 'string' ? JSON.parse(parentConfig) : parentConfig

  if (parsedState.connections && !(parsedState.connections instanceof Map)) {
    parsedState.connections = new Map(parsedState.connections)
  }

  return parsedState
}

export const getCycleSafeReplacer = () => {
  const seen = new WeakSet()

  return (_key: string, value: any) => {
    if (typeof value === 'function' || typeof value === 'symbol') {
      return undefined
    }

    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return undefined // Avoid cyclic reference
      }
      seen.add(value)

      if (value instanceof Map) {
        return {
          __type: 'Map',
          value: Array.from(value.entries()),
        }
      }

      if (value instanceof Set) {
        return {
          __type: 'Set',
          value: Array.from(value),
        }
      }
    }

    return value
  }
}
