import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import InventoryList from '@/components/InventoryList'
import SearchBar from '@/components/SearchBar'

interface InventoryPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
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

  const params = await searchParams
  const query = params.q || ''

  // Build inventory query based on role
  let inventoryQuery = supabase
    .from('inventory_with_details')
    .select('*')
    .gt('quantity', 0)

  // Staff can only see their store's inventory
  if (profile.role === 'staff' && profile.store_id) {
    inventoryQuery = inventoryQuery.eq('store_id', profile.store_id)
  }

  // Search filter
  if (query) {
    inventoryQuery = inventoryQuery.or(
      `brand.ilike.%${query}%,model_name.ilike.%${query}%,barcode.ilike.%${query}%`
    )
  }

  const { data: inventory, error } = await inventoryQuery
    .order('brand', { ascending: true })
    .order('model_name', { ascending: true })
    .limit(50)

  if (error) {
    console.error('Error fetching inventory:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Inventory</h1>
          </div>
          <div>
            <SearchBar />
          </div>
        </div>
      </header>

      <main className="px-4 py-4">
        {inventory && inventory.length > 0 ? (
          <InventoryList items={inventory} userRole={profile.role} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {query ? 'No items found' : 'No inventory available'}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
