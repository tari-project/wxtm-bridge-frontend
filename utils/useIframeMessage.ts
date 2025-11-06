import { useEffect } from 'react'

export enum MessageType {
  SIGNER_CALL = 'signer-call',
  RESIZE = 'resize',
  SET_LANGUAGE = 'SET_LANGUAGE',
  SET_THEME = 'SET_THEME',
  SET_FEATURES = 'SET_FEATURES',
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

interface SetLanguageMessage {
  type: MessageType.SET_LANGUAGE
  payload: {
    language: string
  }
}

interface SetFeaturesMessage {
  type: MessageType.SET_FEATURES
  payload: {
    unwrapEnabled: boolean
  }
}

interface SetThemeMessage {
  type: MessageType.SET_THEME
  payload: {
    theme: string
  }
}

export type IframeMessage =
  | SignerCallMessage
  | ResizeMessage
  | SetLanguageMessage
  | SetThemeMessage
  | SetFeaturesMessage

// Hook to listen for messages from the parent window
export function useIframeMessage(onMessage: (event: MessageEvent<IframeMessage>) => void) {
  useEffect(() => {
    const handleMessage = (event: MessageEvent<IframeMessage>) => {
      // Optionally, add origin checks here for security
      onMessage?.(event)
    }
    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [onMessage])
}
