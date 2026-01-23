'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface StoreFormProps {
  store?: {
    id: string
    name: string
    city: string
    phone: string | null
    is_active: boolean
  }
}

export default function StoreForm({ store }: StoreFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: store?.name || '',
    city: store?.city || '',
    phone: store?.phone || '',
    is_active: store?.is_active ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (store) {
      // Update existing store
      const { error: updateError } = await supabase
        .from('stores')
        .update({
          name: formData.name,
          city: formData.city,
          phone: formData.phone || null,
          is_active: formData.is_active,
        })
        .eq('id', store.id)

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
      } else {
        router.push('/stores')
        router.refresh()
      }
    } else {
      // Create new store
      const { error: insertError } = await supabase
        .from('stores')
        .insert({
          name: formData.name,
          city: formData.city,
          phone: formData.phone || null,
          is_active: formData.is_active,
        })

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
      } else {
        router.push('/stores')
        router.refresh()
      }
    }
  }

  const handleDelete = async () => {
    if (!store) return
    
    if (!confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    setError(null)

    const { error: deleteError } = await supabase
      .from('stores')
      .delete()
      .eq('id', store.id)

    if (deleteError) {
      setError(deleteError.message)
      setLoading(false)
    } else {
      router.push('/stores')
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
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Store Name <span className="text-red-600">*</span>
        </label>
        <input
          id="name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-black placeholder:text-gray-600"
          placeholder="e.g., Main Store, Branch 1"
        />
      </div>

      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
          City <span className="text-red-600">*</span>
        </label>
        <input
          id="city"
          type="text"
          required
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-black placeholder:text-gray-600"
          placeholder="e.g., Mumbai, Delhi"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-black placeholder:text-gray-600"
          placeholder="+91-0000000000"
        />
      </div>

      <div className="flex items-center">
        <input
          id="is_active"
          type="checkbox"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          className="h-5 w-5 text-gray-900 focus:ring-gray-800 border-gray-300 rounded"
        />
        <label htmlFor="is_active" className="ml-3 text-sm font-medium text-gray-700">
          Store is Active
        </label>
      </div>

      <div className="space-y-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white py-4 rounded-lg text-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
        >
          {loading ? 'Saving...' : store ? 'Update Store' : 'Create Store'}
        </button>

        {store && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="w-full bg-red-600 text-white py-4 rounded-lg text-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
          >
            {loading ? 'Deleting...' : 'Delete Store'}
          </button>
        )}
      </div>
    </form>
  )
}
