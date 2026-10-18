import { useSyncExternalStore } from 'react'

function subscribe(onChange: () => void) {
  window.addEventListener('online', onChange)
  window.addEventListener('offline', onChange)
  return () => {
    window.removeEventListener('online', onChange)
    window.removeEventListener('offline', onChange)
  }
}

function useOnlineStatus() {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  )
}

export function OfflineBanner() {
  const isOnline = useOnlineStatus()

  // Always rendered so screen readers announce the change when it happens.
  return (
    <output className="block">
      {!isOnline && (
        <span className="block bg-ink px-4 py-2 text-center text-body-sm text-on-dark">
          You're offline. The app keeps working with the data on this device.
        </span>
      )}
    </output>
  )
}
