'use client'

import { useEffect, useState } from 'react'
import { isOnline, setupOnlineListener, syncPendingActions } from '@/lib/sync'

export default function OfflineIndicator() {
  const [online, setOnline] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    setOnline(isOnline())

    const cleanup = setupOnlineListener(async () => {
      setOnline(true)
      setSyncing(true)
      
      try {
        const result = await syncPendingActions()
        console.log('Sync complete:', result)
      } catch (error) {
        console.error('Sync failed:', error)
      } finally {
        setSyncing(false)
      }
    })

    const handleOffline = () => setOnline(false)
    window.addEventListener('offline', handleOffline)

    return () => {
      cleanup()
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (online && !syncing) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {!online && (
        <div className="bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium">
          📡 Offline - Actions will sync when connected
        </div>
      )}
      {syncing && (
        <div className="bg-blue-500 text-white px-4 py-2 text-center text-sm font-medium">
          🔄 Syncing offline actions...
        </div>
      )}
    </div>
  )
}
