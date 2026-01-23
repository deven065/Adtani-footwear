import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import ProductActions from '@/components/ProductActions'

interface ProductDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { id } = await params

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  // Get inventory item details
  const { data: item, error } = await supabase
    .from('inventory_with_details')
    .select('*')
    .eq('variant_id', id)
    .eq('store_id', profile.store_id || '')
    .single()

  if (error || !item) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <a href="/inventory" className="text-blue-600 text-sm">← Back</a>
          <h1 className="text-xl font-bold text-gray-900 mt-2">Product Details</h1>
        </div>
      </header>

      <main className="px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{item.brand}</h2>
              <p className="text-lg text-gray-600">{item.model_name}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              item.quantity > 10
                ? 'bg-green-100 text-green-800'
                : item.quantity > 5
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {item.quantity} in stock
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <span className="font-medium text-black">{item.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Size:</span>
              <span className="font-medium text-black">{item.size}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Color:</span>
              <span className="font-medium text-black">{item.color}</span>
            </div>
            {item.mrp && (
              <div className="flex justify-between">
                <span className="text-gray-600">MRP:</span>
                <span className="font-medium text-black">₹{item.mrp}</span>
              </div>
            )}
            {item.barcode && (
              <div className="flex justify-between">
                <span className="text-gray-600">Barcode:</span>
                <span className="font-mono text-sm text-black">{item.barcode}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Store:</span>
              <span className="font-medium text-black">{item.store_name}</span>
            </div>
          </div>
        </div>

        {profile.role === 'staff' && (
          <ProductActions
            variantId={item.variant_id}
            storeId={item.store_id}
            currentQuantity={item.quantity}
            userId={user.id}
          />
        )}
      </main>
    </div>
  )
}
