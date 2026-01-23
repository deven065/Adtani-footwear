import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import VariantList from '@/components/VariantList'
import StockAllocation from '@/components/StockAllocation'

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

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || !['owner', 'manager'].includes(profile.role)) {
    redirect('/dashboard')
  }

  // Fetch product with variants
  const { data: product } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .eq('id', id)
    .single()

  if (!product) {
    notFound()
  }

  // Fetch stores for stock allocation
  const { data: stores } = await supabase
    .from('stores')
    .select('*')
    .eq('is_active', true)
    .order('name')

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <a href="/products" className="text-blue-600 text-sm">← Back</a>
          <h1 className="text-xl font-bold text-gray-900 mt-2">{product.brand}</h1>
          <p className="text-gray-600">{product.model_name}</p>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Product Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Product Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <span className="font-medium">{product.category}</span>
            </div>
            {product.sku && (
              <div className="flex justify-between">
                <span className="text-gray-600">SKU:</span>
                <span className="font-mono text-sm">{product.sku}</span>
              </div>
            )}
            {product.mrp && (
              <div className="flex justify-between">
                <span className="text-gray-600">MRP:</span>
                <span className="font-medium">₹{product.mrp}</span>
              </div>
            )}
            {product.description && (
              <div>
                <p className="text-gray-600 mb-1">Description:</p>
                <p className="text-gray-900">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-gray-900">Variants</h2>
            <Link
              href={`/products/${id}/variants/new`}
              className="text-sm text-blue-600 font-medium"
            >
              + Add Variant
            </Link>
          </div>
          <VariantList variants={product.product_variants || []} />
        </div>

        {/* Stock Allocation (Owner only) */}
        {profile.role === 'owner' && stores && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Allocate Stock</h2>
            <StockAllocation
              productId={product.id}
              variants={product.product_variants || []}
              stores={stores}
              userId={user.id}
            />
          </div>
        )}
      </main>
    </div>
  )
}
