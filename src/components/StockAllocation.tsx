'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ProductVariant, Store } from '@/lib/types/database'

interface StockAllocationProps {
  productId: string
  variants: ProductVariant[]
  stores: Store[]
  userId: string
}

export default function StockAllocation({
  productId,
  variants,
  stores,
  userId,
}: StockAllocationProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedVariant, setSelectedVariant] = useState('')
  const [selectedStore, setSelectedStore] = useState('')
  const [quantity, setQuantity] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!selectedVariant || !selectedStore || !quantity) {
      setError('Please fill all fields')
      setLoading(false)
      return
    }

    const qty = parseInt(quantity)
    if (qty <= 0) {
      setError('Quantity must be positive')
      setLoading(false)
      return
    }

    // Insert stock movement
    const { error: movementError } = await supabase
      .from('stock_movements')
      .insert({
        variant_id: selectedVariant,
        store_id: selectedStore,
        event_type: 'NEW_STOCK',
        quantity_change: qty,
        created_by: userId,
      })

    if (movementError) {
      setError(movementError.message)
      setLoading(false)
    } else {
      setSelectedVariant('')
      setSelectedStore('')
      setQuantity('')
      setLoading(false)
      router.refresh()
    }
  }

  if (variants.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        Add variants first before allocating stock
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Variant *
        </label>
        <select
          required
          value={selectedVariant}
          onChange={(e) => setSelectedVariant(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-sm"
        >
          <option value="">Select Variant</option>
          {variants.map((variant) => (
            <option key={variant.id} value={variant.id}>
              Size {variant.size} • {variant.color}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Store *
        </label>
        <select
          required
          value={selectedStore}
          onChange={(e) => setSelectedStore(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-sm"
        >
          <option value="">Select Store</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quantity *
        </label>
        <input
          type="number"
          required
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-sm text-black placeholder:text-gray-600"
          placeholder="Enter quantity"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
      >
        {loading ? 'Adding...' : 'Add Stock'}
      </button>
    </form>
  )
}
