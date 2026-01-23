'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface ProductFormProps {
  userId: string
}

export default function ProductForm({ userId }: ProductFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    brand: '',
    model_name: '',
    category: '',
    description: '',
    sku: '',
    barcode: '',
    mrp: '',
    cost_price: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error: insertError } = await supabase
      .from('products')
      .insert({
        ...formData,
        mrp: formData.mrp ? parseFloat(formData.mrp) : null,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
        created_by: userId,
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
    } else {
      router.push(`/products/${data.id}`)
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
        <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
          Brand <span className="text-red-600">*</span>
        </label>
        <input
          id="brand"
          type="text"
          required
          value={formData.brand}
          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-black placeholder:text-gray-600"
          placeholder="e.g., Nike, Adidas"
        />
      </div>

      <div>
        <label htmlFor="model_name" className="block text-sm font-medium text-gray-700 mb-1">
          Model Name <span className="text-red-600">*</span>
        </label>
        <input
          id="model_name"
          type="text"
          required
          value={formData.model_name}
          onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-black placeholder:text-gray-600"
          placeholder="e.g., Air Max 90"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category <span className="text-red-600">*</span>
        </label>
        <select
          id="category"
          required
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
        >
          <option value="">Select Category</option>
          <option value="Sports">Sports</option>
          <option value="Casual">Casual</option>
          <option value="Formal">Formal</option>
          <option value="Sandals">Sandals</option>
          <option value="Slippers">Slippers</option>
          <option value="Boots">Boots</option>
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-black placeholder:text-gray-600"
          rows={3}
          placeholder="Optional product description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="mrp" className="block text-sm font-medium text-gray-700 mb-1">
            MRP (₹)
          </label>
          <input
            id="mrp"
            type="number"
            step="0.01"
            value={formData.mrp}
            onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-black placeholder:text-gray-600"
            placeholder="0.00"
          />
        </div>

        <div>
          <label htmlFor="cost_price" className="block text-sm font-medium text-gray-700 mb-1">
            Cost Price (₹)
          </label>
          <input
            id="cost_price"
            type="number"
            step="0.01"
            value={formData.cost_price}
            onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-black placeholder:text-gray-600"
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
          SKU
        </label>
        <input
          id="sku"
          type="text"
          value={formData.sku}
          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-black placeholder:text-gray-600"
          placeholder="Optional SKU"
        />
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
          placeholder="Optional barcode"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gray-900 text-white py-4 rounded-lg text-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
      >
        {loading ? 'Creating...' : 'Create Product'}
      </button>
    </form>
  )
}
