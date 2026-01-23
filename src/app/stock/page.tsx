import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function StockPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || !['owner', 'manager'].includes(profile.role)) {
    redirect('/dashboard')
  }

  // Get all products with variants
  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      product_variants (
        id,
        size,
        color,
        barcode,
        inventory (
          store_id,
          quantity,
          stores (name)
        )
      )
    `)
    .eq('is_active', true)
    .order('brand', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Stock Allocation</h1>
            <p className="text-sm text-gray-600">Allocate new stock to stores</p>
          </div>
        </div>
      </header>

      <main className="px-4 py-4">
        <div className="space-y-4">
          {products?.map((product) => (
            <div key={product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">{product.brand} - {product.model_name}</h3>
                <p className="text-sm text-gray-600">{product.category}</p>
              </div>
              
              <div className="divide-y divide-gray-200">
                {product.product_variants?.map((variant: any) => (
                  <Link
                    key={variant.id}
                    href={`/stock/allocate/${variant.id}`}
                    className="block p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">
                          Size {variant.size} • {variant.color}
                        </p>
                        {variant.barcode && (
                          <p className="text-xs text-gray-500 font-mono">{variant.barcode}</p>
                        )}
                        <div className="flex gap-2 mt-1">
                          {variant.inventory?.map((inv: any) => (
                            <span key={inv.store_id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {inv.stores?.name}: {inv.quantity}
                            </span>
                          ))}
                          {(!variant.inventory || variant.inventory.length === 0) && (
                            <span className="text-xs text-gray-400">No stock</span>
                          )}
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {(!products || products.length === 0) && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No products found</p>
              <Link
                href="/products/new"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Add your first product
              </Link>
            </div>
          )}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around py-2">
          <Link href="/dashboard" className="flex flex-col items-center px-4 py-2 text-gray-600 hover:text-gray-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/inventory" className="flex flex-col items-center px-4 py-2 text-gray-600 hover:text-gray-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-xs mt-1">Inventory</span>
          </Link>
          <div className="flex flex-col items-center px-4 py-2 text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-xs mt-1 font-medium">Stock</span>
          </div>
          <Link href="/products" className="flex flex-col items-center px-4 py-2 text-gray-600 hover:text-gray-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="text-xs mt-1">Products</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
