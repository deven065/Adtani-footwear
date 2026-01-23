'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface VariantFormProps {
  productId: string
}

const COMMON_SIZES = ['6', '7', '8', '9', '10', '11', '12']
const COMMON_COLORS = ['Black', 'White', 'Brown', 'Blue', 'Red', 'Gray', 'Beige']

export default function VariantForm({ productId }: VariantFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    size: '',
    color: '',
    barcode: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: insertError } = await supabase
      .from('product_variants')
      .insert({
        product_id: productId,
        size: formData.size,
        color: formData.color,
        barcode: formData.barcode || null,
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
    } else {
      router.push(`/products/${productId}`)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
          Size <span className="text-red-600">*</span>
        </label>
        <select
          id="size"
          required
          value={formData.size}
          onChange={(e) => setFormData({ ...formData, size: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-black"
        >
          <option value="" className="text-gray-600">Select Size</option>
          {COMMON_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
          <option value="custom">Custom Size</option>
        </select>
        {formData.size === 'custom' && (
          <input
            type="text"
            placeholder="Enter custom size"
            className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-black placeholder:text-gray-600"
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
          />
        )}
      </div>

      <div>
        <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
          Color <span className="text-red-600">*</span>
        </label>
        <select
          id="color"
          required
          value={formData.color}
          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-black"
        >
          <option value="" className="text-gray-600">Select Color</option>
          {COMMON_COLORS.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
          <option value="custom">Custom Color</option>
        </select>
        {formData.color === 'custom' && (
          <input
            type="text"
            placeholder="Enter custom color"
            className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-black placeholder:text-gray-600"
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          />
        )}
      </div>

      <div>
        <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">
          Barcode
        </label>
        <input
          id="barcode"
          type="text"
          value={formData.barcode}
          onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-black placeholder:text-gray-600"
          placeholder="Optional barcode for variant"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gray-900 text-white py-4 rounded-lg text-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
      >
        {loading ? 'Adding...' : 'Add Variant'}
      </button>
    </form>
  )
}
