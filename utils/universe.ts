export const openExternalLink = (url: string, event: React.MouseEvent) => {
  event.preventDefault()
  window.parent.postMessage({ type: 'open-external-link', url }, '*')
}

export const sendErrorMessage = (message: string) => {
  window.parent.postMessage({ type: 'ERROR', payload: { message } }, '*')
}

export const getInitConfig = () => {
  window.parent.postMessage({ type: 'GET_INIT_CONFIG' }, '*')
}
