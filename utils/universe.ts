export const openExternalLink = (url: string, event: React.MouseEvent) => {
  console.info('[ TAPPLET-BRIDGE ] open link url: ', url)
  console.info('[ TAPPLET-BRIDGE ] open link event: ', { event })

  event.preventDefault()
  window.parent.postMessage({ type: 'open-external-link', url }, '*')
}
