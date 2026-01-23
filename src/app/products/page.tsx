import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || !['owner', 'manager'].includes(profile.role)) {
    redirect('/dashboard')
  }

  // Fetch products
  const { data: products } = await supabase
    .from('products')
    .select('*, product_variants(count)')
    .eq('is_active', true)
    .order('brand', { ascending: true })
    .order('model_name', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 flex-1">Products</h1>
          <Link
            href="/products/new"
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 active:scale-95 transition-transform"
          >
            + Add Product
          </Link>
        </div>
      </header>

      <main className="px-4 py-4">
        {products && products.length > 0 ? (
          <div className="space-y-3">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{product.brand}</h3>
                    <p className="text-sm text-gray-600">{product.model_name}</p>
                    <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {product.product_variants?.[0]?.count || 0} variants
                    </p>
                    {product.mrp && (
                      <p className="text-sm text-gray-600">₹{product.mrp}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No products found</p>
            <Link
              href="/products/new"
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800"
            >
              Add Your First Product
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
