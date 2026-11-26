import { RistrettoPoint } from '@noble/curves/ed25519'

// Mirrors TariAddress::from_base58 in tari base_layer/common_types/src/tari_address (single and dual addresses).
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
// mainnet, stagenet, nextnet, localnet, igor, esmeralda
const NETWORK_BYTES = [0x00, 0x01, 0x02, 0x10, 0x24, 0x26]
const FEATURE_BITS = 0b111
const PAYMENT_ID_FEATURE = 0b100
const SINGLE_SIZE = 35
const DUAL_SIZE = 67
const MAX_PAYMENT_ID_SIZE = 256
// INTERNAL_SINGLE_MIN_BASE58_SIZE and INTERNAL_DUAL_BASE58_MAX_SIZE; also keeps the quadratic decode bounded.
const MIN_BASE58_LENGTH = 45
const MAX_BASE58_LENGTH = 443
// dammsum with coefficients [4, 3, 1]
const DAMMSUM_MASK = 0b11011

function decodeBase58(text: string): number[] | undefined {
  let value = 0n
  for (const char of text) {
    const digit = BASE58_ALPHABET.indexOf(char)
    if (digit < 0) return undefined
    value = value * 58n + BigInt(digit)
  }
  const bytes: number[] = []
  for (; value > 0n; value /= 256n) bytes.unshift(Number(value % 256n))
  const leadingZeros = text.length - text.replace(/^1+/, '').length
  return [...new Array<number>(leadingZeros).fill(0), ...bytes]
}

// Zero when the trailing checksum byte matches.
function dammsum(bytes: number[]): number {
  let result = 0
  for (const byte of bytes) {
    result ^= byte
    const overflow = result & 0x80
    result = (result << 1) & 0xff
    if (overflow) result ^= DAMMSUM_MASK
  }
  return result
}

function isRistrettoPoint(bytes: number[]): boolean {
  try {
    RistrettoPoint.fromHex(Uint8Array.from(bytes))
    return true
  } catch {
    return false
  }
}

// A base58 Tari address (the form Universe's getAccount returns): known network and features, valid
// checksum and public keys, and the payment-id feature only on a dual address that carries a payment id.
export function isTariAddress(address: unknown): boolean {
  if (typeof address !== 'string' || address.length < MIN_BASE58_LENGTH || address.length > MAX_BASE58_LENGTH) {
    return false
  }
  const parts = [address.slice(0, 1), address.slice(1, 2), address.slice(2)].map(decodeBase58)
  if (parts.some((part) => !part)) return false
  const bytes = parts.flatMap((part) => part!)
  const isSingle = bytes.length === SINGLE_SIZE
  if (!isSingle && (bytes.length < DUAL_SIZE || bytes.length > DUAL_SIZE + MAX_PAYMENT_ID_SIZE)) return false
  const [network, features] = bytes
  if (dammsum(bytes) !== 0 || !NETWORK_BYTES.includes(network) || (features & ~FEATURE_BITS) !== 0) return false
  if (isSingle) return !(features & PAYMENT_ID_FEATURE) && isRistrettoPoint(bytes.slice(2, 34))
  if (bytes.length > DUAL_SIZE && !(features & PAYMENT_ID_FEATURE)) return false
  return isRistrettoPoint(bytes.slice(2, 34)) && isRistrettoPoint(bytes.slice(34, 66))
}
