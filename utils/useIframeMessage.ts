import { useCallback, useEffect } from 'react'
import { setLanguage, setTheme } from '@/store/app'

export enum MessageType {
  SIGNER_CALL = 'signer-call',
  RESIZE = 'resize',
  SET_LANGUAGE = 'SET_LANGUAGE',
  SET_THEME = 'SET_THEME',
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

interface SetThemeMessage {
  type: MessageType.SET_THEME
  payload: {
    theme: string
  }
}

export type IframeMessage = SignerCallMessage | ResizeMessage | SetLanguageMessage | SetThemeMessage

// Hook to listen for messages from the parent window
export function useIframeMessage() {
  const handleMessage = useCallback((event: MessageEvent<IframeMessage>) => {
    switch (event.data.type) {
      case MessageType.SET_THEME:
        const theme = event?.data?.payload?.theme
        setTheme(theme)
        break
      case MessageType.SET_LANGUAGE:
        const language = event?.data?.payload?.language
        void setLanguage(language)
        break
    }
  }, [])

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [handleMessage])
}
