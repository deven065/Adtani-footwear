import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function StoresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'owner') {
    redirect('/dashboard')
  }

  const { data: stores } = await supabase
    .from('stores')
    .select('*')
    .order('name')

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <Link href="/dashboard" className="text-blue-600 text-sm">← Back</Link>
          <h1 className="text-xl font-bold text-gray-900 mt-2">Store Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage all store locations</p>
        </div>
      </header>

      <main className="px-4 py-6">
        <Link
          href="/stores/new"
          className="block w-full bg-gray-900 text-white text-center py-4 rounded-lg text-lg font-medium hover:bg-gray-800 active:scale-95 transition-transform mb-6"
        >
          + Add New Store
        </Link>

        <div className="space-y-3">
          {stores && stores.length > 0 ? (
            stores.map((store) => (
              <Link
                key={store.id}
                href={`/stores/${store.id}`}
                className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 active:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{store.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{store.city}</p>
                    {store.phone && (
                      <p className="text-sm text-gray-500 mt-1">📞 {store.phone}</p>
                    )}
                  </div>
                  <div className="ml-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      store.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {store.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500">No stores found</p>
              <p className="text-sm text-gray-400 mt-2">Add your first store to get started</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
