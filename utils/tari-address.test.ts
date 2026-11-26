import { describe, expect, it } from 'vitest'
import { isTariAddress } from './tari-address'

// Mainnet dual address from tari's TariAddress serde test (base_layer/common_types/src/tari_address/mod.rs).
const MAINNET_DUAL = '126J92Yow5y9UoRFd1DNujPmVFq9C1ZeiYWT95UKxz5Y1rzbfjtHg4SCZS1dk83ivzt3m2XRQHTaYUk9SwmyeCvy5BJ'

describe('isTariAddress', () => {
  it('accepts a base58 Tari address', () => {
    expect(isTariAddress(MAINNET_DUAL)).toBe(true)
  })

  it('rejects a changed character, a truncated address and non-strings', () => {
    expect(isTariAddress(MAINNET_DUAL.slice(0, -1) + (MAINNET_DUAL.endsWith('J') ? 'K' : 'J'))).toBe(false)
    expect(isTariAddress(MAINNET_DUAL.slice(0, -2))).toBe(false)
    expect(isTariAddress(MAINNET_DUAL.replace('Y', '0'))).toBe(false)
    expect(isTariAddress('')).toBe(false)
    expect(isTariAddress(undefined)).toBe(false)
    expect(isTariAddress({})).toBe(false)
  })
})
