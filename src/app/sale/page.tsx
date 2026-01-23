'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function QuickSalePage() {
  const [barcode, setBarcode] = useState('')
  const [variant, setVariant] = useState<any>(null)
  const [quantity, setQuantity] = useState('1')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [userStore, setUserStore] = useState<string>('')
  const barcodeInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadUserStore()
    barcodeInputRef.current?.focus()
  }, [])

  const loadUserStore = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('users')
      .select('store_id')
      .eq('id', user.id)
      .single()

    if (profile?.store_id) {
      setUserStore(profile.store_id)
    }
  }

  const searchByBarcode = async () => {
    if (!barcode.trim()) return

    setLoading(true)
    setError(null)
    setVariant(null)

    try {
      const { data, error: searchError } = await supabase
        .from('product_variants')
        .select(`
          *,
          products (*),
          inventory!inner (
            quantity,
            store_id
          )
        `)
        .eq('barcode', barcode.trim())
        .eq('inventory.store_id', userStore)
        .single()

      if (searchError || !data) {
        setError('Product not found or not available in your store')
        setLoading(false)
        return
      }

      setVariant(data)
      setPrice(data.products?.mrp || '')
      setLoading(false)
    } catch (err: any) {
      setError('Error searching product')
      setLoading(false)
    }
  }

  const handleSale = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!variant || !userStore) return

    setSubmitting(true)
    setError(null)

    try {
      const saleQty = parseInt(quantity)
      const availableQty = variant.inventory?.[0]?.quantity || 0

      if (saleQty > availableQty) {
        throw new Error(`Only ${availableQty} pairs available`)
      }

      const { data: { user } } = await supabase.auth.getUser()

      // Record sale
      const { error: saleError } = await supabase
        .from('stock_movements')
        .insert({
          variant_id: variant.id,
          store_id: userStore,
          event_type: 'SALE',
          quantity_change: -saleQty,
          price_per_unit: price ? parseFloat(price) : null,
          created_by: user?.id
        })

      if (saleError) throw saleError

      setSuccess(true)
      setSubmitting(false)
      
      // Reset form
      setTimeout(() => {
        setBarcode('')
        setVariant(null)
        setQuantity('1')
        setPrice('')
        setSuccess(false)
        barcodeInputRef.current?.focus()
      }, 2000)

    } catch (err: any) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
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
            <h1 className="text-lg font-bold text-gray-900">Quick Sale</h1>
            <p className="text-sm text-gray-600">Scan barcode to sell</p>
          </div>
        </div>
      </header>

      <main className="px-4 py-4">
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Sale recorded successfully!</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Barcode Scanner */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Scan or Enter Barcode
          </label>
          <div className="flex gap-2">
            <input
              ref={barcodeInputRef}
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchByBarcode()}
              placeholder="Scan or type barcode..."
              className="flex-1 min-w-0 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent font-mono text-sm placeholder:text-gray-600"
            />
            <button
              onClick={searchByBarcode}
              disabled={loading || !barcode.trim()}
              className="flex-shrink-0 bg-gray-900 text-white px-4 py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Product Details & Sale Form */}
        {variant && (
          <form onSubmit={handleSale} className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Product Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Brand:</span>
                  <span className="font-medium">{variant.products?.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Model:</span>
                  <span className="font-medium">{variant.products?.model_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-medium">{variant.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Color:</span>
                  <span className="font-medium">{variant.color}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-600">Available:</span>
                  <span className="font-bold text-green-600">{variant.inventory?.[0]?.quantity || 0} pairs</span>
                </div>
              </div>
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
                max={variant.inventory?.[0]?.quantity || 0}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-lg font-semibold text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sale Price (₹) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-lg font-semibold text-black"
              />
            </div>

            {price && quantity && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-blue-900 font-medium">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-900">
                    ₹{(parseFloat(price) * parseInt(quantity)).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
            >
              {submitting ? 'Processing...' : '✓ Complete Sale'}
            </button>
          </form>
        )}

        {!variant && !loading && (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <p>Scan or enter barcode to start</p>
          </div>
        )}
      </main>
    </div>
  )
}
