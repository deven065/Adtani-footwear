import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProductForm from '@/components/ProductForm'

export default async function NewProductPage() {
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

  if (!profile || !['owner', 'manager'].includes(profile.role)) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <a href="/products" className="text-blue-600 text-sm">← Back</a>
          <h1 className="text-xl font-bold text-gray-900 mt-2">Add New Product</h1>
        </div>
      </header>

      <main className="px-4 py-6">
        <ProductForm userId={user.id} />
      </main>
    </div>
  )
}
