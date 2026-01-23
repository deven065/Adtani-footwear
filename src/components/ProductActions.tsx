'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface ProductActionsProps {
  variantId: string
  storeId: string
  currentQuantity: number
  userId: string
}

export default function ProductActions({
  variantId,
  storeId,
  currentQuantity,
  userId,
}: ProductActionsProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSale = async () => {
    if (currentQuantity <= 0) {
      setError('Out of stock')
      return
    }

    setLoading(true)
    setError(null)

    const { error: saleError } = await supabase
      .from('stock_movements')
      .insert({
        variant_id: variantId,
        store_id: storeId,
        event_type: 'SALE',
        quantity_change: -1,
        created_by: userId,
      })

    if (saleError) {
      setError(saleError.message)
      setLoading(false)
    } else {
      router.refresh()
      setLoading(false)
    }
  }

  const handleReturn = async () => {
    setLoading(true)
    setError(null)

    const { error: returnError } = await supabase
      .from('stock_movements')
      .insert({
        variant_id: variantId,
        store_id: storeId,
        event_type: 'RETURN',
        quantity_change: 1,
        created_by: userId,
      })

    if (returnError) {
      setError(returnError.message)
      setLoading(false)
    } else {
      router.refresh()
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleSale}
        disabled={loading || currentQuantity <= 0}
        className="w-full bg-gray-900 text-white py-4 rounded-lg text-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
      >
        {loading ? 'Processing...' : '✓ Complete Sale (-1)'}
      </button>

      <button
        onClick={handleReturn}
        disabled={loading}
        className="w-full bg-white text-gray-900 border-2 border-gray-900 py-4 rounded-lg text-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
      >
        {loading ? 'Processing...' : '↩ Process Return (+1)'}
      </button>

      <p className="text-xs text-center text-gray-500 mt-4">
        All actions are logged and cannot be undone
      </p>
    </div>
  )
}
