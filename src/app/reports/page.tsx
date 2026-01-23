import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'

export default async function ReportsPage() {
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

  if (!profile) {
    redirect('/login')
  }

  // Only owners and managers can access reports
  if (profile.role === 'staff') {
    redirect('/dashboard')
  }

  // Get date range (last 30 days)
  const today = new Date()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(today.getDate() - 30)

  // Get sales summary
  const { data: salesData } = await supabase
    .from('stock_movements')
    .select('quantity_change, price_per_unit, created_at, stores(name)')
    .eq('event_type', 'SALE')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false })

  const totalSales = salesData?.reduce((sum, item) => sum + Math.abs(item.quantity_change), 0) || 0
  const totalRevenue = salesData?.reduce((sum, item) => 
    sum + (Math.abs(item.quantity_change) * (item.price_per_unit || 0)), 0
  ) || 0

  // Get low stock items
  let lowStockQuery = supabase
    .from('inventory_with_details')
    .select('*')
    .lt('quantity', 5)
    .gt('quantity', 0)
    .order('quantity', { ascending: true })
    .limit(10)

  if (profile.role !== 'owner' && profile.store_id) {
    lowStockQuery = lowStockQuery.eq('store_id', profile.store_id)
  }

  const { data: lowStockItems } = await lowStockQuery

  // Get top selling products
  const { data: topProducts } = await supabase
    .from('stock_movements')
    .select(`
      quantity_change,
      product_variants(
        id,
        size,
        color,
        products(brand, model_name)
      )
    `)
    .eq('event_type', 'SALE')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .limit(100)

  // Aggregate top products
  const productSales = new Map()
  topProducts?.forEach((item: any) => {
    const variant = item.product_variants
    if (variant && Array.isArray(variant.products) && variant.products.length > 0) {
      const product = variant.products[0]
      const key = `${product.brand} ${product.model_name}`
      const current = productSales.get(key) || 0
      productSales.set(key, current + Math.abs(item.quantity_change))
    }
  })

  const topSellingProducts = Array.from(productSales.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Reports</h1>
          </div>
          <p className="text-sm text-gray-600 mt-1">Last 30 days</p>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Total Sales</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalSales}</p>
            <p className="text-xs text-gray-500 mt-1">pairs sold</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Revenue</p>
            <p className="text-2xl font-bold text-green-600 mt-1">₹{totalRevenue.toFixed(0)}</p>
            <p className="text-xs text-gray-500 mt-1">last 30 days</p>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Top Selling Products</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {topSellingProducts.length > 0 ? (
              topSellingProducts.map(([product, quantity], index) => (
                <div key={product} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{quantity}</p>
                    <p className="text-xs text-gray-500">pairs</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No sales data available
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-lg border border-red-200">
          <div className="p-4 border-b border-red-200 bg-red-50">
            <h2 className="font-semibold text-red-900 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Low Stock Items
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {lowStockItems && lowStockItems.length > 0 ? (
              lowStockItems.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.brand} {item.model_name}</p>
                    <p className="text-sm text-gray-600">Size {item.size} • {item.color}</p>
                    {profile.role === 'owner' && (
                      <p className="text-xs text-gray-500 mt-1">{item.store_name}</p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className={`text-xl font-bold ${
                      item.quantity <= 2 ? 'text-red-600' : 'text-orange-600'
                    }`}>
                      {item.quantity}
                    </p>
                    <p className="text-xs text-gray-500">left</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                All items are well stocked
              </div>
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Recent Sales</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {salesData && salesData.length > 0 ? (
              salesData.slice(0, 10).map((sale: any, index: number) => (
                <div key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {Math.abs(sale.quantity_change)} pairs
                      </p>
                      {sale.stores && Array.isArray(sale.stores) && sale.stores.length > 0 && (
                        <p className="text-sm text-gray-600">{sale.stores[0].name}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(sale.created_at).toLocaleString()}
                      </p>
                    </div>
                    {sale.price_per_unit && (
                      <div className="text-right ml-4">
                        <p className="font-bold text-green-600">
                          ₹{(Math.abs(sale.quantity_change) * sale.price_per_unit).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No recent sales
              </div>
            )}
          </div>
        </div>
      </main>

      <Navigation role={profile.role} />
    </div>
  )
}
