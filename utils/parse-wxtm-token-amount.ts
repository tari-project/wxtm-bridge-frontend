export function parseWxtmTokenAmount(amount: string): string {
  if (amount.split('.')[1] && amount.split('.')[1][0].length > 6) {
    throw new Error('Invalid amount: more than 6 decimal places')
  }

  const sanitizedAmount = amount.replace(/,/g, '')

  // commented out because the amount is parsed when sending transactions from the TU
  // const parsed = parseUnits(sanitizedAmount, 6)
  return sanitizedAmount
}
