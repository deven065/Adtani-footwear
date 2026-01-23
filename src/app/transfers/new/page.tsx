'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NewTransferPage() {
  const [products, setProducts] = useState<any[]>([])
  const [stores, setStores] = useState<any[]>([])
  const [selectedVariant, setSelectedVariant] = useState('')
  const [fromStore, setFromStore] = useState('')
  const [toStore, setToStore] = useState('')
  const [quantity, setQuantity] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableQty, setAvailableQty] = useState<number>(0)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedVariant && fromStore) {
      checkAvailableQuantity()
    } else {
      setAvailableQty(0)
    }
  }, [selectedVariant, fromStore])

  const loadData = async () => {
    const [productsRes, storesRes] = await Promise.all([
      supabase
        .from('product_variants')
        .select(`
          *,
          products (brand, model_name)
        `)
        .eq('is_active', true)
        .order('products(brand)', { ascending: true }),
      supabase
        .from('stores')
        .select('*')
        .eq('is_active', true)
        .order('name')
    ])

    if (productsRes.data) setProducts(productsRes.data)
    if (storesRes.data) setStores(storesRes.data)
    setLoading(false)
  }

  const checkAvailableQuantity = async () => {
    const { data } = await supabase
      .from('inventory')
      .select('quantity')
      .eq('variant_id', selectedVariant)
      .eq('store_id', fromStore)
      .single()

    setAvailableQty(data?.quantity || 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVariant || !fromStore || !toStore || !quantity) return

    if (fromStore === toStore) {
      setError('Cannot transfer to the same store')
      return
    }

    const transferQty = parseInt(quantity)
    if (transferQty > availableQty) {
      setError(`Only ${availableQty} pairs available in source store`)
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Create transfer request
      const { data: transfer, error: transferError } = await supabase
        .from('stock_transfers')
        .insert({
          variant_id: selectedVariant,
          from_store_id: fromStore,
          to_store_id: toStore,
          quantity: transferQty,
          status: 'pending',
          requested_by: user?.id,
          notes
        })
        .select()
        .single()

      if (transferError) throw transferError

      // Auto-complete transfer for owners (skip approval)
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user?.id)
        .single()

      if (profile?.role === 'owner') {
        // Update transfer status
        await supabase
          .from('stock_transfers')
          .update({
            status: 'completed',
            approved_by: user?.id,
            completed_by: user?.id
          })
          .eq('id', transfer.id)

        // Create stock movements
        await Promise.all([
          // Deduct from source store
          supabase.from('stock_movements').insert({
            variant_id: selectedVariant,
            store_id: fromStore,
            event_type: 'TRANSFER_OUT',
            quantity_change: -transferQty,
            reference_id: transfer.id,
            created_by: user?.id
          }),
          // Add to destination store
          supabase.from('stock_movements').insert({
            variant_id: selectedVariant,
            store_id: toStore,
            event_type: 'TRANSFER_IN',
            quantity_change: transferQty,
            reference_id: transfer.id,
            created_by: user?.id
          })
        ])
      }

      router.push('/transfers')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
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
            <h1 className="text-lg font-bold text-gray-900">New Transfer</h1>
            <p className="text-sm text-gray-600">Move stock between stores</p>
          </div>
        </div>
      </header>

      <main className="px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Variant <span className="text-red-600">*</span>
            </label>
            <select
              value={selectedVariant}
              onChange={(e) => setSelectedVariant(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-black"
            >
              <option value="">Select product</option>
              {products.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.products?.brand} {variant.products?.model_name} - Size {variant.size} • {variant.color}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Store <span className="text-red-600">*</span>
            </label>
            <select
              value={fromStore}
              onChange={(e) => setFromStore(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-black"
            >
              <option value="">Select source store</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name} {store.city && `- ${store.city}`}
                </option>
              ))}
            </select>
            {selectedVariant && fromStore && (
              <p className="text-sm text-gray-600 mt-1">
                Available: <span className="font-semibold">{availableQty} pairs</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Store <span className="text-red-600">*</span>
            </label>
            <select
              value={toStore}
              onChange={(e) => setToStore(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-black"
            >
              <option value="">Select destination store</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id} disabled={store.id === fromStore}>
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
              max={availableQty}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-black placeholder:text-gray-600"
              placeholder="Enter quantity"
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
              placeholder="Optional transfer notes..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !selectedVariant || !fromStore || !toStore || !quantity}
            className="w-full bg-gray-900 text-white py-4 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
          >
            {submitting ? 'Creating Transfer...' : 'Create Transfer'}
          </button>
        </form>
      </main>
    </div>
  )
}
