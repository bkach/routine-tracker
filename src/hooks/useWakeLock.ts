import { useEffect, useRef } from 'react'

interface WakeLockSentinelLike {
  released: boolean
  release: () => Promise<void>
}

export function useWakeLock(enabled: boolean) {
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null)

  useEffect(() => {
    const navigatorWithWakeLock = navigator as Navigator & {
      wakeLock?: {
        request: (type: 'screen') => Promise<WakeLockSentinelLike>
      }
    }

    if (!enabled || !navigatorWithWakeLock.wakeLock) {
      void sentinelRef.current?.release()
      sentinelRef.current = null
      return
    }

    let isMounted = true

    const requestWakeLock = async () => {
      try {
        sentinelRef.current = await navigatorWithWakeLock.wakeLock?.request('screen') ?? null
      } catch {
        sentinelRef.current = null
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !sentinelRef.current?.released) {
        return
      }

      if (document.visibilityState === 'visible' && isMounted) {
        void requestWakeLock()
      }
    }

    void requestWakeLock()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isMounted = false
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      void sentinelRef.current?.release()
      sentinelRef.current = null
    }
  }, [enabled])
}
