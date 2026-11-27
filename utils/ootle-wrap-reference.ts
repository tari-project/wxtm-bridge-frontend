import { utils } from 'ethers'

// The backend's display reference for a transaction, which every public listing returns instead of the paymentId.
export function ootleWrapReference(paymentId: string): string {
  return utils.sha256(utils.toUtf8Bytes(`ootle-wrap-reference:${paymentId}`)).slice(2, 18)
}

// Whether a listing row is the transaction known locally by id, which is a paymentId (a wrap this
// tapplet created) or, for rows taken from the listing, already a reference.
export function isSameTransaction(
  row: { type: 'wrap' | 'unwrap'; paymentId: string; ootleChainId?: number },
  id: string | undefined,
): boolean {
  if (row.paymentId === id) return true
  if (!id || row.type !== 'wrap') return false
  return row.paymentId === ootleWrapReference(id)
}

// A listing row keyed by its reference, the only id the public listings carry.
export function keyedByReference<T extends { reference: string }>({
  reference,
  ...tx
}: T): Omit<T, 'reference'> & {
  paymentId: string
} {
  return { ...tx, paymentId: reference }
}
