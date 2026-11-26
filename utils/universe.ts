import { config } from '@/config'

// Universe's origin, taken from its first authenticated message.
let universeOrigin: string | undefined

// Only Universe (the parent window, on an allowed origin) may talk to the tapplet. Another frame that can
// reach this window, such as Universe's Swap iframe, fails the source or the origin check.
export function isFromUniverse(event: MessageEvent, types: string[]): boolean {
  const data: unknown = event.data
  if (event.source !== window.parent || !config.UNIVERSE_ORIGINS.includes(event.origin)) return false
  if (typeof data !== 'object' || data === null || !types.includes((data as { type?: unknown }).type as string)) {
    return false
  }
  universeOrigin = event.origin
  return true
}

// Never '*'. Until Universe's origin is known, posts once per allowed origin; the browser delivers only
// to the one that matches the parent.
export function postToUniverse(message: unknown) {
  const ancestor = window.location.ancestorOrigins?.[0]
  const known = universeOrigin ?? (ancestor && config.UNIVERSE_ORIGINS.includes(ancestor) ? ancestor : undefined)
  for (const origin of known ? [known] : config.UNIVERSE_ORIGINS) window.parent.postMessage(message, origin)
}

// 'trusted': framed by Universe. 'unverified': framed, but the browser doesn't expose ancestorOrigins.
// 'untrusted': not framed, or framed by another origin.
export function checkTappletHost(
  isFramed: boolean,
  ancestorOrigins: ArrayLike<string> | undefined,
  allowedOrigins: string[],
): 'trusted' | 'unverified' | 'untrusted' {
  if (!isFramed) return 'untrusted'
  if (!ancestorOrigins) return 'unverified'
  return ancestorOrigins.length > 0 && allowedOrigins.includes(ancestorOrigins[0]) ? 'trusted' : 'untrusted'
}

export const openExternalLink = (url: string, event: React.MouseEvent) => {
  event.preventDefault()
  postToUniverse({ type: 'open-external-link', url })
}

export const sendErrorMessage = (message: string) => {
  postToUniverse({ type: 'ERROR', payload: { message } })
}

export const getInitConfig = () => {
  postToUniverse({ type: 'GET_INIT_CONFIG' })
}
