import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import StoreSelector from '@/components/StoreSelector'
import type { User } from '@/lib/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile, error } = await supabase
    .from('users')
    .select('*, stores(*)')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/setup')
  }

  const userProfile = profile as User & { stores: any }

  // Get today's stats
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let salesQuery = supabase
    .from('stock_movements')
    .select('quantity_change', { count: 'exact' })
    .eq('event_type', 'SALE')
    .gte('created_at', today.toISOString())

  if (profile.role === 'staff' && profile.store_id) {
    salesQuery = salesQuery.eq('store_id', profile.store_id)
  }

  const { count: todaySales } = await salesQuery

  // Get low stock count
  let lowStockQuery = supabase
    .from('inventory')
    .select('*', { count: 'exact' })
    .lt('quantity', 5)
    .gt('quantity', 0)

  if (profile.role === 'staff' && profile.store_id) {
    lowStockQuery = lowStockQuery.eq('store_id', profile.store_id)
  }

  const { count: lowStockCount } = await lowStockQuery

  // Get total inventory value (owners/managers only)
  let totalItems = 0
  if (['owner', 'manager'].includes(profile.role)) {
    const { data: inventoryData } = await supabase
      .from('inventory')
      .select('quantity')
    
    totalItems = inventoryData?.reduce((sum, item) => sum + item.quantity, 0) || 0
  }

  // Recent activity
  let activityQuery = supabase
    .from('stock_movements')
    .select(`
      *,
      product_variants (
        size,
        color,
        products (brand, model_name)
      ),
      stores (name),
      users (full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  if (profile.role === 'staff' && profile.store_id) {
    activityQuery = activityQuery.eq('store_id', profile.store_id)
  }

  const { data: recentActivity } = await activityQuery

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/adtani-footwear-logo.png" alt="Adtani Footwear" className="h-16 w-auto" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Adtani Footwear</h1>
                <p className="text-sm text-gray-600">{profile.full_name} • {profile.role}</p>
              </div>
            </div>
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </form>
          </div>
          {profile.role === 'staff' && userProfile.stores && (
            <div className="mt-3">
              <StoreSelector storeName={userProfile.stores.name} />
            </div>
          )}
        </div>
      </header>

      <main className="pb-20">
        <div className="px-4 py-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <QuickStatCard title="Today's Sales" value={Math.abs(todaySales || 0).toString()} />
            <QuickStatCard title="Low Stock Items" value={(lowStockCount || 0).toString()} alert={(lowStockCount || 0) > 0} />
            {['owner', 'manager'].includes(profile.role) && (
              <>
                <QuickStatCard title="Total Inventory" value={totalItems.toString()} />
                <QuickStatCard title="Manage Stores" value="View" link="/stores" />
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/sale"
                className="bg-green-600 text-white rounded-lg p-4 hover:bg-green-700 active:scale-95 transition-transform"
              >
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-semibold">Quick Sale</p>
                <p className="text-xs opacity-90">Scan barcode</p>
              </Link>

              {['owner', 'manager'].includes(profile.role) && (
                <Link
                  href="/stock"
                  className="bg-blue-600 text-white rounded-lg p-4 hover:bg-blue-700 active:scale-95 transition-transform"
                >
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p className="font-semibold">Add Stock</p>
                  <p className="text-xs opacity-90">Allocate to stores</p>
                </Link>
              )}

              <Link
                href="/inventory"
                className="bg-gray-700 text-white rounded-lg p-4 hover:bg-gray-800 active:scale-95 transition-transform"
              >
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="font-semibold">View Inventory</p>
                <p className="text-xs opacity-90">All products</p>
              </Link>

              {['owner', 'manager'].includes(profile.role) && (
                <Link
                  href="/transfers"
                  className="bg-purple-600 text-white rounded-lg p-4 hover:bg-purple-700 active:scale-95 transition-transform"
                >
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <p className="font-semibold">Transfers</p>
                  <p className="text-xs opacity-90">Between stores</p>
                </Link>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          {recentActivity && recentActivity.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Recent Activity</h2>
              <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="p-3">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.product_variants?.products?.brand} {activity.product_variants?.products?.model_name}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        activity.event_type === 'SALE' ? 'bg-green-100 text-green-800' :
                        activity.event_type === 'NEW_STOCK' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.event_type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Size {activity.product_variants?.size} • {activity.product_variants?.color} • {Math.abs(activity.quantity_change)} pairs
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.stores?.name} • {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Navigation role={profile.role} />
    </div>
  )
}

function QuickStatCard({ title, value, alert, link }: { title: string; value: string; alert?: boolean; link?: string }) {
  const content = (
    <div className={`bg-white rounded-lg p-4 shadow-sm border ${alert ? 'border-red-300' : 'border-gray-200'}`}>
      <p className="text-sm text-gray-600">{title}</p>
      <p className={`text-2xl font-bold mt-1 ${alert ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
    </div>
  )

  return link ? <Link href={link}>{content}</Link> : content
}
