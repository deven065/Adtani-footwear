'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AllocateStockPage({ params }: { params: Promise<{ id: string }> }) {
  const [variantId, setVariantId] = useState<string>('')
  const [variant, setVariant] = useState<any>(null)
  const [stores, setStores] = useState<any[]>([])
  const [selectedStore, setSelectedStore] = useState('')
  const [quantity, setQuantity] = useState('')
  const [pricePerUnit, setPricePerUnit] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    params.then(p => {
      setVariantId(p.id)
      loadData(p.id)
    })
  }, [])

  const loadData = async (id: string) => {
    const [variantRes, storesRes] = await Promise.all([
      supabase
        .from('product_variants')
        .select(`
          *,
          products (*),
          inventory (
            store_id,
            quantity,
            stores (name)
          )
        `)
        .eq('id', id)
        .single(),
      supabase
        .from('stores')
        .select('*')
        .eq('is_active', true)
        .order('name')
    ])

    if (variantRes.data) {
      setVariant(variantRes.data)
      setPricePerUnit(variantRes.data.products?.cost_price || '')
    }
    if (storesRes.data) setStores(storesRes.data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStore || !quantity) return

    setSubmitting(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Insert stock movement
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          variant_id: variantId,
          store_id: selectedStore,
          event_type: 'NEW_STOCK',
          quantity_change: parseInt(quantity),
          price_per_unit: pricePerUnit ? parseFloat(pricePerUnit) : null,
          notes,
          created_by: user?.id
        })

      if (movementError) throw movementError

      router.push('/stock')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  }

  if (!variant) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Variant not found</p>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Allocate Stock</h1>
            <p className="text-sm text-gray-600">
              {variant.products?.brand} {variant.products?.model_name}
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 py-4">
        {/* Current Stock */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Current Stock</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Variant:</span>
              <span className="font-medium">Size {variant.size} • {variant.color}</span>
            </div>
            {variant.barcode && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Barcode:</span>
                <span className="font-mono text-xs">{variant.barcode}</span>
              </div>
            )}
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Stock by Store:</p>
            <div className="space-y-1">
              {variant.inventory?.map((inv: any) => (
                <div key={inv.store_id} className="flex justify-between text-sm">
                  <span>{inv.stores?.name}</span>
                  <span className="font-semibold">{inv.quantity} pairs</span>
                </div>
              ))}
              {(!variant.inventory || variant.inventory.length === 0) && (
                <p className="text-sm text-gray-400">No stock allocated yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Allocation Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Store <span className="text-red-600">*</span>
            </label>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-black"
            >
              <option value="">Select store</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name} {store.city && `- ${store.city}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity (pairs) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              min="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-black placeholder:text-gray-600"
              placeholder="Enter quantity"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cost Per Unit (₹)
            </label>
            <input
              type="number"
              step="0.01"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-black placeholder:text-gray-600"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-black placeholder:text-gray-600"
              placeholder="Optional notes..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gray-900 text-white py-4 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
          >
            {submitting ? 'Allocating...' : 'Allocate Stock'}
          </button>
        </form>
      </main>
    </div>
  )
}
