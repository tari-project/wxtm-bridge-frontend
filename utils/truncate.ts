export const truncateAddress = (fullStr: `0x${string}`, strLen: number) => {
  if (fullStr.length <= strLen) return fullStr

  const separator = '...'

  const sepLen = separator.length,
    charsToShow = strLen - sepLen,
    frontChars = Math.ceil(charsToShow / 2),
    backChars = Math.floor(charsToShow / 2)

  return (
    fullStr.substring(0, frontChars) +
    separator +
    fullStr.substring(fullStr.length - backChars)
  )
}
