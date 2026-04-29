
import { useEffect, useRef, useCallback } from 'react';
import { useDisconnect } from 'wagmi';

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

export function useIdleTimeout() {
  const { disconnect } = useDisconnect();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      console.log('User idle for too long, disconnecting wallet.');
      disconnect();
    }, IDLE_TIMEOUT);
  }, [disconnect]);

  useEffect(() => {
    // Set up initial timer
    resetTimer();

    const events = ['mousemove', 'keydown', 'scroll', 'click'];

    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [resetTimer]);
}
