import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function TransfersPage() {
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

  // Fetch transfers
  const { data: transfers } = await supabase
    .from('stock_transfers')
    .select(`
      *,
      product_variants (
        size,
        color,
        products (brand, model_name)
      ),
      from_stores:from_store_id (name),
      to_stores:to_store_id (name),
      requested:requested_by (full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_transit: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Stock Transfers</h1>
            <p className="text-sm text-gray-600">Move stock between stores</p>
          </div>
          <Link
            href="/transfers/new"
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 active:scale-95 transition-transform"
          >
            + New Transfer
          </Link>
        </div>
      </header>

      <main className="px-4 py-4">
        {transfers && transfers.length > 0 ? (
          <div className="space-y-3">
            {transfers.map((transfer) => (
              <Link
                key={transfer.id}
                href={`/transfers/${transfer.id}`}
                className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {transfer.product_variants?.products?.brand} {transfer.product_variants?.products?.model_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Size {transfer.product_variants?.size} • {transfer.product_variants?.color}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[transfer.status]}`}>
                    {transfer.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span className="font-medium">{transfer.from_stores?.name}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <span className="font-medium">{transfer.to_stores?.name}</span>
                  <span className="ml-auto font-semibold">{transfer.quantity} pairs</span>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>By {transfer.requested?.full_name}</span>
                  <span>{new Date(transfer.created_at).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <p className="text-gray-500 mb-4">No transfers yet</p>
            <Link
              href="/transfers/new"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first transfer
            </Link>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around py-2">
          <Link href="/dashboard" className="flex flex-col items-center px-4 py-2 text-gray-600 hover:text-gray-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/stock" className="flex flex-col items-center px-4 py-2 text-gray-600 hover:text-gray-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-xs mt-1">Stock</span>
          </Link>
          <div className="flex flex-col items-center px-4 py-2 text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span className="text-xs mt-1 font-medium">Transfers</span>
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
