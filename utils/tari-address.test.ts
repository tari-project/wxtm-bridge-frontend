import { describe, expect, it } from 'vitest'
import { isTariAddress } from './tari-address'

// Mainnet dual address from tari's TariAddress serde test (base_layer/common_types/src/tari_address/mod.rs).
const BASEPOINT = 'e2f2ae0a6abc4e71a884a961c500515f58e30b6aa582dd8db6a65945e08d2d76'
const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

function encodeBase58(bytes: number[]): string {
  let value = bytes.reduce((acc, byte) => acc * 256n + BigInt(byte), 0n)
  let text = ''
  for (; value > 0n; value /= 58n) text = ALPHABET[Number(value % 58n)] + text
  let zeros = 0
  while (bytes[zeros] === 0) zeros++
  return '1'.repeat(zeros) + text
}

// A mainnet single address over the Ristretto base point, built like TariAddress::to_base58.
function singleAddress(features: number): string {
  const body = [0x00, features, ...Buffer.from(BASEPOINT, 'hex')]
  let checksum = 0
  for (const byte of body) {
    checksum ^= byte
    const overflow = checksum & 0x80
    checksum = (checksum << 1) & 0xff
    if (overflow) checksum ^= 0b11011
  }
  const bytes = [...body, checksum]
  return encodeBase58(bytes.slice(0, 1)) + encodeBase58(bytes.slice(1, 2)) + encodeBase58(bytes.slice(2))
}

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

  it('rejects a single address with the payment-id feature', () => {
    expect(isTariAddress(singleAddress(0b001))).toBe(true)
    expect(isTariAddress(singleAddress(0b101))).toBe(false)
  })

  it('rejects an over-long string without decoding it', () => {
    const start = performance.now()
    expect(isTariAddress('2'.repeat(200_000))).toBe(false)
    expect(performance.now() - start).toBeLessThan(100)
  })
})
