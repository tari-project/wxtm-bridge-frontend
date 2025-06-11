import { Theme } from '@/types/app'
import { useEffect } from 'react'

export enum MessageType {
  SIGNER_CALL = 'signer-call',
  RESIZE = 'resize',
  SET_THEME = 'SET_THEME',
  WALLETCONNECT_CONFIG_DATA = 'WALLETCONNECT_CONFIG_DATA',
}

interface SignerCallMessage {
  type: MessageType.SIGNER_CALL
  payload: {
    methodName: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args: any[]
  }
}

interface ResizeMessage {
  type: MessageType.RESIZE
  width: number
  height: number
}

interface SetThemeMEssage {
  type: MessageType.SET_THEME
  payload: Theme
}

interface SetWalletConnectConfigData {
  type: MessageType.WALLETCONNECT_CONFIG_DATA
  payload: {
    config: string
  }
}

export type IframeMessage =
  | SignerCallMessage
  | ResizeMessage
  | SetThemeMEssage
  | SetWalletConnectConfigData

// Hook to listen for messages from the parent window
export function useIframeMessage(
  onMessage: (event: MessageEvent<IframeMessage>) => void,
) {
  useEffect(() => {
    function handleMessage(event: MessageEvent<IframeMessage>) {
      // Optionally, add origin checks here for security
      onMessage(event)
    }
    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [onMessage])
}
