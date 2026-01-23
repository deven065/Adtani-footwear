import { createClient } from '@/lib/supabase/client'
import { offlineDB, type PendingAction } from './offline-db'

export async function syncPendingActions(): Promise<{ success: number; failed: number }> {
  const supabase = createClient()
  const pendingActions = await offlineDB.getPendingActions()

  let success = 0
  let failed = 0

  for (const action of pendingActions) {
    try {
      const { error } = await supabase.from('stock_movements').insert({
        variant_id: action.variantId,
        store_id: action.storeId,
        event_type: action.type,
        quantity_change: action.type === 'SALE' ? -1 : 1,
        created_by: action.userId,
      })

      if (error) {
        console.error('Failed to sync action:', error)
        failed++
      } else {
        await offlineDB.removePendingAction(action.id)
        success++
      }
    } catch (error) {
      console.error('Failed to sync action:', error)
      failed++
    }
  }

  return { success, failed }
}

export function setupOnlineListener(callback: () => void) {
  window.addEventListener('online', callback)
  return () => window.removeEventListener('online', callback)
}

export function isOnline(): boolean {
  return navigator.onLine
}
